import os, logging, importlib.util
from fastapi import APIRouter
from utilities.dbConn import get_db


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
        # Import the routerIndex.py module
        spec = importlib.util.spec_from_file_location(f"{widget_router_dir}.routerIndex", router_index_path)
        module = importlib.util.module_from_spec(spec)
        module.__package__ = f"routers.widgetRouters.{widget_router_dir}"
        spec.loader.exec_module(module)
        
        # Include the router from the module
        if hasattr(module, "router"):
            module_title = module.title if hasattr(module, "title") else widget_router_dir
            router.include_router(module.router)
            logger.info(f"Loaded router for {module_title}")

            if hasattr(module, "db_init"):
                db_gen = get_db()  # Get the generator
                try:
                    cursor, conn = next(db_gen)  # Retrieve the cursor and connection
                    try:
                        module.db_init(cursor)
                        conn.commit()
                    except Exception as e:
                        conn.rollback()
                        logger.error(f"Failed to initialize database for {module_title}")
                        logger.error(e)
                finally:
                    # Ensure the generator is properly finalized to close the database
                    try:
                        next(db_gen)
                    except StopIteration:
                        pass

                logger.info(f"Initialized database for {module_title}")
    