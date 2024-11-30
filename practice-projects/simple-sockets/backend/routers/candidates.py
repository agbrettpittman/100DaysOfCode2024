from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlite3 import Connection, Cursor
from ..database.db import get_db

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
async def get_all_candidates(name: str = "", title: str = "", db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    where_statement = ""
    where_clauses = []
    if name:
        where_clauses.append("name LIKE :name")
    if title:
        where_clauses.append("title LIKE :title")
    if where_clauses:
        where_statement = f"WHERE {' AND '.join(where_clauses)}"
    query = f'''
        SELECT * FROM candidates
        {where_statement}
        ORDER BY id DESC
    '''
    cursor.execute(query, {"name": f"%{name}%", "title": f"%{title}%"})
    candidates = cursor.fetchall()
    return [dict(candidate) for candidate in candidates]

@router.post("")
async def create_candidate(candidate: CandidateModel, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    candidate = candidate.model_dump()
    if (candidate["name"] == "" or candidate["name"] is None) or (candidate["title"] == "" or candidate["title"] is None):
        raise HTTPException(status_code=400, detail="Name and title cannot be empty")
    cursor.execute('''
        INSERT INTO candidates (name, title)
        VALUES (:name, :title)
    ''', candidate)
    candidate["id"] = cursor.lastrowid
    conn.commit()
    return candidate

@router.get("/{id}")
async def get_candidate(id: int, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    cursor.execute("SELECT * FROM candidates WHERE id = :id", {"id": id})
    candidate = cursor.fetchone()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return_dict = dict(candidate)
    return return_dict

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