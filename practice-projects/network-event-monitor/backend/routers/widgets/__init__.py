import os, logging, importlib.util
from fastapi import APIRouter
from utilities.dbConn import get_db
from utilities.widget_registry import widget_registry

router = APIRouter(
    prefix="/widgets",
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger("uvicorn")

base_package_root = "routers.widgets"
skippable_dirs = ["__pycache__"]

def package_to_path(package: str):
    return f"./{'/'.join(package.split('.'))}"

def include_widget_subdir(widgets_subdir: str, sub_router: APIRouter):
    package_root = f"{base_package_root}.{widgets_subdir}"
    widget_routers_path = package_to_path(package_root)
    for widget_router_dir in os.listdir(widget_routers_path):
        if widget_router_dir in skippable_dirs: continue
        subdir_path = os.path.join(widget_routers_path, widget_router_dir)
        # skip anything that is not a directory

        
        if not os.path.isdir(subdir_path): continue
        module_name = f"{package_root}.{widget_router_dir}"
        module = importlib.import_module(module_name)

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
        
        sub_router.include_router(module.router)
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

def include_widget_routers():
    # Dynamically import and include routers from subdirectories
    base_widgets_path = package_to_path(base_package_root)
    for subdir in os.listdir(base_widgets_path):
        if subdir in skippable_dirs: continue
        if not os.path.isdir(os.path.join(base_widgets_path, subdir)): continue
        sub_router = APIRouter(
            prefix=f"/{subdir}",
            responses={404: {"description": "Not found"}},
        )
        include_widget_subdir(subdir, sub_router)
        router.include_router(sub_router)
        
    