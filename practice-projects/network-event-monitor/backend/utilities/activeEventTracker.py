import logging, threading, time, asyncio
from datetime import datetime
from fastapi import BackgroundTasks
from .dbConn import get_db
from .widget_registry import widget_registry

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


class running_event_widget:

    def __init__(self, widget_id, event_id, widget_name=""):
        self.id = widget_id
        self.event_id = event_id
        self.widget_name = widget_name
        self.status = ""
        self.failure_history = []

    async def start(self):
        skippable_statuses = ["halted", "active"]
        if self.status in skippable_statuses: return
        
        start_attempts = 0
        start_success = False

        while start_attempts < 5 and not start_success:
            try:
                widget_registry_entry = widget_registry.get_widget(self.widget_name)
                await widget_registry_entry.start(self.id, self.event_id)
                self.update_status("active")
                start_success = True
            except Exception as e:
                start_attempts += 1
                self.add_failure("start", start_attempts, str(e))
                time.sleep(5)
        if not start_success:
            self.update_status("failed to start")
            logger.error(f"Failed to start {self.widget_name} {self.id} after 5 attempts")

    async def stop(self):
        try:
            if self.status == "halted": return
            widget_registry_entry = widget_registry.get_widget(self.widget_name)
            await widget_registry_entry.stop(self.id, self.event_id)
            self.update_status("halted")
        except Exception as e:
            self.add_failure("stop", 1, str(e))
            logger.critical(f"Failed to stop {self.widget_name} {self.id}")
            raise e

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

    async def stop(self):
        failed_to_stop_widgets = 0
        total_widgets = len(self.widgets)
        for event_widget in self.widgets.values():
            try:
                await event_widget.stop()
            except Exception as e:
                print(f"Failed to stop widget {event_widget.id}: {e}")
                failed_to_stop_widgets += 1
        
        if failed_to_stop_widgets:
            raise Exception(f"Failed to stop {failed_to_stop_widgets} widgets out of {total_widgets}")


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
            try:
                await self.running_events[event_id].stop()
                events_to_delete.append(event_id)
            except Exception as e:
                logger.error(f"Failed to stop event {event_id}: {e}")
                logger.error(f"Event {event_id} will continue to run")

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
                    await this_event.widgets[widget['widget_id']].start()
                

active_event_handler = ActiveEventTracker()