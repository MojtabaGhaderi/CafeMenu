from pydantic import BaseModel
from typing import Optional

class ShopProfileOut(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    hours: Optional[str] = None
    instagram: Optional[str] = None
    logo_url: Optional[str] = None

    class Config:
        from_attributes = True

class ShopProfileUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    hours: Optional[str] = None
    instagram: Optional[str] = None
    logo_url: Optional[str] = None