#database.py
import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DEFAULT_SQLALCHEMY_DATABASE_URL = "postgresql+psycopg://mmi:%40Miyazaki2271@localhost:5432/mmi_scada"
SQLALCHEMY_DATABASE_URL = os.getenv("RTMS_DATABASE_URL", os.getenv("DATABASE_URL", DEFAULT_SQLALCHEMY_DATABASE_URL))

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()