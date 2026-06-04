from fastapi import APIRouter, Depends, HTTPException,UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import asc

from app.core.db import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.item import Item
from app.models.item_image import ItemImage
from app.schemas.admin_item_image import ItemImageCreate, ItemImageUpdate, ItemImageOut

from pathlib import Path
import secrets

router = APIRouter(prefix="/admin", tags=["admin-item-images"])


@router.get("/items/{item_id}/images", response_model=list[ItemImageOut])
def list_images(item_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = db.query(Item).filter(Item.id == item_id, Item.shop_id == user.shop_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    return (
        db.query(ItemImage)
        .filter(ItemImage.item_id == item_id)
        .order_by(asc(ItemImage.sort_order), asc(ItemImage.id))
        .all()
    )


@router.post("/items/{item_id}/images", response_model=ItemImageOut)
def add_image(item_id: int, payload: ItemImageCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = db.query(Item).filter(Item.id == item_id, Item.shop_id == user.shop_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    img = ItemImage(item_id=item_id, url=str(payload.url), sort_order=payload.sort_order)
    db.add(img)
    db.commit()
    db.refresh(img)
    return img


@router.patch("/item-images/{image_id}", response_model=ItemImageOut)
def update_image(image_id: int, payload: ItemImageUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    img = db.query(ItemImage).filter(ItemImage.id == image_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Not found")

    # authorize via item.shop_id
    item = db.query(Item).filter(Item.id == img.item_id, Item.shop_id == user.shop_id).first()
    if not item:
        raise HTTPException(status_code=403, detail="Forbidden")

    data = payload.model_dump(exclude_unset=True)
    if "url" in data:
        data["url"] = str(data["url"])

    for k, v in data.items():
        setattr(img, k, v)

    db.commit()
    db.refresh(img)
    return img


@router.delete("/item-images/{image_id}")
def delete_image(image_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    img = db.query(ItemImage).filter(ItemImage.id == image_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Not found")

    item = db.query(Item).filter(Item.id == img.item_id, Item.shop_id == user.shop_id).first()
    if not item:
        raise HTTPException(status_code=403, detail="Forbidden")

    db.delete(img)
    db.commit()
    return {"ok": True}


@router.post("/items/{item_id}/images/upload", response_model=ItemImageOut)
def upload_image(
    item_id: int,
    file: UploadFile = File(...),
    sort_order: int = Form(1),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    item = db.query(Item).filter(Item.id == item_id, Item.shop_id == user.shop_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Basic validation
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    # Determine extension
    ext = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
    }[file.content_type]

    # Tenant-safe path
    base_dir = Path("uploads") / "shops" / str(user.shop_id) / "items" / str(item_id)
    base_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{secrets.token_hex(16)}.{ext}"
    path = base_dir / filename

    # Save file (simple, ok for small files)
    contents = file.file.read()
    if len(contents) > 5 * 1024 * 1024:  # 5MB cap (adjust)
        raise HTTPException(status_code=400, detail="File too large")
    path.write_bytes(contents)

    url = f"/uploads/shops/{user.shop_id}/items/{item_id}/{filename}"

    img = ItemImage(item_id=item_id, url=url, sort_order=sort_order)
    db.add(img)
    db.commit()
    db.refresh(img)
    return img
