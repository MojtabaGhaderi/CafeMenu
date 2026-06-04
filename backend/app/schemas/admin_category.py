from pydantic import BaseModel

class CategoryCreate(BaseModel):
    title: str
    sort_order: int = 0
    is_active: bool = True

class CategoryUpdate(BaseModel):
    title: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None

class CategoryOut(BaseModel):
    id: int
    title: str
    sort_order: int
    is_active: bool
