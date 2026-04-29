from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.sales import Sales
from app.schemas.sales import SalesCreate, SalesUpdate
from datetime import date

def calculate_total(data: dict) -> float:
    pkg = (
        data.get("qty_p1", 0) * data.get("rate_p1", 0) +
        data.get("qty_p2", 0) * data.get("rate_p2", 0) +
        data.get("qty_p3", 0) * data.get("rate_p3", 0)
    )
    open_liquor = (
        data.get("qty_o1", 0) * data.get("rate_o1", 0) +
        data.get("qty_o2", 0) * data.get("rate_o2", 0) +
        data.get("qty_o3", 0) * data.get("rate_o3", 0)
    )
    return pkg + open_liquor

def create_sales(db: Session, data: SalesCreate, user_id: int) -> Sales:
    data_dict = data.model_dump()
    total = calculate_total(data_dict)
    sales = Sales(**data_dict, total_sales=total, created_by=user_id)
    db.add(sales)
    db.commit()
    db.refresh(sales)
    return sales

def get_sales_by_date(db: Session, entry_date: date):
    return db.query(Sales).filter(
        func.date(Sales.date) == entry_date
    ).first()

def get_all_sales(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Sales).order_by(
        Sales.date.desc()
    ).offset(skip).limit(limit).all()

def update_sales(db: Session, entry_date: date, data: SalesUpdate) -> Sales:
    sales = get_sales_by_date(db, entry_date)
    if not sales:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(sales, field, value)
    # Recalculate total
    sales.total_sales = calculate_total({
        "qty_p1": sales.qty_p1, "rate_p1": sales.rate_p1,
        "qty_p2": sales.qty_p2, "rate_p2": sales.rate_p2,
        "qty_p3": sales.qty_p3, "rate_p3": sales.rate_p3,
        "qty_o1": sales.qty_o1, "rate_o1": sales.rate_o1,
        "qty_o2": sales.qty_o2, "rate_o2": sales.rate_o2,
        "qty_o3": sales.qty_o3, "rate_o3": sales.rate_o3,
    })
    db.commit()
    db.refresh(sales)
    return sales

def delete_sales(db: Session, entry_date: date) -> bool:
    sales = get_sales_by_date(db, entry_date)
    if not sales:
        return False
    db.delete(sales)
    db.commit()
    return True