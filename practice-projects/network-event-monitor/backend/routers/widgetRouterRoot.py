from fastapi import APIRouter
import os, importlib.util
import logging


router = APIRouter(
    prefix="/widgets",
    responses={404: {"description": "Not found"}},
)

logger = logging.getLogger("uvicorn")

widget_routers_path = './routers/widgetRouters'

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
    