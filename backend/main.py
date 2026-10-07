from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models  # noqa: F401
from database import Base, engine
from routers import approvals, auth_routes, customers, dashboard, products, orders

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sales & Inventory Management")

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
app.include_router(approvals.router)
app.include_router(dashboard.router)

