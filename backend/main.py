from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from schemas import ProductCreate, ProductOut
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