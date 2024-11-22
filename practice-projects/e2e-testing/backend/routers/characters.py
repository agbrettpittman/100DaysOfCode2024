from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(
    prefix="/characters",
    tags=["characters"],
    responses={404: {"description": "Not found"}},
)

characters_db = []
latest_id = 0

class CharacterModel(BaseModel):
    username: str
    name: str
    description: str | None = None
    heightFeet: int | None = None
    heightInches: int | None = None
    weight: int | None = None
    age: int | None = None
    primaryWeapon: str | None = None
    secondaryWeapon: str | None = None

@router.get("/")
async def get_all_characters(username: str = ""):
    return_characters = characters_db
    if username:
        return_characters = [character for character in characters_db if character["username"] == username]
    return return_characters

@router.post("/")
async def create_character(character: CharacterModel):
    global latest_id
    latest_id += 1
    character = character.model_dump()
    character["id"] = latest_id
    characters_db.append(character)
    return character

@router.get("/{id}")
async def get_character(id: int):
    return next((character for character in characters_db if character["id"] == id), None)

@router.put("/{id}")
async def update_character(id: int, character: CharacterModel):
    global characters_db
    character = character.model_dump()
    character["id"] = id
    characters_db = [character if character["id"] == id else character for character in characters_db]
    return character