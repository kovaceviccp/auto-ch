from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse, SellerRatingSummary
from app.api.v1.endpoints.users import get_current_user
from typing import List

router = APIRouter()

@router.post("", response_model=ReviewResponse, status_code=201)
async def create_review(
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.id == data.seller_id:
        raise HTTPException(status_code=400, detail="Cannot review yourself")

    # Check if already reviewed
    existing = await db.execute(
        select(Review).where(Review.reviewer_id == current_user.id, Review.seller_id == data.seller_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Already reviewed this seller")

    seller = await db.get(User, data.seller_id)
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")

    review = Review(reviewer_id=current_user.id, **data.model_dump())
    db.add(review)
    await db.commit()
    await db.refresh(review)

    out = ReviewResponse.model_validate(review)
    out.reviewer_name = f"{current_user.first_name} {current_user.last_name}"
    return out

@router.get("/seller/{seller_id}", response_model=List[ReviewResponse])
async def get_seller_reviews(seller_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Review)
        .where(Review.seller_id == seller_id)
        .options(selectinload(Review.reviewer))
        .order_by(Review.created_at.desc())
    )
    reviews = result.scalars().all()
    out = []
    for r in reviews:
        item = ReviewResponse.model_validate(r)
        item.reviewer_name = f"{r.reviewer.first_name} {r.reviewer.last_name}" if r.reviewer else "Unknown"
        out.append(item)
    return out

@router.get("/seller/{seller_id}/summary", response_model=SellerRatingSummary)
async def get_seller_summary(seller_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Review.rating).where(Review.seller_id == seller_id)
    )
    ratings = result.scalars().all()
    if not ratings:
        return SellerRatingSummary(average=0.0, count=0, distribution={1:0,2:0,3:0,4:0,5:0})
    avg = sum(ratings) / len(ratings)
    dist = {1:0, 2:0, 3:0, 4:0, 5:0}
    for r in ratings:
        dist[r] = dist.get(r, 0) + 1
    return SellerRatingSummary(average=round(avg, 1), count=len(ratings), distribution=dist)

@router.get("/me/can-review/{seller_id}")
async def can_review(
    seller_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.id == seller_id:
        return {"can_review": False, "reason": "own_profile"}
    existing = await db.execute(
        select(Review).where(Review.reviewer_id == current_user.id, Review.seller_id == seller_id)
    )
    if existing.scalar_one_or_none():
        return {"can_review": False, "reason": "already_reviewed"}
    return {"can_review": True}
