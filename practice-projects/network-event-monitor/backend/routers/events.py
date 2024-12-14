import inspect, random, string
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
from sqlite3 import Connection, Cursor
from utilities.dbConn import get_db
from utilities.utils import handle_route_exception
from datetime import datetime, timedelta

router = APIRouter(
    prefix="/events",
    tags=["Events"],
    responses={404: {"description": "Not found"}},
)

class EventModel(BaseModel):
    referenceID: str | None = None
    eventName: str | None = None
    description: str | None = None
    start: str | None = None
    end: str | None = None

    @field_validator("start", "end")
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
        cursor.execute("SELECT * FROM events ORDER BY start DESC")
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

    if not event["start"]:
        event["start"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if not event["end"]:
        # default event duration is 2 hours from the start
        event["end"] = (datetime.now() + timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S")

    try:
        cursor.execute('''
            INSERT INTO events (eventName, description, referenceID, start, end)
            VALUES (:eventName, :description, :referenceID, :start, :end)
        ''', event)
        event["id"] = cursor.lastrowid
        conn.commit()
        return event
    except Exception as e:
        try:
            if "UNIQUE constraint failed: events.referenceID" in str(e):
                raise HTTPException(status_code=409, detail="Reference ID already exists")
            else:
                raise HTTPException(status_code=500, detail="Failed to create event")
        except Exception as e:
            handle_route_exception(e)
    

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