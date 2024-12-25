import logging, threading, time, asyncio
from datetime import datetime
from .dbConn import get_db

logger = logging.getLogger("uvicorn")

class create_handler:

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

    def activate(self):
        logger.info("Activating Active Event Tracker")

        def start_active_event_getter():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            async def get_active_event_loop():
                while True:
                    await self.get_active_events()
                    await asyncio.sleep(60 - time.time() % 60)  # Sleep until the next minute

            try:
                loop.run_until_complete(get_active_event_loop())  # Run the periodic task
            finally:
                loop.close()

        thread = threading.Thread(target=start_active_event_getter, daemon=True)
        thread.start()

    async def get_active_events(self):
        logger.info("Getting active events")
        found_events = []
        found_widgets = []

        with get_db() as (cursor, conn):
            current_time = datetime.now()
            current_time = current_time.strftime("%Y-%m-%d %H:%M:%S")
            cursor.execute(f'''
                SELECT * FROM events 
                WHERE 
                    start <= "{current_time}"
                    AND end >= "{current_time}"
            ''')
            found_events = cursor.fetchall()

            cursor.execute(f'''
                SELECT widgetMappings.* FROM widgetMappings
                JOIN events ON widgetMappings.event_id = events.id
                WHERE 
                    events.start <= "{current_time}"
                    AND events.end >= "{current_time}"
            ''')
            found_widgets = cursor.fetchall()

        widgets_by_event = {}
        for widget in found_widgets:
            if widget["event_id"] not in widgets_by_event:
                widgets_by_event[widget["event_id"]] = []
            widgets_by_event[widget["event_id"]].append(widget)


        for event in found_events:
            if event["id"] not in self.active_events:
                self.active_events[event["id"]] = {}
            this_event = self.active_events[event["id"]]
            event_widgets = []
            if event["id"] in widgets_by_event:
                event_widgets = widgets_by_event[event["id"]]
            for widget in event_widgets:
                if widget['widget_id'] not in this_event:
                    this_event[widget['widget_id']] = {
                        "status": "",
                        "failure_history": []
                    }
                this_widget = this_event[widget['widget_id']]
                skippable_statuses = ["halted", "active"]
                if this_widget["status"] in skippable_statuses: continue
                
                start_attempts = 0
                start_success = False

                while start_attempts < 5 and not start_success:
                    try:
                        self.widget_registry[widget["widgetName"]]["start"](widget["widget_id"])
                        this_widget["status"] = "active"
                        start_success = True
                    except Exception as e:
                        start_attempts += 1
                        this_widget["failure_history"].append({
                            "attempt": start_attempts,
                            "error": str(e),
                            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        })
                        logger.error(f"Failed to start widget {widget['widgetName']}: {e}")
                        time.sleep(5)
        
    def register_widget(self, name, start_function, stop_function):
        self.widget_registry[name] = {
            "start": start_function,
            "stop": stop_function
        }



active_event_handler = create_handler()