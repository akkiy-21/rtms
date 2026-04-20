# product_service.py

from sqlalchemy.orm import Session, selectinload
from ..crud import product_crud
from .. import schemas
from ..models import Products, Customers

def get_product(db: Session, product_id: int):
    return product_crud.get_product(db, product_id)

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return product_crud.get_products(db, skip, limit)

def create_product(db: Session, product: schemas.ProductCreate):
    return product_crud.create_product(db, product)

def update_product(db: Session, product_id: int, product: schemas.ProductUpdate):
    return product_crud.update_product(db, product_id, product)

def delete_product(db: Session, product_id: int):
    return product_crud.delete_product(db, product_id)

def get_products_with_customer(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Products).join(Customers).options(
        selectinload(Products.customer)
    ).offset(skip).limit(limit).all()