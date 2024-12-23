from fastapi import APIRouter
from .routers import plotters
from .utilities.db import initialize_database

title = "Ping Plotter"

db_init = initialize_database

def start(id:int = None):
    print(f"Ping Plotter router {id} started")

def stop(id:int = None):
    print(f"Ping Plotter router {id} stopped")

router = APIRouter(
    prefix="/ping-plotter",
    tags=[title],
    responses={404: {"description": "Not found"}},
)

router.include_router(plotters.router)

