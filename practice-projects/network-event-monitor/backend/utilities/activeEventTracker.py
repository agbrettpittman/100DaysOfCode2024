import logging
from .dbConn import get_db

logger = logging.getLogger("uvicorn")

class create_tracker:

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            logger.info("Initialized Active Event Tracker")
        return cls._instance
    
    def __init__(self):
        self._instance = self
        self.active_events = {}
        self.widget_registry = {}

    def get_active_events(self):
        with get_db() as (cursor, conn):
            cursor.execute('''
                SELECT * FROM events 
                WHERE 
                    start <= CURRENT_TIMESTAMP
                    AND end >= CURRENT_TIMESTAMP
            ''')
            results = cursor.fetchall()
            events = {}
            for event in results:
                events[event["id"]] = {
                    "status": "",
                    "failure_history": []
                }
            
            return events
        
    def register_widget(self, name, start_function, stop_function):
        self.widget_registry[name] = {
            "start": start_function,
            "stop": stop_function
        }
active_event_tracker = create_tracker()