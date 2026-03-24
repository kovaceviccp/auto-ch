from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class InquiryCreate(BaseModel):
    listing_id: int
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    message: Optional[str] = None
    test_drive: bool = False
    want_leasing: bool = False
    want_installment: bool = False
    want_insurance: bool = False
    want_trade_in: bool = False


class InquiryResponse(BaseModel):
    id: int
    listing_id: int
    buyer_id: Optional[int]
    first_name: str
    last_name: str
    email: str
    phone: Optional[str]
    message: Optional[str]
    test_drive: bool
    want_leasing: bool
    want_installment: bool
    want_insurance: bool
    want_trade_in: bool
    is_read: bool
    status: str = "pending"
    created_at: datetime
    listing_title: Optional[str] = None

    model_config = {"from_attributes": True}
