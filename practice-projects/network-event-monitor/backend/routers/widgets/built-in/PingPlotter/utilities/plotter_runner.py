import logging
from .plotter import Plotter

logger = logging.getLogger("uvicorn")

class NewPlotterRunner:

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        self._instance = self
        self.running_plotters = {}

    def add_plotter(self, id:int, event_id:int, mapping_id:int):
        self.running_plotters[id] = Plotter(id, event_id, mapping_id)

    async def remove_plotter(self, id:int = None):
        await self.running_plotters[id].stop()
        del self.running_plotters[id]

plotter_runner = NewPlotterRunner()