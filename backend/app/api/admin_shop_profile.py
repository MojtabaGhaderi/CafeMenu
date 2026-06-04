from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.shop_profile import ShopProfile
from app.schemas.shop_profile import ShopProfileOut, ShopProfileUpdate

router = APIRouter(prefix="/admin", tags=["admin-shop-profile"])

@router.get("/shop-profile", response_model=ShopProfileOut)
def get_profile(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    prof = db.query(ShopProfile).filter(ShopProfile.shop_id == user.shop_id).first()
    if not prof:
        prof = ShopProfile(shop_id=user.shop_id)
        db.add(prof)
        db.commit()
        db.refresh(prof)
    return prof

@router.patch("/shop-profile", response_model=ShopProfileOut)
def update_profile(payload: ShopProfileUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    prof = db.query(ShopProfile).filter(ShopProfile.shop_id == user.shop_id).first()
    if not prof:
        prof = ShopProfile(shop_id=user.shop_id)
        db.add(prof)
        db.commit()
        db.refresh(prof)

    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(prof, k, v)

    db.commit()
    db.refresh(prof)
    return prof