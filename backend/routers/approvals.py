from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session

import models
from auth import require_manager
from database import get_db
from schemas import DecisionIn, OrderOut
from services import approval_service, email_service

router = APIRouter(prefix="/approvals", tags=["Approvals"])


@router.get("/pending", response_model=list[OrderOut])
def pending_orders(
    db: Session = Depends(get_db),
    manager: models.User = Depends(require_manager),
):
    return (
        db.query(models.Order)
        .filter(models.Order.status == models.PENDING)
        .order_by(models.Order.id)
        .all()
    )


@router.post("/{order_id}/approve", response_model=OrderOut)
def approve(
    order_id: int,
    background_tasks: BackgroundTasks,
    data: DecisionIn | None = None,
    db: Session = Depends(get_db),
    manager: models.User = Depends(require_manager),
):
    remarks = data.remarks if data else None
    order = approval_service.approve_order(db, order_id, manager, remarks)
    background_tasks.add_task(
        email_service.notify_user_decision,
        order.creator.email, order.id, "APPROVED", remarks, str(order.total_amount),
    )
    return order


@router.post("/{order_id}/reject", response_model=OrderOut)
def reject(
    order_id: int,
    background_tasks: BackgroundTasks,
    data: DecisionIn | None = None,
    db: Session = Depends(get_db),
    manager: models.User = Depends(require_manager),
):
    remarks = data.remarks if data else None
    order = approval_service.reject_order(db, order_id, manager, remarks)
    background_tasks.add_task(
        email_service.notify_user_decision,
        order.creator.email, order.id, "REJECTED", remarks, str(order.total_amount),
    )
    return order