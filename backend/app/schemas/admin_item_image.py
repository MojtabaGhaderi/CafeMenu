from pydantic import BaseModel, HttpUrl


class ItemImageCreate(BaseModel):
    url: HttpUrl
    sort_order: int = 1


class ItemImageUpdate(BaseModel):
    url: HttpUrl | None = None
    sort_order: int | None = None


class ItemImageOut(BaseModel):
    id: int
    item_id: int
    url: str
    sort_order: int
