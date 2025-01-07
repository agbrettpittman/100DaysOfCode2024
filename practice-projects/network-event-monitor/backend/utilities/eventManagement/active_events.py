import logging
from datetime import datetime
from utilities.dbConn import get_db

logger = logging.getLogger("uvicorn")

class ActiveEventList(list):

    def to_dict(self):
        return {event["id"]: event for event in self}

class ActiveEvents:

    def __init__(self):
        self.events = ActiveEventList()
        self.widgets = []

    def query_db(self):
        with get_db() as (cursor, conn):
            current_time = datetime.now()
            current_time = current_time.strftime("%Y-%m-%d %H:%M:%S")
            cursor.execute(f'''
                SELECT * FROM events 
                WHERE 
                    start <= "{current_time}"
                    AND end >= "{current_time}"
            ''')
            self.events[:] = cursor.fetchall()

            cursor.execute(f'''
                SELECT widgetMappings.* FROM widgetMappings
                JOIN events ON widgetMappings.event_id = events.id
                WHERE 
                    events.start <= "{current_time}"
                    AND events.end >= "{current_time}"
            ''')
            self.widgets = cursor.fetchall()

    def widgets_by_event(self):
        widgets_by_event = {}
        for widget in self.widgets:
            if widget["event_id"] not in widgets_by_event:
                widgets_by_event[widget["event_id"]] = []
            widgets_by_event[widget["event_id"]].append(widget)
        return widgets_by_event