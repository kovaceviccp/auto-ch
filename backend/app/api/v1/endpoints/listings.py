from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload
from typing import Optional, List
import os, uuid, shutil
from app.core.database import get_db
from app.core.config import settings
from app.core.notification_manager import notif_manager
from app.models.listing import Listing, VehicleType, FuelType, TransmissionType, ConditionType, ListingStatus
from app.models.favorite import Favorite
from app.models.user import User
from app.schemas.listing import ListingCreate, ListingUpdate, ListingResponse, ListingListResponse
from app.api.v1.endpoints.users import get_current_user

router = APIRouter()


@router.get("", response_model=ListingListResponse)
async def get_listings(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    vehicle_type: Optional[VehicleType] = None,
    make: Optional[str] = None,
    model: Optional[str] = None,
    year_from: Optional[int] = None,
    year_to: Optional[int] = None,
    price_from: Optional[float] = None,
    price_to: Optional[float] = None,
    fuel_type: Optional[FuelType] = None,
    transmission: Optional[TransmissionType] = None,
    canton: Optional[str] = None,
    condition: Optional[ConditionType] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    filters = [Listing.status == ListingStatus.active]

    if vehicle_type:
        filters.append(Listing.vehicle_type == vehicle_type)
    if make:
        filters.append(Listing.make.ilike(f"%{make}%"))
    if model:
        filters.append(Listing.model.ilike(f"%{model}%"))
    if year_from:
        filters.append(Listing.year >= year_from)
    if year_to:
        filters.append(Listing.year <= year_to)
    if price_from:
        filters.append(Listing.price_chf >= price_from)
    if price_to:
        filters.append(Listing.price_chf <= price_to)
    if fuel_type:
        filters.append(Listing.fuel_type == fuel_type)
    if transmission:
        filters.append(Listing.transmission == transmission)
    if canton:
        filters.append(Listing.canton == canton)
    if condition:
        filters.append(Listing.condition == condition)
    if search:
        filters.append(
            or_(
                Listing.title.ilike(f"%{search}%"),
                Listing.make.ilike(f"%{search}%"),
                Listing.model.ilike(f"%{search}%"),
                Listing.description.ilike(f"%{search}%"),
            )
        )

    count_query = select(func.count()).select_from(Listing).where(and_(*filters))
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    offset = (page - 1) * per_page
    query = (
        select(Listing)
        .where(and_(*filters))
        .order_by(Listing.is_featured.desc(), Listing.created_at.desc())
        .offset(offset)
        .limit(per_page)
        .options(selectinload(Listing.seller))
    )
    result = await db.execute(query)
    listings = result.scalars().all()

    items = []
    for listing in listings:
        seller_data = None
        if listing.seller:
            seller_data = {
                "id": listing.seller.id,
                "name": f"{listing.seller.first_name} {listing.seller.last_name}",
                "company_name": listing.seller.company_name,
                "canton": listing.seller.canton,
                "phone": listing.seller.phone,
            }
        listing.__dict__["seller"] = None
        item = ListingResponse.model_validate(listing)
        item.seller = seller_data
        items.append(item)

    return ListingListResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        pages=(total + per_page - 1) // per_page,
    )


@router.post("", response_model=ListingResponse, status_code=201)
async def create_listing(
    data: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    listing = Listing(
        seller_id=current_user.id,
        **data.model_dump(),
    )
    db.add(listing)
    await db.commit()
    await db.refresh(listing)
    seller_dict = {
        "id": current_user.id,
        "name": f"{current_user.first_name} {current_user.last_name}",
        "company_name": current_user.company_name,
        "canton": current_user.canton,
        "phone": current_user.phone,
    }
    # Override relationship in instance dict so Pydantic reads dict, not ORM object
    listing.__dict__["seller"] = None
    item = ListingResponse.model_validate(listing)
    item.seller = seller_dict
    return item


@router.get("/{listing_id}", response_model=ListingResponse)
async def get_listing(listing_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Listing).where(Listing.id == listing_id).options(selectinload(Listing.seller))
    )
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Increment views
    listing.views += 1
    await db.commit()

    # Real like count
    count_result = await db.execute(
        select(func.count()).select_from(Favorite).where(Favorite.listing_id == listing_id)
    )
    likes_count = count_result.scalar() or 0

    seller_data = None
    if listing.seller:
        seller_data = {
            "id": listing.seller.id,
            "name": f"{listing.seller.first_name} {listing.seller.last_name}",
            "company_name": listing.seller.company_name,
            "canton": listing.seller.canton,
            "phone": listing.seller.phone,
        }
    listing.__dict__["seller"] = None
    item = ListingResponse.model_validate(listing)
    item.seller = seller_data
    item.likes_count = likes_count
    return item


@router.patch("/{listing_id}", response_model=ListingResponse)
async def update_listing(
    listing_id: int,
    data: ListingUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    old_price = listing.price_chf

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(listing, field, value)

    await db.commit()
    await db.refresh(listing)

    new_price = data.model_dump(exclude_unset=True).get("price_chf")
    if new_price and new_price < old_price:
        favs = await db.execute(select(Favorite).where(Favorite.listing_id == listing_id))
        for fav in favs.scalars().all():
            await notif_manager.send(fav.user_id, "PRICE_DROP", {
                "listing_id": listing_id,
                "listing_title": listing.title,
                "old_price": old_price,
                "new_price": new_price,
            })

    listing.__dict__["seller"] = None
    item = ListingResponse.model_validate(listing)
    item.seller = {
        "id": current_user.id,
        "name": f"{current_user.first_name} {current_user.last_name}",
        "company_name": current_user.company_name,
        "canton": current_user.canton,
        "phone": current_user.phone,
    }
    return item


@router.delete("/{listing_id}", status_code=204)
async def delete_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    await db.delete(listing)
    await db.commit()


@router.post("/{listing_id}/images", response_model=ListingResponse)
async def upload_images(
    listing_id: int,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    os.makedirs(f"{settings.UPLOAD_DIR}/{listing_id}", exist_ok=True)
    saved_paths = list(listing.images or [])

    for file in files:
        ext = file.filename.split(".")[-1].lower()
        if ext not in ["jpg", "jpeg", "png", "webp"]:
            raise HTTPException(status_code=400, detail=f"Invalid file type: {ext}")
        filename = f"{uuid.uuid4()}.{ext}"
        path = f"{settings.UPLOAD_DIR}/{listing_id}/{filename}"
        with open(path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        saved_paths.append(f"/uploads/{listing_id}/{filename}")

    listing.images = saved_paths
    await db.commit()
    await db.refresh(listing)
    listing.__dict__["seller"] = None
    return ListingResponse.model_validate(listing)
