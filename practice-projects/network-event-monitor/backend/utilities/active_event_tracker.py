import logging

logger = logging.getLogger("uvicorn")

class New:

    _instance = None
    

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            logger.info("Initialized Active Event Tracker")
        return cls._instance
    
    def __init__(self):
        self._instance = self
        self.active_events = {}

active_event_tracker = New()