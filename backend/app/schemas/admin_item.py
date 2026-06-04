from pydantic import BaseModel


class ItemCreate(BaseModel):
    category_id: int
    title: str
    description: str | None = None
    price: int
    sort_order: int = 0
    is_published: bool = True
    is_available: bool = True


class ItemUpdate(BaseModel):
    category_id: int | None = None
    title: str | None = None
    description: str | None = None
    price: int | None = None
    sort_order: int | None = None
    is_published: bool | None = None
    is_available: bool | None = None


class ItemOut(BaseModel):
    id: int
    category_id: int
    title: str
    description: str | None
    price: int
    sort_order: int
    is_published: bool
    is_available: bool
