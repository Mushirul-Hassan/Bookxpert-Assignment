from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas import ProductCreate, ProductOut, CustomerCreate, CustomerOut
from database import engine, Base, get_db
import models

Base.metadata.create_all(bind=engine)

app = FastAPI()

# @app.get("/")
# def home():
#     return {"msg": "working"}

@app.get("/products", response_model=list[ProductOut])
def list_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()

@app.post("/products", response_model=ProductOut)
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    product = models.Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@app.get("/customers", response_model=list[CustomerOut])
def list_customers(db: Session = Depends(get_db)):
    return db.query(models.Customer).all()

@app.post("/customers", response_model=CustomerOut)
def create_customer(data: CustomerCreate, db: Session = Depends(get_db)):
    exists = db.query(models.Customer).filter(models.Customer.email == data.email).first()
    if exists:
        raise HTTPException(status_code=400, detail="Customer with this email already exists")
    customer = models.Customer(**data.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer