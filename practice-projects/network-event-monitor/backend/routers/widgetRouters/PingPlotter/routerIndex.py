from fastapi import APIRouter
from .routers import plotters
from .utilities.db import initialize_database
from .utilities.plotterRunner import plotter_runner

title = "Ping Plotter"

db_init = initialize_database

def start(id:int = None, event_id:int = None):
    plotter_runner.add_plotter(id, event_id)

def stop(id:int = None, event_id:int = None):
    plotter_runner.remove_plotter(id)

router = APIRouter(
    prefix="/ping-plotter",
    tags=[title],
    responses={404: {"description": "Not found"}},
)

router.include_router(plotters.router)

