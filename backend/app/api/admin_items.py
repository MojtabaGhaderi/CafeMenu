from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import asc

from app.core.db import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.item import Item
from app.models.category import Category
from app.schemas.admin_item import ItemCreate, ItemUpdate, ItemOut

router = APIRouter(prefix="/admin/items", tags=["admin-items"])


@router.get("", response_model=list[ItemOut])
def list_items(
    category_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(Item).filter(Item.shop_id == user.shop_id)
    if category_id is not None:
        q = q.filter(Item.category_id == category_id)

    return q.order_by(asc(Item.sort_order), asc(Item.id)).all()


@router.post("", response_model=ItemOut)
def create_item(payload: ItemCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # ensure category belongs to this shop
    cat = db.query(Category).filter(Category.id == payload.category_id, Category.shop_id == user.shop_id).first()
    if not cat:
        raise HTTPException(status_code=400, detail="Invalid category_id")

    item = Item(shop_id=user.shop_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=ItemOut)
def update_item(item_id: int, payload: ItemUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = db.query(Item).filter(Item.id == item_id, Item.shop_id == user.shop_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")

    data = payload.model_dump(exclude_unset=True)

    # if category changes, validate it belongs to shop
    if "category_id" in data:
        cat = db.query(Category).filter(Category.id == data["category_id"], Category.shop_id == user.shop_id).first()
        if not cat:
            raise HTTPException(status_code=400, detail="Invalid category_id")

    for k, v in data.items():
        setattr(item, k, v)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = db.query(Item).filter(Item.id == item_id, Item.shop_id == user.shop_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")

    db.delete(item)
    db.commit()
    return {"ok": True}
