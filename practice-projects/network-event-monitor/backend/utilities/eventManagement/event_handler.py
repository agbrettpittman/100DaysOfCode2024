import logging, time, asyncio
from .active_events import ActiveEvents
from .running_events import RunningEvent

logger = logging.getLogger("uvicorn")

class EventHandler:

    _instance = None
    _task = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            logger.info("Initialized Active Event Tracker")
        return cls._instance
    
    def __init__(self):
        self.running_events = {}
        self.active_events = ActiveEvents()

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
        widgets_by_event = self.active_events.widgets_by_event()

        # loop through the found events and start any that are not already active
        for event in self.active_events.events:
            if event["id"] not in self.running_events:
                self.running_events[event["id"]] = RunningEvent(event["id"])
            this_event = self.running_events[event["id"]]
            if event["id"] in widgets_by_event:
                event_widgets = widgets_by_event[event["id"]]
                await this_event.load_widgets(event_widgets)                       

event_handler = EventHandler()