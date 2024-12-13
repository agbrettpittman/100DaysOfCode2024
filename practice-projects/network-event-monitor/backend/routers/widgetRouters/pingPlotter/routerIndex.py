from fastapi import APIRouter
from .routers import plotters

title = "Ping Plotter"
router = APIRouter(
    prefix="/pingPlotter",
    tags=[title],
    responses={404: {"description": "Not found"}},
)

router.include_router(plotters.router)

