# from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
# from sqlalchemy.orm import Session

# import models
# from auth import get_current_user
# from database import get_db
# from schemas import OrderCreate, OrderOut
# from services import email_service, order_service

# router = APIRouter(prefix="/orders", tags=["Orders"])


# @router.post("", response_model=OrderOut)
# def create_order(
#     data: OrderCreate,
#     background_tasks: BackgroundTasks,
#     db: Session = Depends(get_db),
#     user: models.User = Depends(get_current_user),
# ):
#     order = order_service.create_order(db, data, user)

#     if order.status == models.PENDING:
#         managers = db.query(models.User).filter(models.User.role == "manager").all()
#         emails = [m.email for m in managers]
#         if emails:
#             # runs AFTER the response is sent, so the user doesn't wait for SMTP
#             background_tasks.add_task(
#                 email_service.notify_managers_approval_required,
#                 emails,
#                 order.id,
#                 order.customer.name,
#                 str(order.total_amount),
#                 user.name,
#             )
#     return order


# @router.get("", response_model=list[OrderOut])
# def list_orders(
#     db: Session = Depends(get_db),
#     user: models.User = Depends(get_current_user),
# ):
#     query = db.query(models.Order)
#     if user.role != "manager":
#         query = query.filter(models.Order.created_by == user.id)
#     return query.order_by(models.Order.id.desc()).all()


# @router.get("/{order_id}", response_model=OrderOut)
# def get_order(
#     order_id: int,
#     db: Session = Depends(get_db),
#     user: models.User = Depends(get_current_user),
# ):
#     order = db.get(models.Order, order_id)
#     if not order or (user.role != "manager" and order.created_by != user.id):
#         raise HTTPException(status_code=404, detail="Order not found")
#     return order


from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

import models
from auth import get_current_user
from config import APPROVAL_THRESHOLD
from database import get_db
from schemas import OrderCreate, OrderOut
from services import email_service, order_service

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("/config")
def order_config(user: models.User = Depends(get_current_user)):
    return {"approval_threshold": float(APPROVAL_THRESHOLD)}


@router.post("", response_model=OrderOut)
def create_order(
    data: OrderCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    order = order_service.create_order(db, data, user)

    if order.status == models.PENDING:
        managers = db.query(models.User).filter(models.User.role == "manager").all()
        emails = [m.email for m in managers]
        if emails:
            background_tasks.add_task(
                email_service.notify_managers_approval_required,
                emails,
                order.id,
                order.customer.name,
                str(order.total_amount),
                user.name,
            )
    return order


@router.get("", response_model=list[OrderOut])
def list_orders(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    query = db.query(models.Order)
    if user.role != "manager":
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