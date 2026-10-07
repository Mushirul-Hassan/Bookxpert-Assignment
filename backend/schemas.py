from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


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


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)
    role: Literal["user", "manager"] = "user"


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# ---------- orders ----------
class OrderItemIn(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    customer_id: int
    items: list[OrderItemIn] = Field(min_length=1)


class OrderItemOut(BaseModel):
    product_id: int
    quantity: int
    unit_price: float
    line_total: float
    product: ProductOut

    model_config = {"from_attributes": True}


class ApprovalOut(BaseModel):
    decision: str | None = None
    remarks: str | None = None
    decided_at: datetime | None = None

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    status: str
    created_at: datetime
    customer: CustomerOut
    creator: UserOut
    approval: ApprovalOut | None = None
    items: list[OrderItemOut]

    model_config = {"from_attributes": True}


class DecisionIn(BaseModel):
    remarks: str | None = Field(default=None, max_length=500)

    
