from fastapi import APIRouter
from .routers import plotters
from .utilities.db import initialize_database
from .utilities.plotter_runner import plotter_runner

title = "Ping Plotter"

db_init = initialize_database

async def start(id:int = None, event_id:int = None, mapping_id:int = None):
    plotter_runner.add_plotter(id, event_id, mapping_id)

async def stop(id:int = None, event_id:int = None, mapping_id:int = None):
    await plotter_runner.remove_plotter(id)

router = APIRouter(
    prefix="/ping-plotter",
    tags=[title],
    responses={404: {"description": "Not found"}},
)

router.include_router(plotters.router)

