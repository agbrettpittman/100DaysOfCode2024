from fastapi import APIRouter
from .routers import plotters
from .utilities.db import initialize_database

title = "Ping Plotter"

db_init = initialize_database

router = APIRouter(
    prefix="/ping-plotter",
    tags=[title],
    responses={404: {"description": "Not found"}},
)

router.include_router(plotters.router)

