import logging, threading, time, asyncio
from datetime import datetime
from fastapi import BackgroundTasks
from .dbConn import get_db

logger = logging.getLogger("uvicorn")



class active_event_list(list):

    def to_dict(self):
        return {event["id"]: event for event in self}

class active_events:

    def __init__(self):
        self.events = active_event_list()
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

class RegisteredWidget:

    def __init__(self, name, start_function, stop_function):
        self.name = name
        self.start = start_function
        self.stop = stop_function

class WidgetRegistry:
    
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        self.registry = {}

    def register_widget(self, name, start_function, stop_function):
        self.registry[name] = RegisteredWidget(name, start_function, stop_function)

    def get_widget(self, name):
        return self.registry[name]


class running_event_widget:

    def __init__(self, widget_id, event_id, widget_name=""):
        self.id = widget_id
        self.event_id = event_id
        self.widget_name = widget_name
        self.status = ""
        self.failure_history = []

    def add_failure(self, type: str, id:int, message: str):
        self.failure_history.append({
            "type": type,
            "id": id,
            "message": message,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })
        print(f"Widget failure: {type} {id}: {message}")

    def update_status(self, status: str):
        valid_statuses = ["active", "halted", "failed to start", "failed to stop"]
        if status not in valid_statuses:
            raise ValueError(f"Invalid status: {status}")
        self.status = status

class running_event:

    def __init__(self, event_id):
        self.event_id = event_id
        self.widgets = {}

    def add_widget(self, widget_id, widget_name):
        self.widgets[widget_id] = running_event_widget(
            widget_id=widget_id,
            event_id=self.event_id,
            widget_name=widget_name
        )


class ActiveEventTracker:

    _instance = None
    _task = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            logger.info("Initialized Active Event Tracker")
        return cls._instance
    
    def __init__(self):
        self.running_events = {}
        self.active_events = active_events()

    async def start_active_event_loop(self):
        logger.info(f"Starting active event loop")
        while True:
            logger.info(f"Getting active events")
            self.active_events.query_db()
            await self.stop_inactive_events()
            await self.start_active_events()
            await asyncio.sleep(61 - time.time() % 60)  # Sleep until the next minute

    async def activate(self):
        if self._task and not self._task.done():
            logger.warning("Task is already running. Skipping reactivation.")
            return  # Avoid starting the task again if it's already running
        current_loop = asyncio.get_event_loop()
        logger.info(f"Activating Active Event Tracker in event loop {id(current_loop)}")
        asyncio.create_task(self.start_active_event_loop())

    async def stop_inactive_events(self):
        logger.info(f"Stopping inactive events")
        events_to_delete = []
        found_events_dict = self.active_events.events.to_dict()
        # loop through the active events and stop any that are no longer active
        for event_id in self.running_events:
            if event_id in found_events_dict: continue
            logger.info(f"Stopping event {event_id}")
            active_event_widgets = self.running_events[event_id].widgets
            failed_to_stop_widgets = []
            for widget_id, widget_obj in active_event_widgets.items():
                if widget_obj.status == "halted": continue # skip widgets that are already stopped
                widget_name = widget_obj.widget_name
                try:
                    widget_registry_entry = widget_registry.get_widget(widget_name)
                    await widget_registry_entry.stop(widget_id, event_id)
                    widget_obj.update_status("halted")
                except Exception as e:
                    logger.error(f"Failed to stop widget {widget_name}: {e}")
                    widget_obj.update_status("failed to stop")
                    failed_to_stop_widgets.append(widget_obj)
            
            if len(failed_to_stop_widgets) > 0:
                for widget_obj in failed_to_stop_widgets:
                    widget_id = widget_obj["widget_id"]
                    widget_name = widget_obj["widget_name"]
                    logger.critical(f"{widget_name} {widget_id} could not be stopped! Event will remain active.")
            else:
                logger.info(f"Event {event_id} has been stopped and will be removed from active events")
                events_to_delete.append(event_id)

        for event_id in events_to_delete:
            del self.running_events[event_id]


    async def start_active_events(self):
        logger.info(f"Starting active events")
        widgets_by_event = self.active_events.widgets_by_event()

        # loop through the found events and start any that are not already active
        for event in self.active_events.events:
            if event["id"] not in self.running_events:
                self.running_events[event["id"]] = running_event(event["id"])
            this_event = self.running_events[event["id"]]
            if event["id"] in widgets_by_event:
                event_widgets = widgets_by_event[event["id"]]
            for widget in event_widgets:
                if widget['widget_id'] not in this_event.widgets:
                    this_event.add_widget(widget['widget_id'], widget['widgetName'])
                this_widget = this_event.widgets[widget['widget_id']]
                skippable_statuses = ["halted", "active"]
                if this_widget.status in skippable_statuses: continue
                
                start_attempts = 0
                start_success = False

                while start_attempts < 5 and not start_success:
                    try:
                        widget_registry_entry = widget_registry.get_widget(widget["widgetName"])
                        await widget_registry_entry.start(widget["widget_id"], event["id"])
                        this_widget.update_status("active")
                        start_success = True
                    except Exception as e:
                        start_attempts += 1
                        this_widget.add_failure("start", start_attempts, str(e))
                        time.sleep(5)
                if not start_success:
                    this_widget.update_status("failed to start")
                    logger.error(f"Failed to start widget {widget['widgetName']} after 5 attempts")
        
widget_registry = WidgetRegistry()
active_event_handler = ActiveEventTracker()