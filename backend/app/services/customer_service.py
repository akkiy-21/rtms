# customer_service.py

from sqlalchemy.orm import Session
from ..crud import customer_crud
from .. import schemas

def get_customer(db: Session, customer_id: int):
    return customer_crud.get_customer(db, customer_id)

def get_customers(db: Session, skip: int = 0, limit: int = 100):
    return customer_crud.get_customers(db, skip, limit)

def create_customer(db: Session, customer: schemas.CustomerCreate):
    return customer_crud.create_customer(db, customer)

def update_customer(db: Session, customer_id: int, customer: schemas.CustomerUpdate):
    return customer_crud.update_customer(db, customer_id, customer)

def delete_customer(db: Session, customer_id: int):
    return customer_crud.delete_customer(db, customer_id)