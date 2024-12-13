from fastapi import APIRouter

title = "Ping Plotter"
router = APIRouter(
    prefix="/pingPlotter",
    tags=["Ping Plotter"],
    responses={404: {"description": "Not found"}},
)