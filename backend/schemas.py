from pydantic import BaseModel, Field, EmailStr


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

class CustomerCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    phone: str | None = None
    address: str | None = None

class CustomerOut(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None
    address: str | None

    model_config = {"from_attributes": True}
