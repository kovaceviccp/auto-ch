from sqlalchemy import String, Integer, Float, Boolean, Text, Enum as SAEnum, ForeignKey, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class VehicleType(str, enum.Enum):
    car = "car"
    van = "van"
    truck = "truck"
    bus = "bus"
    trailer = "trailer"
    agricultural = "agricultural"
    construction = "construction"


class FuelType(str, enum.Enum):
    petrol = "petrol"
    diesel = "diesel"
    electric = "electric"
    hybrid = "hybrid"
    plugin_hybrid = "plugin_hybrid"
    lpg = "lpg"
    cng = "cng"
    hydrogen = "hydrogen"


class TransmissionType(str, enum.Enum):
    manual = "manual"
    automatic = "automatic"
    semi_automatic = "semi_automatic"


class ConditionType(str, enum.Enum):
    new = "new"
    used = "used"
    damaged = "damaged"


class ListingStatus(str, enum.Enum):
    active = "active"
    sold = "sold"
    expired = "expired"
    draft = "draft"


class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[int] = mapped_column(primary_key=True)
    seller_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    # Basic info
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    vehicle_type: Mapped[VehicleType] = mapped_column(SAEnum(VehicleType), nullable=False)
    condition: Mapped[ConditionType] = mapped_column(SAEnum(ConditionType), default=ConditionType.used)
    status: Mapped[ListingStatus] = mapped_column(SAEnum(ListingStatus), default=ListingStatus.active)

    # Vehicle details
    make: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    model: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    mileage_km: Mapped[int | None] = mapped_column(Integer)
    fuel_type: Mapped[FuelType | None] = mapped_column(SAEnum(FuelType))
    transmission: Mapped[TransmissionType | None] = mapped_column(SAEnum(TransmissionType))
    engine_cc: Mapped[int | None] = mapped_column(Integer)
    power_kw: Mapped[int | None] = mapped_column(Integer)
    doors: Mapped[int | None] = mapped_column(Integer)
    seats: Mapped[int | None] = mapped_column(Integer)
    color: Mapped[str | None] = mapped_column(String(50))

    # Price
    price_chf: Mapped[float] = mapped_column(Float, nullable=False)
    price_negotiable: Mapped[bool] = mapped_column(Boolean, default=False)
    leasing_available: Mapped[bool] = mapped_column(Boolean, default=False)

    # Location (Swiss cantons)
    canton: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    city: Mapped[str | None] = mapped_column(String(100))

    # Images stored as JSON array of paths/URLs
    images: Mapped[list] = mapped_column(JSON, default=list)

    # Features/extras as JSON
    features: Mapped[dict] = mapped_column(JSON, default=dict)

    # Stats
    views: Mapped[int] = mapped_column(Integer, default=0)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    featured_until: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True))

    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    seller = relationship("User", back_populates="listings")
