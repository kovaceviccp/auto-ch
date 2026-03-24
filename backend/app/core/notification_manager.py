from fastapi import WebSocket
from typing import Dict, Set
import json

class PersonalNotificationManager:
    def __init__(self):
        self._connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, ws: WebSocket, user_id: int):
        await ws.accept()
        self._connections.setdefault(user_id, set()).add(ws)

    def disconnect(self, ws: WebSocket, user_id: int):
        conns = self._connections.get(user_id, set())
        conns.discard(ws)
        if not conns:
            self._connections.pop(user_id, None)

    async def send(self, user_id: int, event: str, data: dict):
        payload = json.dumps({"event": event, "data": data})
        dead = set()
        for ws in list(self._connections.get(user_id, set())):
            try:
                await ws.send_text(payload)
            except Exception:
                dead.add(ws)
        for ws in dead:
            self.disconnect(ws, user_id)

notif_manager = PersonalNotificationManager()
