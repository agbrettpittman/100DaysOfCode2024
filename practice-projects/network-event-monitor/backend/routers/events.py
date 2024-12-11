import inspect, random, string
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
from sqlite3 import Connection, Cursor
from utilities.dbConn import get_db
from utilities.utils import handle_route_exception
from datetime import datetime

router = APIRouter(
    prefix="/events",
    tags=["events"],
    responses={404: {"description": "Not found"}},
)

class EventModel(BaseModel):
    referenceID: str | None = None
    eventName: str | None = None
    description: str | None = None
    eventDatetime: str | None = None

    @field_validator("eventDatetime")
    def validate_event_datetime(cls, value: str):
        try:
            if (value): datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
            return value
        except ValueError:
            raise ValueError("Invalid datetime format. Please use 'YYYY-MM-DD HH:MM:SS'")


@router.get("")
async def get_all_events(db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    try:
        cursor.execute("SELECT * FROM events ORDER BY eventDatetime DESC")
        events = cursor.fetchall()
        return events
    except Exception as e:
        handle_route_exception(e)


@router.post("")
async def create_event(event: EventModel, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    event = event.model_dump()
    # generate a random 4 character string to attach to the current date for the referenceID and event name
    if (not event["referenceID"]):
        rando_str = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
        short_date = datetime.now().strftime("%-y%-m%-d")
        temp_ref = f"{short_date}.{rando_str}"
        event["referenceID"] = temp_ref
    if (not event["eventName"]):
        event["eventName"] = f"Event {event['referenceID']}"

    if not event["eventDatetime"]:
        event["eventDatetime"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute('''
        INSERT INTO events (eventName, description, referenceID, eventDatetime)
        VALUES (:eventName, :description, :referenceID, :eventDatetime)
    ''', event)
    event["id"] = cursor.lastrowid
    conn.commit()
    return event
    

@router.get("/{id}")
async def get_event(id: int, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    cursor.execute("SELECT * FROM events WHERE id = :id", {"id": id})
    event = cursor.fetchone()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    return event
    

@router.put("/{id}")
async def update_character(id: int, event: EventModel, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    event = event.model_dump(exclude_unset=True)
    event["id"] = id
    set_statements = [f"{key} = :{key}" for key in event if key != "id"]
    set_clause = ", ".join(set_statements)
    print(set_clause)
    cursor.execute(f'''
        UPDATE events SET 
            {set_clause}
        WHERE id = :id
    ''', event)
    conn.commit()
    return event
    

@router.delete("/{id}")
async def delete_character(id: int, db: tuple[Cursor, Connection] = Depends(get_db)):
    cursor, conn = db
    cursor.execute("DELETE FROM events WHERE id = :id", {"id": id})
    conn.commit()
    return {"message": "Event deleted successfully"}