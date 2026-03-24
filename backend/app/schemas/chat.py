from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class MessageCreate(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: int
    room_id: int
    sender_id: int
    sender_name: str
    content: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class RoomResponse(BaseModel):
    id: int
    buyer_id: int
    seller_id: int
    listing_id: int
    listing_title: str
    listing_image: Optional[str]
    other_user_name: str
    other_user_id: int
    last_message: Optional[str]
    unread_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class RoomCreate(BaseModel):
    listing_id: int
    seller_id: int
