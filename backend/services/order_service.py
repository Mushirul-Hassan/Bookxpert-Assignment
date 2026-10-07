from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy.orm import Session

import models
from config import APPROVAL_THRESHOLD


def create_order(db: Session, data, user: models.User) -> models.Order:
    customer = db.get(models.Customer, data.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    
    wanted: dict[int, int] = {}
    for item in data.items:
        wanted[item.product_id] = wanted.get(item.product_id, 0) + item.quantity

    try:
        order = models.Order(
            customer_id=customer.id,
            created_by=user.id,
            total_amount=Decimal("0"),
            status=models.PENDING,
        )
        db.add(order)

        total = Decimal("0")
        locked = []  

        
        for product_id in sorted(wanted):
            qty = wanted[product_id]
            product = (
                db.query(models.Product)
                .filter(models.Product.id == product_id)
                .with_for_update()  
                .first()
            )
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {product_id} not found")
            if product.stock < qty:
                raise HTTPException(
                    status_code=400,
                    detail=f"Not enough stock for '{product.name}'. "
                    f"Available: {product.stock}, requested: {qty}",
                )

            line_total = product.price * qty
            order.items.append(
                models.OrderItem(
                    product_id=product.id,
                    quantity=qty,
                    unit_price=product.price,
                    line_total=line_total,
                )
            )
            total += line_total
            locked.append((product, qty))

        order.total_amount = total
        db.flush()  

        if total > APPROVAL_THRESHOLD:
        
            order.status = models.PENDING
            db.add(models.Approval(order_id=order.id))
        else:
        
            for product, qty in locked:
                product.stock -= qty
                db.add(
                    models.InventoryMovement(
                        product_id=product.id,
                        order_id=order.id,
                        change=-qty,
                        reason="ORDER_COMPLETED",
                    )
                )
            order.status = models.COMPLETED

        db.commit()  
        db.refresh(order)
        return order
    except Exception:
        db.rollback()  
        raise