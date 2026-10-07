from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

import models


def _get_pending_order(db: Session, order_id: int) -> models.Order:
    
    order = (
        db.query(models.Order)
        .filter(models.Order.id == order_id)
        .with_for_update()
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != models.PENDING:
        raise HTTPException(
            status_code=400, detail=f"Order is already {order.status}"
        )
    return order


def _record_decision(db, order, manager, decision, remarks):
    approval = order.approval
    if not approval:
        approval = models.Approval(order_id=order.id)
        db.add(approval)
    approval.manager_id = manager.id
    approval.decision = decision
    approval.remarks = remarks
    approval.decided_at = datetime.utcnow()


def approve_order(db: Session, order_id: int, manager: models.User, remarks):
    try:
        order = _get_pending_order(db, order_id)

       
        for item in sorted(order.items, key=lambda i: i.product_id):
            product = (
                db.query(models.Product)
                .filter(models.Product.id == item.product_id)
                .with_for_update()
                .first()
            )
            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Not enough stock for '{product.name}'. "
                    f"Available: {product.stock}, needed: {item.quantity}",
                )
            product.stock -= item.quantity
            db.add(
                models.InventoryMovement(
                    product_id=product.id,
                    order_id=order.id,
                    change=-item.quantity,
                    reason="ORDER_APPROVED",
                )
            )

        order.status = models.COMPLETED
        _record_decision(db, order, manager, "APPROVED", remarks)

        db.commit()  
        db.refresh(order)
        return order
    except Exception:
        db.rollback()
        raise


def reject_order(db: Session, order_id: int, manager: models.User, remarks):
    try:
        order = _get_pending_order(db, order_id)
        order.status = models.REJECTED  
        _record_decision(db, order, manager, "REJECTED", remarks)
        db.commit()
        db.refresh(order)
        return order
    except Exception:
        db.rollback()
        raise