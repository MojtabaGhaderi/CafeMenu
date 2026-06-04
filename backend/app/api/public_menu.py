from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import asc

from app.core.db import get_db
from app.models import Category, Item
from app.schemas.menu import CategoryOut, CategoryWithItemsOut, ItemOut, ImageOut

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    cats = (
        db.query(Category)
        .filter(Category.is_active == True)  # noqa: E712
        .order_by(asc(Category.sort_order), asc(Category.id))
        .all()
    )
    return cats


@router.get("/categories/{category_id}/items", response_model=list[ItemOut])
def list_items_by_category(category_id: int, db: Session = Depends(get_db)):
    items = (
        db.query(Item)
        .options(selectinload(Item.images))
        .filter(
            Item.category_id == category_id,
            Item.is_published == True,  # noqa: E712
        )
        .order_by(asc(Item.sort_order), asc(Item.id))
        .all()
    )
    # ensure images sorted
    for it in items:
        it.images.sort(key=lambda img: (img.sort_order, img.id))
    return items


@router.get("/menu", response_model=list[CategoryWithItemsOut])
@router.get("/menu", response_model=list[CategoryWithItemsOut])
def full_menu(db: Session = Depends(get_db)):
    cats = (
        db.query(Category)
        .options(
            selectinload(Category.items).selectinload(Item.images),
        )
        .filter(Category.is_active == True)  # noqa: E712
        .order_by(asc(Category.sort_order), asc(Category.id))
        .all()
    )

    result = []
    for c in cats:
        # Only published items should be public
        items = [i for i in c.items if i.is_published == True]  # noqa: E712
        items.sort(key=lambda i: (i.sort_order, i.id))

        # Sort images for each item
        for it in items:
            it.images.sort(key=lambda img: (img.sort_order, img.id))

        # Hide empty categories (recommended for public)
        if not items:
            continue

        result.append(
            {
                "id": c.id,
                "title": c.title,
                "sort_order": c.sort_order,
                "items": items,
            }
        )

    return result

    cats = (
        db.query(Category)
        .options(
            selectinload(Category.items).selectinload(Item.images),
        )
        .filter(Category.is_active == True)  # noqa: E712
        .order_by(asc(Category.sort_order), asc(Category.id))
        .all()
    )

    result = []
    for c in cats:
        items = [i for i in c.items if i.is_published]
        items.sort(key=lambda i: (i.sort_order, i.id))
        for it in items:
            it.images.sort(key=lambda img: (img.sort_order, img.id))

        result.append(
            {
                "id": c.id,
                "title": c.title,
                "sort_order": c.sort_order,
                "items": items,
            }
        )
    return result
