from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core.security import decode_access_token
from app.core.notification_manager import notif_manager

router = APIRouter()

@router.websocket("/ws")
async def notifications_ws(websocket: WebSocket, token: str = Query(...)):
    payload = decode_access_token(token)
    if not payload:
        await websocket.close(code=4001)
        return
    user_id = int(payload["sub"])
    await notif_manager.connect(websocket, user_id)
    try:
        while True:
            await websocket.receive_text()  # keep-alive
    except WebSocketDisconnect:
        notif_manager.disconnect(websocket, user_id)
