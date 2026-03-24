from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload
from app.core.database import get_db, AsyncSessionLocal
from app.core.websocket import manager
from app.core.security import decode_access_token
from app.models.chat import ChatRoom, ChatMessage
from app.models.user import User
from app.models.listing import Listing
from app.schemas.chat import RoomCreate, RoomResponse, MessageCreate, MessageResponse
from app.api.v1.endpoints.users import get_current_user
from typing import List

router = APIRouter()


def _room_response(room: ChatRoom, current_user_id: int, unread: int) -> RoomResponse:
    if current_user_id == room.buyer_id:
        other = room.seller
        other_id = room.seller_id
    else:
        other = room.buyer
        other_id = room.buyer_id

    last_msg = room.messages[-1].content if room.messages else None
    image = room.listing.images[0] if room.listing and room.listing.images else None

    return RoomResponse(
        id=room.id,
        buyer_id=room.buyer_id,
        seller_id=room.seller_id,
        listing_id=room.listing_id,
        listing_title=room.listing.title if room.listing else "",
        listing_image=image,
        other_user_name=f"{other.first_name} {other.last_name}" if other else "Unknown",
        other_user_id=other_id,
        last_message=last_msg,
        unread_count=unread,
        created_at=room.created_at,
    )


@router.post("/rooms", response_model=RoomResponse)
async def get_or_create_room(
    data: RoomCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.id == data.seller_id:
        raise HTTPException(status_code=400, detail="Cannot chat with yourself")

    result = await db.execute(
        select(ChatRoom)
        .where(and_(
            ChatRoom.buyer_id == current_user.id,
            ChatRoom.seller_id == data.seller_id,
            ChatRoom.listing_id == data.listing_id,
        ))
        .options(selectinload(ChatRoom.buyer), selectinload(ChatRoom.seller),
                 selectinload(ChatRoom.listing), selectinload(ChatRoom.messages))
    )
    room = result.scalar_one_or_none()

    if not room:
        room = ChatRoom(buyer_id=current_user.id, seller_id=data.seller_id, listing_id=data.listing_id)
        db.add(room)
        await db.commit()
        await db.refresh(room)
        # reload with relationships
        result = await db.execute(
            select(ChatRoom).where(ChatRoom.id == room.id)
            .options(selectinload(ChatRoom.buyer), selectinload(ChatRoom.seller),
                     selectinload(ChatRoom.listing), selectinload(ChatRoom.messages))
        )
        room = result.scalar_one()

    return _room_response(room, current_user.id, 0)


@router.get("/rooms", response_model=List[RoomResponse])
async def list_rooms(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ChatRoom)
        .where(or_(ChatRoom.buyer_id == current_user.id, ChatRoom.seller_id == current_user.id))
        .options(selectinload(ChatRoom.buyer), selectinload(ChatRoom.seller),
                 selectinload(ChatRoom.listing), selectinload(ChatRoom.messages))
        .order_by(ChatRoom.created_at.desc())
    )
    rooms = result.scalars().all()

    out = []
    for room in rooms:
        unread_result = await db.execute(
            select(func.count()).select_from(ChatMessage).where(
                and_(ChatMessage.room_id == room.id,
                     ChatMessage.sender_id != current_user.id,
                     ChatMessage.is_read == False)
            )
        )
        unread = unread_result.scalar() or 0
        out.append(_room_response(room, current_user.id, unread))
    return out


@router.get("/rooms/{room_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    room_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    room = await db.get(ChatRoom, room_id)
    if not room or current_user.id not in (room.buyer_id, room.seller_id):
        raise HTTPException(status_code=404, detail="Room not found")

    # Mark incoming messages as read
    result = await db.execute(
        select(ChatMessage).where(
            and_(ChatMessage.room_id == room_id, ChatMessage.sender_id != current_user.id, ChatMessage.is_read == False)
        )
    )
    for msg in result.scalars().all():
        msg.is_read = True
    await db.commit()

    result = await db.execute(
        select(ChatMessage).where(ChatMessage.room_id == room_id)
        .options(selectinload(ChatMessage.sender))
        .order_by(ChatMessage.created_at)
    )
    messages = result.scalars().all()
    return [
        MessageResponse(
            id=m.id, room_id=m.room_id, sender_id=m.sender_id,
            sender_name=f"{m.sender.first_name} {m.sender.last_name}",
            content=m.content, is_read=m.is_read, created_at=m.created_at,
        )
        for m in messages
    ]


@router.get("/unread-total")
async def unread_total(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Total unread messages across all rooms for the current user."""
    result = await db.execute(
        select(func.count()).select_from(ChatMessage)
        .join(ChatRoom, ChatMessage.room_id == ChatRoom.id)
        .where(
            and_(
                or_(ChatRoom.buyer_id == current_user.id, ChatRoom.seller_id == current_user.id),
                ChatMessage.sender_id != current_user.id,
                ChatMessage.is_read == False,
            )
        )
    )
    return {"total": result.scalar() or 0}


@router.patch("/rooms/{room_id}/read")
async def mark_room_read(
    room_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark all messages in this room sent by the other person as read."""
    room = await db.get(ChatRoom, room_id)
    if not room or current_user.id not in (room.buyer_id, room.seller_id):
        raise HTTPException(status_code=404, detail="Room not found")

    result = await db.execute(
        select(ChatMessage).where(
            and_(ChatMessage.room_id == room_id, ChatMessage.sender_id != current_user.id, ChatMessage.is_read == False)
        )
    )
    for msg in result.scalars().all():
        msg.is_read = True
    await db.commit()
    return {"ok": True}


@router.websocket("/ws/{room_id}")
async def websocket_chat(
    websocket: WebSocket,
    room_id: int,
    token: str = Query(...),
):
    payload = decode_access_token(token)
    if not payload:
        await websocket.close(code=4001)
        return

    user_id = int(payload["sub"])

    async with AsyncSessionLocal() as db:
        room = await db.get(ChatRoom, room_id)
        if not room or user_id not in (room.buyer_id, room.seller_id):
            await websocket.close(code=4003)
            return

        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            await websocket.close(code=4001)
            return

    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_json()
            content = str(data.get("content", "")).strip()
            if not content:
                continue

            async with AsyncSessionLocal() as db:
                msg = ChatMessage(room_id=room_id, sender_id=user_id, content=content)
                db.add(msg)
                await db.commit()
                await db.refresh(msg)

            await manager.broadcast(room_id, {
                "id": msg.id,
                "room_id": room_id,
                "sender_id": user_id,
                "sender_name": f"{user.first_name} {user.last_name}",
                "content": content,
                "is_read": False,
                "created_at": msg.created_at.isoformat(),
            })
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
