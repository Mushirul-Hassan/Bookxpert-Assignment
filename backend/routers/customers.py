from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
from auth import get_current_user
from database import get_db
from schemas import CustomerCreate, CustomerOut

router = APIRouter(
    prefix="/customers",
    tags=["Customers"],
    dependencies=[Depends(get_current_user)],
)


@router.get("", response_model=list[CustomerOut])
def list_customers(db: Session = Depends(get_db)):
    return db.query(models.Customer).order_by(models.Customer.id.desc()).all()


@router.post("", response_model=CustomerOut)
def create_customer(data: CustomerCreate, db: Session = Depends(get_db)):
    exists = db.query(models.Customer).filter(models.Customer.email == data.email).first()
    if exists:
        raise HTTPException(status_code=400, detail="Customer with this email already exists")
    customer = models.Customer(**data.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.put("/{customer_id}", response_model=CustomerOut)
def update_customer(customer_id: int, data: CustomerCreate, db: Session = Depends(get_db)):
    customer = db.get(models.Customer, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    clash = (
        db.query(models.Customer)
        .filter(models.Customer.email == data.email, models.Customer.id != customer_id)
        .first()
    )
    if clash:
        raise HTTPException(status_code=400, detail="Another customer already uses this email")
    for field, value in data.model_dump().items():
        setattr(customer, field, value)
    db.commit()
    db.refresh(customer)
    return customer


