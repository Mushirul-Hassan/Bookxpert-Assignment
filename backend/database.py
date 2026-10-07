


import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
DB_SSL_CA = os.getenv("DB_SSL_CA")

connect_args = {}
engine_args = {}

if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False  
else:
    if DB_SSL_CA:
        ca_path = DB_SSL_CA
        if not os.path.isabs(ca_path):
            ca_path = os.path.join(os.path.dirname(__file__), ca_path)
        connect_args["ssl"] = {"ca": ca_path}
    engine_args = {
        "pool_pre_ping": True,   
        "pool_recycle": 280,
        "pool_size": 5,
        "max_overflow": 2,      
    }

engine = create_engine(DATABASE_URL, connect_args=connect_args, **engine_args)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()