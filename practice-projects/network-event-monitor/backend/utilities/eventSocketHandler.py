import logging
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict
from fastapi import WebSocket

logger = logging.getLogger("uvicorn")

class new_handler:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(new_handler, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self):
        if not hasattr(self, 'socket_connections'):
            self.socket_connections = {}

    async def broadcast_update(self, event_id: int, widget_name, widget_id, data: Dict):
        broadcast_data = {
            "widget_name": widget_name,
            "widget_id": widget_id,
            "data": data
        }
        for connection in self.socket_connections.get(event_id, []):
            await connection.send_json(broadcast_data)

    async def new_connection(self, websocket: WebSocket, event_id: int):
        await websocket.accept()
        logger.info(f"New connection for event {event_id}")
        if event_id not in self.socket_connections:
            self.socket_connections[event_id] = []
        self.socket_connections[event_id].append(websocket)

        try:
            while True:
                await websocket.receive_json()
        except WebSocketDisconnect:
            logger.info(f"Connection closed for event {event_id}")
            if event_id in self.socket_connections:
                self.socket_connections[event_id].remove(websocket)
                if len(self.socket_connections[event_id]) == 0:
                    del self.socket_connections[event_id]


event_sockets = new_handler()