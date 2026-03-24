from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.listing import VehicleType, FuelType, TransmissionType, ConditionType, ListingStatus


class ListingCreate(BaseModel):
    title: str
    description: Optional[str] = None
    vehicle_type: VehicleType
    condition: ConditionType = ConditionType.used
    make: str
    model: str
    year: int
    mileage_km: Optional[int] = None
    fuel_type: Optional[FuelType] = None
    transmission: Optional[TransmissionType] = None
    engine_cc: Optional[int] = None
    power_kw: Optional[int] = None
    doors: Optional[int] = None
    seats: Optional[int] = None
    color: Optional[str] = None
    price_chf: float
    price_negotiable: bool = False
    leasing_available: bool = False
    canton: str
    city: Optional[str] = None
    features: dict = {}


class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price_chf: Optional[float] = None
    price_negotiable: Optional[bool] = None
    mileage_km: Optional[int] = None
    canton: Optional[str] = None
    city: Optional[str] = None
    features: Optional[dict] = None
    status: Optional[ListingStatus] = None


class ListingResponse(BaseModel):
    id: int
    seller_id: int
    title: str
    description: Optional[str]
    vehicle_type: VehicleType
    condition: ConditionType
    status: ListingStatus
    make: str
    model: str
    year: int
    mileage_km: Optional[int]
    fuel_type: Optional[FuelType]
    transmission: Optional[TransmissionType]
    engine_cc: Optional[int]
    power_kw: Optional[int]
    doors: Optional[int]
    seats: Optional[int]
    color: Optional[str]
    price_chf: float
    price_negotiable: bool
    leasing_available: bool
    canton: str
    city: Optional[str]
    images: List[str]
    features: dict
    views: int
    likes_count: int = 0
    is_featured: bool
    created_at: datetime
    seller: Optional[dict] = None

    model_config = {"from_attributes": True}


class ListingListResponse(BaseModel):
    items: List[ListingResponse]
    total: int
    page: int
    per_page: int
    pages: int
