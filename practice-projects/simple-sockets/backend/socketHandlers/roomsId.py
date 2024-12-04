from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
from fastapi import APIRouter, Depends, HTTPException, WebSocket
from pydantic import BaseModel
from sqlite3 import Connection, Cursor
from ..database.db import get_db

class handler:

    active_connections: Dict[str, List[WebSocket]] = {}

    async def handle_vote(self, candidate_id: int, room_id: int, vote: str):
        db_generator = get_db()
        cursor, conn = next(db_generator)
        try:
            cursor.execute('''
                SELECT * FROM room_candidates 
                WHERE 
                    room_id = :room_id 
                    AND candidate_id = :candidate_id
            ''', {"room_id": room_id, "candidate_id": candidate_id})
            room_candidate = cursor.fetchone()
            if not room_candidate:
                raise HTTPException(status_code=404, detail="Candidate not found in room")
            
            if vote == "down":
                if room_candidate["votes"] == 0:
                    raise HTTPException(status_code=400, detail="Vote count already 0")
            # clone the dict to avoid modifying the original
            room_candidate = dict(room_candidate)
            room_candidate["votes"] += 1 if vote == "up" else -1
            cursor.execute('''
                UPDATE room_candidates 
                SET votes = :votes
                WHERE 
                    room_id = :room_id 
                    AND candidate_id = :candidate_id
            ''', {"votes": room_candidate["votes"], "room_id": room_id, "candidate_id": candidate_id})
        except Exception as e:
            conn.rollback()
            raise HTTPException(status_code=500, detail=str(e))
        else:
            conn.commit()
            await self.send_update(room_id, room_candidate)
            return {"message": "Vote added successfully"}


    async def send_update(self, room: int, message: dict):
        """Send a message to all connections in a room."""
        for connection in self.active_connections.get(room, []):
            await connection.send_json(message)

    async def add_connection(self, room: int, websocket: WebSocket):
        """Add a connection to a room."""
        if room not in self.active_connections:
            self.active_connections[room] = []
        self.active_connections[room].append(websocket)

    async def remove_connection(self, room: int, websocket: WebSocket):
        """Remove a connection from a room."""
        if room in self.active_connections:
            self.active_connections[room].remove(websocket)
        if not self.active_connections[room]:
            del self.active_connections[room]

    async def handle_new_connection(self, websocket: WebSocket, room: int):
        await websocket.accept()
        await self.add_connection(room, websocket)

        try:
            while True:
                data = await websocket.receive_json()
                await self.handle_vote(data["candidate"], room, data["vote"])
        except WebSocketDisconnect:
            await self.remove_connection(room, websocket)
