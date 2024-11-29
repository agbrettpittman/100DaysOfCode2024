from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlite3 import Connection, Cursor
from ..database.db import get_db

router = APIRouter(
    prefix="/rooms",
    tags=["rooms"],
    responses={404: {"description": "Not found"}},
)
router = APIRouter(
    prefix="/candidates",
    tags=["candidates"],
    responses={404: {"description": "Not found"}},
)
latest_id = 0

class CandidateModel(BaseModel):
    name: str = ""
    title: str | None = None

@router.get("")
async def get_all_candidates(db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    cursor.execute("SELECT * FROM candidates ORDER BY id DESC")
    candidates = cursor.fetchall()
    return [dict(candidate) for candidate in candidates]

@router.post("")
async def create_candidate(candidate: CandidateModel, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    candidate = candidate.model_dump()
    cursor.execute('''
        INSERT INTO candidates (name, title)
        VALUES (:name, :title)
    ''', candidate)
    candidate["id"] = cursor.lastrowid
    # if the name was null, set it to "Candidate {id}"
    if candidate["name"] == "" or candidate["name"] is None:
        candidate["name"] = f"Candidate {candidate['id']}"
        cursor.execute("UPDATE candidates SET name = :name WHERE id = :id", candidate)
    conn.commit()
    return candidate

@router.get("/{id}")
async def get_candidate(id: int, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    cursor.execute("SELECT * FROM candidates WHERE id = :id", {"id": id})
    candidate = cursor.fetchone()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return dict(candidate)

@router.put("/{id}")
async def update_candidate(id: int, candidate: CandidateModel, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    candidate = candidate.model_dump()
    cursor.execute('''
        UPDATE candidates
        SET name = :name, title = :title
        WHERE id = :id
    ''', {**candidate, "id": id})
    conn.commit()
    return candidate

@router.delete("/{id}")
async def delete_candidate(id: int, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    cursor.execute("DELETE FROM candidates WHERE id = :id", {"id": id})
    conn.commit()
    return {"message": "Candidate deleted successfully"}
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