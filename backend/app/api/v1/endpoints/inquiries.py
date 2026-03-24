from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.security import decode_access_token
from app.core.websocket import manager
from app.core.notification_manager import notif_manager
from app.models.inquiry import Inquiry
from app.models.listing import Listing
from app.models.user import User
from app.schemas.inquiry import InquiryCreate, InquiryResponse
from app.api.v1.endpoints.users import get_current_user
from typing import List, Optional

router = APIRouter()


async def optional_user(request: Request, db: AsyncSession = Depends(get_db)) -> Optional[User]:
    """Extract user from Bearer token if present, else return None."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth.split(" ", 1)[1]
    payload = decode_access_token(token)
    if not payload:
        return None
    result = await db.execute(select(User).where(User.id == int(payload["sub"])))
    return result.scalar_one_or_none()


@router.post("", response_model=InquiryResponse, status_code=201)
async def create_inquiry(
    data: InquiryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(optional_user),
):
    listing = await db.get(Listing, data.listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    inquiry = Inquiry(**data.model_dump(), buyer_id=current_user.id if current_user else None)
    db.add(inquiry)
    await db.commit()
    await db.refresh(inquiry)

    await notif_manager.send(listing.seller_id, "OFFER_NEW", {
        "listing_id": data.listing_id,
        "listing_title": listing.title,
        "from_name": f"{data.first_name} {data.last_name}",
    })

    return inquiry


@router.get("/listing/{listing_id}", response_model=List[InquiryResponse])
async def get_listing_inquiries(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    listing = await db.get(Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.seller_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    result = await db.execute(
        select(Inquiry).where(Inquiry.listing_id == listing_id).order_by(Inquiry.created_at.desc())
    )
    return result.scalars().all()


@router.get("/unread-count")
async def unread_count(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(func.count()).select_from(Inquiry)
        .join(Listing, Inquiry.listing_id == Listing.id)
        .where(Listing.seller_id == current_user.id, Inquiry.is_read == False)
    )
    return {"total": result.scalar() or 0}


@router.get("/me", response_model=List[InquiryResponse])
async def my_received_inquiries(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """All inquiries on listings owned by the current user."""
    result = await db.execute(
        select(Inquiry)
        .join(Listing, Inquiry.listing_id == Listing.id)
        .where(Listing.seller_id == current_user.id)
        .options(selectinload(Inquiry.listing))
        .order_by(Inquiry.created_at.desc())
    )
    inquiries = result.scalars().all()
    out = []
    for inq in inquiries:
        data = InquiryResponse.model_validate(inq)
        data.listing_title = inq.listing.title if inq.listing else None
        out.append(data)
    return out


@router.get("/my-sent", response_model=List[InquiryResponse])
async def my_sent_inquiries(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """All inquiries submitted by the current buyer."""
    result = await db.execute(
        select(Inquiry)
        .where(Inquiry.buyer_id == current_user.id)
        .options(selectinload(Inquiry.listing))
        .order_by(Inquiry.created_at.desc())
    )
    inquiries = result.scalars().all()
    out = []
    for inq in inquiries:
        data = InquiryResponse.model_validate(inq)
        data.listing_title = inq.listing.title if inq.listing else None
        out.append(data)
    return out


@router.patch("/{inquiry_id}/read")
async def mark_read(
    inquiry_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    inquiry = await db.get(Inquiry, inquiry_id)
    if not inquiry:
        raise HTTPException(status_code=404, detail="Not found")
    listing = await db.get(Listing, inquiry.listing_id)
    if not listing or listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    inquiry.is_read = True
    await db.commit()
    return {"ok": True}


@router.patch("/{inquiry_id}/accept")
async def accept_inquiry(
    inquiry_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    inquiry = await db.get(Inquiry, inquiry_id)
    if not inquiry:
        raise HTTPException(status_code=404, detail="Not found")
    listing = await db.get(Listing, inquiry.listing_id)
    if not listing or listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    inquiry.status = "accepted"
    inquiry.is_read = True
    await db.commit()
    if inquiry.buyer_id:
        await notif_manager.send(inquiry.buyer_id, "OFFER_ACCEPTED", {
            "listing_id": listing.id,
            "listing_title": listing.title,
            "seller_name": f"{current_user.first_name} {current_user.last_name}",
        })
    return {"ok": True, "status": "accepted"}


@router.patch("/{inquiry_id}/decline")
async def decline_inquiry(
    inquiry_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    inquiry = await db.get(Inquiry, inquiry_id)
    if not inquiry:
        raise HTTPException(status_code=404, detail="Not found")
    listing = await db.get(Listing, inquiry.listing_id)
    if not listing or listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    inquiry.status = "declined"
    inquiry.is_read = True
    await db.commit()
    if inquiry.buyer_id:
        await notif_manager.send(inquiry.buyer_id, "OFFER_DECLINED", {
            "listing_id": listing.id,
            "listing_title": listing.title,
            "seller_name": f"{current_user.first_name} {current_user.last_name}",
        })
    return {"ok": True, "status": "declined"}
