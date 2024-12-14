from fastapi import APIRouter, Depends, HTTPException
from utilities.dbConn import get_db
from utilities.utils import handle_route_exception
from sqlite3 import Connection, Cursor
from pydantic import BaseModel, field_validator

router = APIRouter(
    prefix="/plotters",
    responses={404: {"description": "Not found"}},
)

class PlotterModel(BaseModel):
    name: str
    event_id: int

@router.post("")
async def create_plotter(plotter: PlotterModel, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    plotter = plotter.model_dump()
    if not plotter["name"]:
        plotter["name"] = f"Untitled Ping Plotter"
    try:
        query = '''
            INSERT INTO widgets_pingPlotter_plotter 
            (name, event_id) VALUES (:name, :event_id)
        '''

        cursor.execute(query, plotter)
        conn.commit()
        return {"message": "Plotter created"}
    except Exception as e:
        handle_route_exception(e)

@router.get("/by-event/{event_id}")
async def get_plotter_by_event(event_id: int, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    try:
        cursor.execute("SELECT * FROM widgets_pingPlotter_plotter WHERE event_id = ?", (event_id,))
        plotter = cursor.fetchall()
        return plotter
    except Exception as e:
        handle_route_exception(e)

@router.get("/{plotter_id}")
async def get_plotter(plotter_id: int, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    try:
        cursor.execute("SELECT * FROM widgets_pingPlotter_plotter WHERE id = ?", (plotter_id,))
        plotter = cursor.fetchone()
        return plotter
    except Exception as e:
        handle_route_exception(e)

@router.put("/{plotter_id}")
async def update_plotter(
    plotter_id: int, plotter: PlotterModel, db: tuple[Cursor, Connection] = Depends(get_db)
):
    cursor, conn = db
    plotter = plotter.model_dump(exclude_unset=True)
    set_statements = [f"{key} = :{key}" for key in plotter if key != "id"]
    set_clause = ", ".join(set_statements)
    try:
        cursor.execute(f'''
            UPDATE widgets_pingPlotter_plotter SET
                {set_clause}
            WHERE id = :id
        ''', {**plotter, "id": plotter_id})
        conn.commit()
        return plotter
    except Exception as e:
        handle_route_exception(e)

@router.delete("/{plotter_id}")
async def delete_plotter(plotter_id: int, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    try:
        cursor.execute("DELETE FROM widgets_pingPlotter_plotter WHERE id = ?", (plotter_id,))
        conn.commit()
        return {"message": "Plotter deleted successfully"}
    except Exception as e:
        handle_route_exception(e)

@router.get("/{plotter_id}/hosts")
async def get_plotter_hosts(plotter_id: int):
    return {"message": f"Get plotter {plotter_id} hosts"}

@router.post("/{plotter_id}/hosts")
async def add_plotter_host(plotter_id: int):
    return {"message": f"Add host to plotter {plotter_id}"}

@router.put("/{plotter_id}/hosts")
async def update_plotter_hosts(plotter_id: int):
    return {"message": f"Update plotter {plotter_id} hosts"}

# this will become a websocket route
@router.get("/{plotter_id}/results")
async def get_plotter_results(plotter_id: int):
    return {"message": f"Get plotter {plotter_id} results"}


