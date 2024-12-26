from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
from fastapi import APIRouter, Depends, WebSocket
from pydantic import BaseModel
from sqlite3 import Connection, Cursor

class socket_handler:

    def __init__(self):
        self.socket_connections = {}

    async def broadcast_update(self, event_id: int, data: Dict):
        for connection in self.socket_connections.get(event_id, []):
            await connection.send_json(data)

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
            del self.socket_connections[id]
            print(f"Connection {id} closed")