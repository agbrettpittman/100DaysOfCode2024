import logging, threading, time, asyncio
from datetime import datetime
from fastapi import BackgroundTasks
from .dbConn import get_db

logger = logging.getLogger("uvicorn")

class registered_widget:

    def __init__(self, name, start_function, stop_function):
        self.name = name
        self.start = start_function
        self.stop = stop_function

class create_handler:

    _instance = None
    _task = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            logger.info("Initialized Active Event Tracker")
        return cls._instance
    
    def __init__(self):
        self.active_events = {}
        self.widget_registry = {}

    async def get_active_event_loop(self):
        logger.info(f"Starting active event loop")
        while True:
            await self.get_active_events()
            await asyncio.sleep(61 - time.time() % 60)  # Sleep until the next minute

    async def activate(self):
        if self._task and not self._task.done():
            logger.warning("Task is already running. Skipping reactivation.")
            return  # Avoid starting the task again if it's already running
        current_loop = asyncio.get_event_loop()
        logger.info(f"Activating Active Event Tracker in event loop {id(current_loop)}")
        asyncio.create_task(self.get_active_event_loop())

    async def get_active_events(self):
        logger.info(f"Getting active events")
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
        found_events_dict = {event["id"]: event for event in found_events}

        # loop through the found events and start any that are not already active
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
                        "widgetName": widget['widgetName'],
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
                        widget_registry_entry = self.widget_registry[widget["widgetName"]]
                        await widget_registry_entry.start(widget["widget_id"], event["id"])
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
                if not start_success:
                    this_widget["status"] = "halted"
                    logger.error(f"Failed to start widget {widget['widgetName']} after 5 attempts")

        # loop through the active events and stop any that are no longer active
        logger.info("Checking for events to stop")
        events_to_delete = []
        for event_id in self.active_events:
            if event_id in found_events_dict: continue
            print(f"Stopping event {event_id}")
            active_event_widgets = self.active_events[event_id]
            failed_to_stop_widgets = []
            for widget_id, widget_details in active_event_widgets.items():
                widget_status = widget_details["status"]
                widget_name = widget_details["widgetName"]
                if widget_status == "halted": continue # skip widgets that are already stopped
                print(f"Stopping Widget {widget_id}")
                try:
                    widget_registry_entry = self.widget_registry[widget_name]
                    await widget_registry_entry.stop(widget_id, event_id)
                    print(f"Stopped widget {widget_name} {widget_id}")
                    widget_details["status"] = "halted"
                except Exception as e:
                    logger.error(f"Failed to stop widget {widget_name}: {e}")
                    widget_details["status"] = "failed to stop"
                    failed_to_stop_widgets.append(widget_details)
            
            if len(failed_to_stop_widgets) > 0:
                for widget_id in failed_to_stop_widgets:
                    logger.critical(f"{widget_details['widgetName']} could not be stopped! Event will remain active.")
            else:
                print(f"Event {event_id} has been stopped and will be removed from active events")
                events_to_delete.append(event_id)

        for event_id in events_to_delete:
            del self.active_events[event_id]
                
        
    def register_widget(self, name, start_function, stop_function):
        self.widget_registry[name] = registered_widget(name, start_function, stop_function)



active_event_handler = create_handler()