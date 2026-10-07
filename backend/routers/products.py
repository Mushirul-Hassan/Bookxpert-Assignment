from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
from auth import get_current_user
from database import get_db
from schemas import ProductCreate, ProductOut

router = APIRouter(
    prefix="/products",
    tags=["Products"],
    dependencies=[Depends(get_current_user)],
)


@router.get("", response_model=list[ProductOut])
def list_products(db: Session = Depends(get_db)):
    return db.query(models.Product).order_by(models.Product.id.desc()).all()


@router.post("", response_model=ProductOut)
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    product = models.Product(**data.model_dump())
    db.add(product)
    db.flush()  
    if product.stock > 0:
        db.add(
            models.InventoryMovement(
                product_id=product.id, change=product.stock, reason="INITIAL_STOCK"
            )
        )
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, data: ProductCreate, db: Session = Depends(get_db)):
    product = (
        db.query(models.Product)
        .filter(models.Product.id == product_id)
        .with_for_update()
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    diff = data.stock - product.stock
    product.name = data.name
    product.price = data.price
    product.stock = data.stock
    if diff != 0:
        db.add(
            models.InventoryMovement(
                product_id=product.id, change=diff, reason="MANUAL_ADJUSTMENT"
            )
        )
    db.commit()
    db.refresh(product)
    return product


