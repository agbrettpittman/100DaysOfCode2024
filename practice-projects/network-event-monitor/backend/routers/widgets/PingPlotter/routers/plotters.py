import ipaddress
from fastapi import APIRouter, Depends, HTTPException, WebSocket
from utilities.dbConn import db_dep
from utilities.utils import handle_route_exception
from ..utilities.general import is_valid_hostname
from sqlite3 import Connection, Cursor
from pydantic import BaseModel, field_validator

router = APIRouter(
    prefix="/plotters",
    responses={404: {"description": "Not found"}},
)

class PlotterModel(BaseModel):
    name: str

class HostModel(BaseModel):
    host: str

    @field_validator("host")
    def validate_host(cls, value: str):
        try:
            ipaddress.ip_address(value)
            return value
        except ValueError:
            if not is_valid_hostname(value):
                raise ValueError("Invalid hostname or IP address")
            return value

@router.post("")
async def create_plotter(plotter: PlotterModel, db: tuple[Cursor, Connection] = Depends(db_dep)):
    cursor, conn = db
    plotter = plotter.model_dump()
    if not plotter["name"]:
        plotter["name"] = f"Untitled Ping Plotter"
    try:
        plotter_query = "INSERT INTO widgets_PingPlotter_plotter (name) VALUES (:name)"
        cursor.execute(plotter_query, plotter)   
        last_id = cursor.lastrowid
        conn.commit()
        return_dict = {"id": last_id, **plotter}
        return return_dict
    except Exception as e:
        conn.rollback()
        handle_route_exception(e)

@router.get("/{plotter_id}")
async def get_plotter(plotter_id: int, db: tuple[Cursor, Connection] = Depends(db_dep)):
    cursor, conn = db
    try:
        cursor.execute("SELECT * FROM widgets_PingPlotter_plotter WHERE id = ?", (plotter_id,))
        plotter = cursor.fetchone()
        return plotter
    except Exception as e:
        print(e)
        handle_route_exception(e)

@router.put("/{plotter_id}")
async def update_plotter(
    plotter_id: int, plotter: PlotterModel, db: tuple[Cursor, Connection] = Depends(db_dep)
):
    cursor, conn = db
    plotter = plotter.model_dump(exclude_unset=True)
    set_statements = [f"{key} = :{key}" for key in plotter if key != "id"]
    set_clause = ", ".join(set_statements)
    try:
        cursor.execute(f'''
            UPDATE widgets_PingPlotter_plotter SET
                {set_clause}
            WHERE id = :id
        ''', {**plotter, "id": plotter_id})
        conn.commit()
        return plotter
    except Exception as e:
        handle_route_exception(e)

@router.delete("/{plotter_id}")
async def delete_plotter(plotter_id: int, db: tuple[Cursor, Connection] = Depends(db_dep)):
    cursor, conn = db
    try:
        cursor.execute("DELETE FROM widgets_PingPlotter_plotter WHERE id = ?", (plotter_id,))
        conn.commit()
        return {"message": "Plotter deleted successfully"}
    except Exception as e:
        handle_route_exception(e)

@router.get("/{plotter_id}/hosts")
async def get_plotter_hosts(plotter_id: int, db: tuple[Cursor, Connection] = Depends(db_dep)):
    cursor, conn = db
    try:
        cursor.execute("SELECT * FROM widgets_PingPlotter_hosts WHERE plotter_id = ?", (plotter_id,))
        hosts = cursor.fetchall()
        return hosts
    except Exception as e:
        handle_route_exception(e)

@router.post("/{plotter_id}/hosts")
async def add_plotter_host(
    plotter_id: int, host: HostModel, db: tuple[Cursor, Connection] = Depends(db_dep)
):
    cursor, conn = db
    host = host.model_dump()
    try:
        cursor.execute('''
            INSERT INTO widgets_PingPlotter_hosts 
            (plotter_id, host) VALUES (:plotter_id, :host)
        ''', {**host, "plotter_id": plotter_id})
        conn.commit()
        return {"message": "Host added to plotter"}
    except Exception as e:
        handle_route_exception(e)

@router.put("/{plotter_id}/hosts/{host_id}")
async def update_plotter_host(
    plotter_id: int, host_id: int, host: HostModel, 
    db: tuple[Cursor, Connection] = Depends(db_dep)
):
    cursor, conn = db
    host = host.model_dump(exclude_unset=True)
    set_statements = [f"{key} = :{key}" for key in host if key != "id"]
    set_clause = ", ".join(set_statements)
    try:
        cursor.execute(f'''
            UPDATE widgets_PingPlotter_hosts SET
                {set_clause}
            WHERE id = :id
            AND plotter_id = :plotter_id
        ''', {**host, "id": host_id, "plotter_id": plotter_id})
        conn.commit()
        return host
    except Exception as e:
        handle_route_exception(e)

@router.delete("/{plotter_id}/hosts/{host_id}")
async def delete_plotter_host(plotter_id: int, host_id: int, db: tuple[Cursor, Connection] = Depends(db_dep)):
    cursor, conn = db
    try:
        cursor.execute(
            "DELETE FROM widgets_PingPlotter_hosts "
            "WHERE plotter_id = ? AND id = ?",
            (plotter_id, host_id)
        )
        conn.commit()
        return {"message": "Host deleted successfully"}
    except Exception as e:
        handle_route_exception(e)




