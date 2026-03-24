from fastapi import WebSocket
from typing import Dict, Set
import json


class ConnectionManager:
    def __init__(self):
        self.rooms: Dict[int, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: int):
        await websocket.accept()
        self.rooms.setdefault(room_id, set()).add(websocket)

    def disconnect(self, websocket: WebSocket, room_id: int):
        if room_id in self.rooms:
            self.rooms[room_id].discard(websocket)

    async def broadcast(self, room_id: int, payload: dict):
        dead: Set[WebSocket] = set()
        for ws in self.rooms.get(room_id, set()):
            try:
                await ws.send_json(payload)
            except Exception:
                dead.add(ws)
        if dead:
            self.rooms[room_id] -= dead


manager = ConnectionManager()
