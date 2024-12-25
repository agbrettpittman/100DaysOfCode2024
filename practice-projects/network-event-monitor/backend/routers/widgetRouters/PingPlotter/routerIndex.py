from fastapi import APIRouter
from .routers import plotters
from .utilities.db import initialize_database
from .utilities.plotter import Plotter

title = "Ping Plotter"

db_init = initialize_database

running_plotters = {}

def start(id:int = None):
    running_plotters[id] = Plotter(id)
    print(f"Ping Plotter router {id} started")

def stop(id:int = None):
    print(f"Ping Plotter router {id} stopped")

router = APIRouter(
    prefix="/ping-plotter",
    tags=[title],
    responses={404: {"description": "Not found"}},
)

router.include_router(plotters.router)

