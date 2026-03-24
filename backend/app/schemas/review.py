from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional

class ReviewCreate(BaseModel):
    seller_id: int
    rating: int
    comment: Optional[str] = None

    @field_validator("rating")
    @classmethod
    def rating_range(cls, v):
        if not 1 <= v <= 5:
            raise ValueError("Rating must be between 1 and 5")
        return v

class ReviewResponse(BaseModel):
    id: int
    reviewer_id: int
    seller_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime
    reviewer_name: Optional[str] = None

    model_config = {"from_attributes": True}

class SellerRatingSummary(BaseModel):
    average: float
    count: int
    distribution: dict  # {1: N, 2: N, ...}
