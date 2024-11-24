from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlite3 import Connection, Cursor
from ..database.db import get_db

router = APIRouter(
    prefix="/characters",
    tags=["characters"],
    responses={404: {"description": "Not found"}},
)

characters_db = []
latest_id = 0

class CharacterModel(BaseModel):
    creator: str
    name: str = ""
    description: str | None = None
    heightFeet: int | None = None
    heightInches: int | None = None
    weight: int | None = None
    age: int | None = None
    primaryWeapon: str | None = None
    secondaryWeapon: str | None = None

@router.get("")
async def get_all_characters(creator: str = "", db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    where_statements = []
    if creator: where_statements.append(f"creator = :creator")
    where_clause = f"WHERE {' AND '.join(where_statements)}" if where_statements else ""
    cursor.execute(f"SELECT * FROM characters {where_clause}", {"creator": creator})
    characters = cursor.fetchall()
    return_characters = []
    for character in characters:
        return_characters.append(dict(character))
    print(return_characters)
    return return_characters

@router.post("")
async def create_character(character: CharacterModel, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    character = character.model_dump()
    cursor.execute('''
        INSERT INTO characters (
            creator, name, description, heightFeet, heightInches, 
            weight, age, primaryWeapon, secondaryWeapon
        )
        VALUES (
            :creator, :name, :description, :heightFeet, :heightInches, 
            :weight, :age, :primaryWeapon, :secondaryWeapon
        )
    ''', character)
    character["id"] = cursor.lastrowid
    # if the name was null, set it to "Character {id}"
    if character["name"] == "" or character["name"] is None:
        character["name"] = f"Character {character['id']}"
        cursor.execute("UPDATE characters SET name = :name WHERE id = :id", character)
    conn.commit()
    return character
    

@router.get("/{id}")
async def get_character(id: int, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    cursor.execute("SELECT * FROM characters WHERE id = :id", {"id": id})
    character = cursor.fetchone()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    return dict(character)
    

@router.put("/{id}")
async def update_character(id: int, character: CharacterModel, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    character = character.model_dump()
    cursor.execute('''
        UPDATE characters SET
            creator = :creator,
            name = :name,
            description = :description,
            heightFeet = :heightFeet,
            heightInches = :heightInches,
            weight = :weight,
            age = :age,
            primaryWeapon = :primaryWeapon,
            secondaryWeapon = :secondaryWeapon
        WHERE id = :id
    ''', {**character, "id": id})
    conn.commit()
    return character

@router.delete("/{id}")
async def delete_character(id: int, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    cursor.execute("DELETE FROM characters WHERE id = :id", {"id": id})
    conn.commit()
    return {"message": "Character deleted successfully"}