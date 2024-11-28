from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlite3 import Connection, Cursor
from ..database.db import get_db

router = APIRouter(
    prefix="/rooms",
    tags=["rooms"],
    responses={404: {"description": "Not found"}},
)

latest_id = 0

class RoomModel(BaseModel):
    name: str = ""
    description: str | None = None

@router.get("")
async def get_all_rooms(db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    cursor.execute("SELECT * FROM rooms ORDER BY id DESC")
    rooms = cursor.fetchall()
    return [dict(room) for room in rooms]

@router.post("")
async def create_room(room: RoomModel, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    room = room.model_dump()
    cursor.execute('''
        INSERT INTO rooms (name, description)
        VALUES (:name, :description)
    ''', room)
    room["id"] = cursor.lastrowid
    # if the name was null, set it to "Character {id}"
    if room["name"] == "" or room["name"] is None:
        room["name"] = f"Room {character['id']}"
        cursor.execute("UPDATE rooms SET name = :name WHERE id = :id", room)
    conn.commit()
    return room
    

@router.get("/{id}")
async def get_room(id: int, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    cursor.execute("SELECT * FROM rooms WHERE id = :id", {"id": id})
    character = cursor.fetchone()
    if not character:
        raise HTTPException(status_code=404, detail="Room not found")
    return dict(character)
    

@router.put("/{id}")
async def update_room(id: int, room: RoomModel, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    room = room.model_dump()
    cursor.execute('''
        UPDATE rooms
        SET name = :name, description = :description
        WHERE id = :id
    ''', {**room, "id": id})
    conn.commit()
    return room

@router.delete("/{id}")
async def delete_room(id: int, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    cursor.execute("DELETE FROM rooms WHERE id = :id", {"id": id})
    conn.commit()
    return {"message": "Room deleted successfully"}