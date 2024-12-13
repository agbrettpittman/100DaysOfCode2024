from fastapi import APIRouter

router = APIRouter(
    prefix="/plotters",
    responses={404: {"description": "Not found"}},
)

@router.post("")
async def create_plotter():
    return {"message": "Create a plotter"}

@router.get("/by-event/{event_id}")
async def get_plotter_by_event(event_id: int):
    return {"message": f"Get plotter by event {event_id}"}

@router.get("/{id}")
async def get_plotter(plotter_id: int):
    return {"message": f"Get plotter {plotter_id}"}

@router.put("/{id}")
async def update_plotter(plotter_id: int):
    return {"message": f"Update plotter {plotter_id}"}

@router.delete("/{id}")
async def delete_plotter(plotter_id: int):
    return {"message": f"Delete plotter {plotter_id}"}

@router.get("/{id}/hosts")
async def get_plotter_hosts(plotter_id: int):
    return {"message": f"Get plotter {plotter_id} hosts"}

@router.post("/{id}/hosts")
async def add_plotter_host(plotter_id: int):
    return {"message": f"Add host to plotter {plotter_id}"}

@router.put("/{id}/hosts")
async def update_plotter_hosts(plotter_id: int):
    return {"message": f"Update plotter {plotter_id} hosts"}

# this will become a websocket route
@router.get("/{id}/results")
async def get_plotter_results(plotter_id: int):
    return {"message": f"Get plotter {plotter_id} results"}


