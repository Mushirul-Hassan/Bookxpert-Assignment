from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

import models
from auth import get_current_user
from config import LOW_STOCK_THRESHOLD
from database import get_db

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("")
def dashboard(
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    # manager sees all orders, a normal user sees only their own
    orders = db.query(models.Order)
    if user.role != "manager":
        orders = orders.filter(models.Order.created_by == user.id)

    # orders count by status
    counts = {models.PENDING: 0, models.COMPLETED: 0, models.REJECTED: 0}
    rows = (
        orders.with_entities(models.Order.status, func.count(models.Order.id))
        .group_by(models.Order.status)
        .all()
    )
    for status, count in rows:
        counts[status] = count

    # total sales = sum of completed orders only
    total_sales = (
        orders.filter(models.Order.status == models.COMPLETED)
        .with_entities(func.coalesce(func.sum(models.Order.total_amount), 0))
        .scalar()
    )

    # sales per day for the last 7 days
    since = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=6)
    day = func.date(models.Order.created_at)
    daily_rows = (
        orders.filter(
            models.Order.status == models.COMPLETED,
            models.Order.created_at >= since,
        )
        .with_entities(day, func.sum(models.Order.total_amount))
        .group_by(day)
        .order_by(day)
        .all()
    )
    daily_sales = [{"date": str(d), "total": float(t)} for d, t in daily_rows]

    # inventory summary (same for everyone)
    total_products = db.query(func.count(models.Product.id)).scalar()
    total_units = db.query(func.coalesce(func.sum(models.Product.stock), 0)).scalar()
    low_stock = (
        db.query(models.Product)
        .filter(models.Product.stock <= LOW_STOCK_THRESHOLD)
        .order_by(models.Product.stock)
        .limit(10)
        .all()
    )

    recent = orders.order_by(models.Order.id.desc()).limit(5).all()

    return {
        "sales": {
            "total_sales": float(total_sales),
            "daily_sales": daily_sales,
        },
        "orders": {
            "total": sum(counts.values()),
            "pending_approval": counts[models.PENDING],
            "completed": counts[models.COMPLETED],
            "rejected": counts[models.REJECTED],
        },
        "inventory": {
            "total_products": total_products,
            "total_units": int(total_units),
            "low_stock_threshold": LOW_STOCK_THRESHOLD,
            "low_stock": [
                {"id": p.id, "name": p.name, "stock": p.stock} for p in low_stock
            ],
        },
        "recent_orders": [
            {
                "id": o.id,
                "customer": o.customer.name,
                "total": float(o.total_amount),
                "status": o.status,
                "created_at": o.created_at,
            }
            for o in recent
        ],
    }