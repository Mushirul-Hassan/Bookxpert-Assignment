from pydantic import BaseModel, Field

class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    price: float = Field(gt=0)
    stock: int = Field(ge=0, default=0)

class ProductOut(BaseModel):
    id: int
    name: str
    price: float
    stock: int

    model_config = {"from_attributes": True}