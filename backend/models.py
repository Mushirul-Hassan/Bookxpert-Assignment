from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from database import Base

PENDING = "PENDING_APPROVAL"
COMPLETED = "COMPLETED"
REJECTED = "REJECTED"


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    price = Column(Numeric(12, 2), nullable=False)
    stock = Column(Integer, nullable=False, default=0)


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    phone = Column(String(20))
    address = Column(String(255))


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="user")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_amount = Column(Numeric(12, 2), nullable=False)
    status = Column(String(30), nullable=False, default=PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer")
    creator = relationship("User")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    approval = relationship("Approval", back_populates="order", uselist=False)


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(12, 2), nullable=False)  
    line_total = Column(Numeric(12, 2), nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), unique=True, nullable=False)
    manager_id = Column(Integer, ForeignKey("users.id"))
    decision = Column(String(20)) 
    remarks = Column(Text)
    decided_at = Column(DateTime)

    order = relationship("Order", back_populates="approval")


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"))
    change = Column(Integer, nullable=False)  
    reason = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)