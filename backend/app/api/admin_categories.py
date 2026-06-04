from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import asc

from app.core.db import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.category import Category
from app.schemas.admin_category import CategoryCreate, CategoryUpdate, CategoryOut

router = APIRouter(prefix="/admin/categories", tags=["admin-categories"])

@router.get("", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return (
        db.query(Category)
        .filter(Category.shop_id == user.shop_id)
        .order_by(asc(Category.sort_order), asc(Category.id))
        .all()
    )

@router.post("", response_model=CategoryOut)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cat = Category(shop_id=user.shop_id, **payload.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

@router.patch("/{category_id}", response_model=CategoryOut)
def update_category(category_id: int, payload: CategoryUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cat = db.query(Category).filter(Category.id == category_id, Category.shop_id == user.shop_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Not found")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(cat, k, v)

    db.commit()
    db.refresh(cat)
    return cat

@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cat = db.query(Category).filter(Category.id == category_id, Category.shop_id == user.shop_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Not found")

    db.delete(cat)
    db.commit()
    return {"ok": True}
