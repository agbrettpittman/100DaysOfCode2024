from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
from fastapi import APIRouter, Depends, WebSocket
from pydantic import BaseModel
from sqlite3 import Connection, Cursor

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
        print(f"New connection for event {event_id}")
        if event_id not in self.socket_connections:
            self.socket_connections[event_id] = []
        self.socket_connections[event_id].append(websocket)

        try:
            while True:
                data = await websocket.receive_json()
                print(f"Data received: {data}")
        except WebSocketDisconnect:
            del self.socket_connections[event_id]
            print(f"Connection {event_id} closed")

event_sockets = new_handler()