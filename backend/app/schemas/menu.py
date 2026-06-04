from pydantic import BaseModel


class ImageOut(BaseModel):
    id: int
    url: str
    sort_order: int


class ItemOut(BaseModel):
    id: int
    title: str
    description: str | None
    price: int
    is_available: bool
    images: list[ImageOut]


class CategoryOut(BaseModel):
    id: int
    title: str
    sort_order: int


class CategoryWithItemsOut(BaseModel):
    id: int
    title: str
    sort_order: int
    items: list[ItemOut]
