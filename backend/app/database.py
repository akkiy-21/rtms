#database.py
import os
from urllib.parse import quote_plus

from app import env  # noqa: F401

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


def _build_database_url_from_parts() -> str:
    user = os.getenv("POSTGRES_USER", "mmi")
    password = os.getenv("POSTGRES_PASSWORD", "@Miyazaki2271")
    host = os.getenv("POSTGRES_HOST", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")
    database = os.getenv("POSTGRES_DB", "mmi_scada")
    return f"postgresql+psycopg://{quote_plus(user)}:{quote_plus(password)}@{host}:{port}/{database}"


DEFAULT_SQLALCHEMY_DATABASE_URL = _build_database_url_from_parts()
SQLALCHEMY_DATABASE_URL = os.getenv(
    "RTMS_DATABASE_URL",
    os.getenv("POSTGRES_USER") and _build_database_url_from_parts() or os.getenv("DATABASE_URL", DEFAULT_SQLALCHEMY_DATABASE_URL),
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()