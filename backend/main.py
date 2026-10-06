# from fastapi import FastAPI, Depends, HTTPException
# from sqlalchemy.orm import Session
# from schemas import ProductCreate, ProductOut, CustomerCreate, CustomerOut, UserCreate, UserOut, LoginRequest
# from auth import hash_password, verify_password, create_token, get_current_user
# from database import engine, Base, get_db
# import models

# Base.metadata.create_all(bind=engine)

# app = FastAPI()

# # @app.get("/")
# # def home():
# #     return {"msg": "working"}

# @app.get("/products", response_model=list[ProductOut])
# def list_products(db: Session = Depends(get_db)):
#     return db.query(models.Product).all()

# @app.post("/products", response_model=ProductOut)
# def create_product(data: ProductCreate, db: Session = Depends(get_db)):
#     product = models.Product(**data.model_dump())
#     db.add(product)
#     db.commit()
#     db.refresh(product)
#     return product

# @app.get("/customers", response_model=list[CustomerOut])
# def list_customers(db: Session = Depends(get_db)):
#     return db.query(models.Customer).all()

# @app.post("/customers", response_model=CustomerOut)
# def create_customer(data: CustomerCreate, db: Session = Depends(get_db)):
#     exists = db.query(models.Customer).filter(models.Customer.email == data.email).first()
#     if exists:
#         raise HTTPException(status_code=400, detail="Customer with this email already exists")
#     customer = models.Customer(**data.model_dump())
#     db.add(customer)
#     db.commit()
#     db.refresh(customer)
#     return customer


# @app.post("/register", response_model=UserOut)
# def register(data: UserCreate, db: Session = Depends(get_db)):
#     if db.query(models.User).filter(models.User.email == data.email).first():
#         raise HTTPException(status_code=400, detail="Email already registered")
#     user = models.User(
#         name=data.name,
#         email=data.email,
#         password_hash=hash_password(data.password),
#         role=data.role,
#     )
#     db.add(user)
#     db.commit()
#     db.refresh(user)
#     return user


# @app.post("/login")
# def login(data: LoginRequest, db: Session = Depends(get_db)):
#     user = db.query(models.User).filter(models.User.email == data.email).first()
#     if not user or not verify_password(data.password, user.password_hash):
#         raise HTTPException(status_code=401, detail="Incorrect email or password")
#     return {"access_token": create_token(user.id), "token_type": "bearer", "role": user.role}

# @app.get("/me", response_model=UserOut)
# def me(user: models.User = Depends(get_current_user)):
#     return user


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models  # noqa: F401  (makes sure all tables are registered)
from database import Base, engine
from routers import auth_routes, customers, products, orders

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sales & Inventory Management")

# lets your React app (Vite runs on 5173) call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)