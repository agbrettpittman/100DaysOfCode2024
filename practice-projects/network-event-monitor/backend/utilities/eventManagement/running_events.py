import logging, time
from datetime import datetime
from utilities.widget_registry import widget_registry

logger = logging.getLogger("uvicorn")

class RunningEventWidget:

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
                logger.info(f"Started {self.widget_name} {self.id}")
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

class RunningEvent:

    def __init__(self, event_id):
        self.event_id = event_id
        self.widgets = {}

    async def add_widget(self, widget_id, widget_name):
        self.widgets[widget_id] = RunningEventWidget(
            widget_id=widget_id,
            event_id=self.event_id,
            widget_name=widget_name
        )
        await self.widgets[widget_id].start()

    async def load_widgets(self, widget_list):
        for widget in widget_list:
            if widget["widget_id"] not in self.widgets:
                await self.add_widget(widget["widget_id"], widget["widgetName"])

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
