import os, logging, importlib.util
from fastapi import APIRouter
from utilities.dbConn import get_db
from utilities.widget_registry import widget_registry

router = APIRouter(
    prefix="/widgets",
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger("uvicorn")

widget_routers_path = './routers/widgetRouters'

def include_widget_routers():
    # Dynamically import and include routers from subdirectories
    for widget_router_dir in os.listdir(widget_routers_path):
        subdir_path = os.path.join(widget_routers_path, widget_router_dir)
        router_index_path = os.path.join(subdir_path, "routerIndex.py")
        
        if not os.path.isdir(subdir_path) or not os.path.isfile(router_index_path): continue
        spec = importlib.util.spec_from_file_location(f"{widget_router_dir}.routerIndex", router_index_path)
        module = importlib.util.module_from_spec(spec)
        module.__package__ = f"routers.widgetRouters.{widget_router_dir}"
        spec.loader.exec_module(module)

        # Get the title of the module
        module_title = module.title if hasattr(module, "title") else widget_router_dir

        logger.info(f"Loading {module_title} widget")

        required_elements = ["router", "start", "stop"]
        missing_elements = []
        # if the widget does not have a required element, log an error and skip it
        for element in required_elements:
            if not hasattr(module, element):
                missing_elements.append(element)
        if missing_elements:
            missing_elements_str = ", ".join(missing_elements)
            logger.error(f"Widget router {widget_router_dir} is missing required elements: {missing_elements_str}. Skipping...")
            continue
        
        # Include the router from the module
        
        router.include_router(module.router)
        logger.info(f"Loaded router for {module_title}")

        # Register the widget with the active event tracker
        widget_registry.register_widget(
            name=widget_router_dir,
            start_function=module.start,
            stop_function=module.stop
        )
        logger.info(f"Registered widget {module_title} with active event tracker")

        if hasattr(module, "db_init"):
            with get_db() as (cursor, conn):
                try:
                    module.db_init(cursor)
                    conn.commit()
                except Exception as e:
                    conn.rollback()
                    logger.error(f"Failed to initialize database for {module_title}")
                    logger.error(e)

            logger.info(f"Initialized database for {module_title}")
    