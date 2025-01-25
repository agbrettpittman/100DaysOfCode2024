import inspect, random, string
from fastapi import APIRouter, Depends, HTTPException, WebSocket
from pydantic import BaseModel, field_validator
from sqlite3 import Connection, Cursor
from datetime import datetime, timedelta
from logging import getLogger
from utilities.dbConn import db_dep
from utilities.utils import handle_route_exception
from utilities.eventSocketHandler import event_sockets
from utilities.eventManagement.event_handler import event_handler

router = APIRouter(
    prefix="/events",
    tags=["Events"],
    responses={404: {"description": "Not found"}},
)

logger = getLogger("uvicorn")

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
        
class WidgetModel(BaseModel):
    widgetName: str
    widget_id: int


@router.get("")
async def get_all_events(db: tuple[Cursor, Connection] = Depends(db_dep)):
    cursor, conn = db
    try:
        cursor.execute("SELECT * FROM events ORDER BY start DESC")
        events = cursor.fetchall()
        return events
    except Exception as e:
        handle_route_exception(e)


@router.post("")
async def create_event(event: EventModel, db: tuple[Cursor, Connection] = Depends(db_dep)):
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
    finally:
        conn.close()
        try:
            await event_handler.update_active_events()
        except Exception as e:
            handle_route_exception(e)
    

@router.websocket("/ws/{event_id}")
async def get_plotter_results(websocket: WebSocket, event_id: int):
    await event_sockets.new_connection(websocket, event_id)
    

@router.get("/{id}")
async def get_event(id: int, db: tuple[Cursor, Connection] = Depends(db_dep)):
    cursor, conn = db
    cursor.execute("SELECT * FROM events WHERE id = :id", {"id": id})
    event = cursor.fetchone()
    event = dict(event)

    cursor.execute("SELECT * FROM widgetMappings WHERE event_id = :id", {"id": id})
    widgets = cursor.fetchall()
    event["widgets"] = widgets
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    return event
    

@router.put("/{id}")
async def update_event(id: int, event: EventModel, db: tuple[Cursor, Connection] = Depends(db_dep)):
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
async def delete_event(id: int, db: tuple[Cursor, Connection] = Depends(db_dep)):
    cursor, conn = db
    cursor.execute("DELETE FROM events WHERE id = :id", {"id": id})
    conn.commit()
    return {"message": "Event deleted successfully"}

@router.get("/{id}/widgets")
async def get_event_widgets(id: int, db: tuple[Cursor, Connection] = Depends(db_dep)):
    cursor, conn = db
    cursor.execute('SELECT * FROM widgetMappings WHERE event_id = :id', {"id": id})
    widgets = cursor.fetchall()
    return widgets

@router.post("/{id}/widgets")
async def add_widget_to_event(id: int, widget: WidgetModel, db: tuple[Cursor, Connection] = Depends(db_dep)):
    cursor, conn = db
    widget = widget.model_dump()
    try:

        cursor.execute("SELECT * FROM events WHERE id = :id", {"id": id})
        event = cursor.fetchone()
        event = dict(event)

        # if the end of the event has passed, don't allow new widgets to be added
        if datetime.now() > datetime.strptime(event["end"], "%Y-%m-%d %H:%M:%S"):
            raise HTTPException(status_code=409, detail="Event has already ended")

        event_mapping_query = '''
            INSERT INTO widgetMappings
            (widgetName, event_id, widget_id)
            VALUES (:widgetName, :event_id, :widget_id)
        '''
        event_mapping_dict = {
            "event_id": id,
            "widget_id": widget["widget_id"],
            "widgetName": widget["widgetName"]
        }
        cursor.execute(event_mapping_query, event_mapping_dict)

        if id in event_handler.running_events:
            widget_to_add = {
                "id": cursor.lastrowid,
                **event_mapping_dict
            }
            await event_handler.running_events[id].add_widget(widget_to_add)

        conn.commit()
        return widget
    except Exception as e:
        handle_route_exception(e)

@router.delete("/{id}/widgets/{widgetmapping_id}")
async def remove_widget_from_event(id: int, widgetmapping_id: int, db: tuple[Cursor, Connection] = Depends(db_dep)):
    cursor, conn = db
    params = {"event_id": id, "widgetmapping_id": widgetmapping_id}
    original_widget_query = '''
        SELECT * FROM widgetMappings
        WHERE event_id = :event_id AND id = :widgetmapping_id
    '''
    cursor.execute(original_widget_query, params)
    widget = cursor.fetchone()
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found in event")
    
    if id in event_handler.running_events:
        await event_handler.running_events[id].remove_widget(widgetmapping_id)

    cursor.execute('''
        DELETE FROM widgetMappings
        WHERE event_id = :event_id AND id = :widgetmapping_id
    ''', params)
    
    conn.commit()
    return {"message": "Widget removed from event successfully"}