from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.notification_manager import notif_manager
from app.models.favorite import Favorite
from app.models.listing import Listing
from app.models.user import User
from app.schemas.favorite import FavoriteToggleResponse, FavoriteLiker
from app.api.v1.endpoints.users import get_current_user
from typing import List

router = APIRouter()


@router.post("/{listing_id}/like", response_model=FavoriteToggleResponse)
async def toggle_like(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    listing = await db.get(Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.seller_id == current_user.id:
        raise HTTPException(status_code=403, detail="Cannot like your own listing")

    result = await db.execute(
        select(Favorite).where(and_(Favorite.user_id == current_user.id, Favorite.listing_id == listing_id))
    )
    existing = result.scalar_one_or_none()

    if existing:
        await db.delete(existing)
        liked = False
    else:
        db.add(Favorite(user_id=current_user.id, listing_id=listing_id))
        liked = True

    await db.commit()

    if liked and listing.seller_id != current_user.id:
        await notif_manager.send(listing.seller_id, "AD_LIKE", {
            "listing_id": listing_id,
            "listing_title": listing.title,
            "from_name": f"{current_user.first_name} {current_user.last_name}",
        })

    count_result = await db.execute(
        select(func.count()).select_from(Favorite).where(Favorite.listing_id == listing_id)
    )
    count = count_result.scalar() or 0
    return FavoriteToggleResponse(liked=liked, count=count)


@router.get("/{listing_id}/likes", response_model=List[FavoriteLiker])
async def get_likers(
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
        select(Favorite).where(Favorite.listing_id == listing_id).options(selectinload(Favorite.user))
    )
    favs = result.scalars().all()
    return [
        FavoriteLiker(
            user_id=f.user_id,
            name=f"{f.user.first_name} {f.user.last_name}",
            created_at=f.created_at,
        )
        for f in favs
    ]


@router.get("/{listing_id}/like/status")
async def like_status(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Favorite).where(and_(Favorite.user_id == current_user.id, Favorite.listing_id == listing_id))
    )
    liked = result.scalar_one_or_none() is not None

    count_result = await db.execute(
        select(func.count()).select_from(Favorite).where(Favorite.listing_id == listing_id)
    )
    count = count_result.scalar() or 0
    return {"liked": liked, "count": count}


@router.get("/me/favorites")
async def my_favorites(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.schemas.listing import ListingResponse
    result = await db.execute(
        select(Favorite)
        .where(Favorite.user_id == current_user.id)
        .options(selectinload(Favorite.listing))
        .order_by(Favorite.created_at.desc())
    )
    favs = result.scalars().all()
    listings = []
    for f in favs:
        if f.listing:
            f.listing.__dict__["seller"] = None
            item = ListingResponse.model_validate(f.listing)
            listings.append(item)
    return listings
