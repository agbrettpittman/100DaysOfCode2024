from fastapi import APIRouter, Depends, HTTPException, WebSocket
from pydantic import BaseModel
from sqlite3 import Connection, Cursor
from ..database.db import get_db
from ..socketHandlers.roomsId import handler as roomsIdSocketHandler

router = APIRouter(
    prefix="/rooms",
    tags=["rooms"],
    responses={404: {"description": "Not found"}},
)

roomsIdSocket = roomsIdSocketHandler()

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
        room["name"] = f"Room {room['id']}"
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
    return_dict = dict(character)
    return_dict["candidates"] = []
    candidates_query = '''
        SELECT candidates.id, candidates.name, candidates.title, room_candidates.votes
        FROM candidates
        JOIN room_candidates ON candidates.id = room_candidates.candidate_id
        WHERE room_candidates.room_id = :id
    '''
    cursor.execute(candidates_query, {"id": id})
    candidates = cursor.fetchall()
    return_dict["candidates"] = [dict(candidate) for candidate in candidates]
    return return_dict
    

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

@router.post("/{id}/candidates/{candidate_id}")
async def add_candidate_to_room(id: int, candidate_id: int, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    cursor.execute("SELECT * FROM rooms WHERE id = :id", {"id": id})
    room = cursor.fetchone()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    cursor.execute("SELECT * FROM candidates WHERE id = :id", {"id": candidate_id})
    candidate = cursor.fetchone()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    cursor.execute("INSERT INTO room_candidates (room_id, candidate_id) VALUES (:room_id, :candidate_id)", {"room_id": id, "candidate_id": candidate_id})
    conn.commit()
    return {"message": "Candidate added to room successfully"}

@router.delete("/{id}/candidates/{candidate_id}")
async def remove_candidate_from_room(id: int, candidate_id: int, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    cursor.execute("DELETE FROM room_candidates WHERE room_id = :room_id AND candidate_id = :candidate_id", {"room_id": id, "candidate_id": candidate_id})
    conn.commit()
    return {"message": "Candidate removed from room successfully"}

@router.post("/{id}/candidates/{candidate_id}/vote")
async def vote_for_candidate(id: int, candidate_id: int, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    cursor.execute("SELECT * FROM rooms WHERE id = :id", {"id": id})
    room = cursor.fetchone()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    cursor.execute("SELECT * FROM candidates WHERE id = :id", {"id": candidate_id})
    candidate = cursor.fetchone()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    cursor.execute('''
        SELECT * FROM room_candidates 
        WHERE 
            room_id = :room_id 
            AND candidate_id = :candidate_id
    ''', {"room_id": id, "candidate_id": candidate_id})
    room_candidate = cursor.fetchone()
    if not room_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found in room")
    cursor.execute('''
        UPDATE room_candidates 
        SET votes = votes + 1 
        WHERE 
            room_id = :room_id 
            AND candidate_id = :candidate_id
    ''', {"room_id": id, "candidate_id": candidate_id})
    conn.commit()
    return {"message": "Vote added successfully"}

@router.delete("/{id}/candidates/{candidate_id}/vote")
async def remove_vote_for_candidate(id: int, candidate_id: int, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    cursor.execute("SELECT * FROM rooms WHERE id = :id", {"id": id})
    room = cursor.fetchone()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    cursor.execute("SELECT * FROM candidates WHERE id = :id", {"id": candidate_id})
    candidate = cursor.fetchone()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    cursor.execute('''
        SELECT * FROM room_candidates 
        WHERE 
            room_id = :room_id 
            AND candidate_id = :candidate_id
    ''', {"room_id": id, "candidate_id": candidate_id})
    room_candidate = cursor.fetchone()
    if not room_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found in room")
    # verify that the vote count is not already 0
    cursor.execute('''
        SELECT votes FROM room_candidates 
        WHERE 
            room_id = :room_id 
            AND candidate_id = :candidate_id
    ''', {"room_id": id, "candidate_id": candidate_id})
    votes = cursor.fetchone()
    if votes["votes"] == 0:
        raise HTTPException(status_code=400, detail="Vote count is already 0")
    
    cursor.execute('''
        UPDATE room_candidates 
        SET votes = CASE 
            WHEN votes - 1 < 0 THEN 0 
            ELSE votes - 1 
        END
        WHERE 
            room_id = :room_id 
            AND candidate_id = :candidate_id
    ''', {"room_id": id, "candidate_id": candidate_id})
    conn.commit()
    return {"message": "Vote removed successfully"}

@router.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: int):
    await roomsIdSocket.handle_new_connection(websocket, room_id)