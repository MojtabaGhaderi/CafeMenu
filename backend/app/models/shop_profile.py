from sqlalchemy import Column, Integer, String, ForeignKey
from app.models.base import Base

class ShopProfile(Base):
    __tablename__ = "shop_profiles"

    shop_id = Column(Integer, ForeignKey("shops.id"), primary_key=True, index=True)
    name = Column(String(120), nullable=True)
    address = Column(String(255), nullable=True)
    hours = Column(String(255), nullable=True)
    instagram = Column(String(120), nullable=True)
    logo_url = Column(String(500), nullable=True)