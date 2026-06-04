# app/api/public_shop_profile.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.shop_profile import ShopProfile
from app.schemas.shop_profile import ShopProfileOut

router = APIRouter(prefix="/public", tags=["public-shop-profile"])


@router.get("/shop-profile", response_model=ShopProfileOut)
def get_public_shop_profile(db: Session = Depends(get_db)):
    # If you only have one shop for now:
    shop_id = 1

    prof = db.query(ShopProfile).filter(ShopProfile.shop_id == shop_id).first()
    if not prof:
        # return empty object instead of 404 (so UI can show placeholders)
        return ShopProfileOut()

    return prof