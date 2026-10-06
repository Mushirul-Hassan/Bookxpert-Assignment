from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
from auth import get_current_user
from database import get_db
from schemas import OrderCreate, OrderOut
from services import order_service

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderOut)
def create_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    return order_service.create_order(db, data, user)


@router.get("", response_model=list[OrderOut])
def list_orders(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    query = db.query(models.Order)
    if user.role != "manager":  # normal users only see their own orders
        query = query.filter(models.Order.created_by == user.id)
    return query.order_by(models.Order.id.desc()).all()


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    order = db.get(models.Order, order_id)
    if not order or (user.role != "manager" and order.created_by != user.id):
        raise HTTPException(status_code=404, detail="Order not found")
    return order