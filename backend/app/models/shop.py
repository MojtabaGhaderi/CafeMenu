from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Shop(Base):
    __tablename__ = "shops"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)

    categories = relationship("Category", back_populates="shop", cascade="all, delete-orphan")
    items = relationship("Item", back_populates="shop", cascade="all, delete-orphan")
