import logging

logger = logging.getLogger("uvicorn")

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
        if name not in self.registry:
            raise ValueError(f"Widget {name} not found in registry")
        return self.registry[name]

widget_registry = WidgetRegistry()