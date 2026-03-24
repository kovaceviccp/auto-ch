from pydantic import BaseModel
from datetime import datetime


class FavoriteToggleResponse(BaseModel):
    liked: bool
    count: int


class FavoriteLiker(BaseModel):
    user_id: int
    name: str
    created_at: datetime

    model_config = {"from_attributes": True}
