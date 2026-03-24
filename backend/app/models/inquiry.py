from sqlalchemy import String, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Inquiry(Base):
    __tablename__ = "inquiries"

    id: Mapped[int] = mapped_column(primary_key=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id", ondelete="CASCADE"), index=True)
    buyer_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50))
    message: Mapped[str | None] = mapped_column(Text)

    # Request flags
    test_drive: Mapped[bool] = mapped_column(Boolean, default=False)
    want_leasing: Mapped[bool] = mapped_column(Boolean, default=False)
    want_installment: Mapped[bool] = mapped_column(Boolean, default=False)
    want_insurance: Mapped[bool] = mapped_column(Boolean, default=False)
    want_trade_in: Mapped[bool] = mapped_column(Boolean, default=False)

    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    listing = relationship("Listing")
    buyer = relationship("User")
