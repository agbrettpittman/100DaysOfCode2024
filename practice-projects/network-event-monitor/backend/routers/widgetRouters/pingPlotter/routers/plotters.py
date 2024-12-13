from fastapi import APIRouter

router = APIRouter(
    prefix="/plotter",
    responses={404: {"description": "Not found"}},
)

@router.post("")
async def create_plotter():
    return {"message": "Create a plotter"}