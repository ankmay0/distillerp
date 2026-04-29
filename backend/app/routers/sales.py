from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.sales import SalesCreate, SalesUpdate, SalesOut
from app.services import sales as sales_service

router = APIRouter(prefix="/sales", tags=["Sales"])

@router.post("/", response_model=SalesOut)
def create(
    data: SalesCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = sales_service.get_sales_by_date(db, data.date)
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Sales entry already exists for {data.date}. Use PUT to update."
        )
    return sales_service.create_sales(db, data, current_user.id)

@router.get("/", response_model=List[SalesOut])
def get_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return sales_service.get_all_sales(db, skip, limit)

@router.get("/{entry_date}", response_model=SalesOut)
def get_by_date(
    entry_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sales = sales_service.get_sales_by_date(db, entry_date)
    if not sales:
        raise HTTPException(
            status_code=404,
            detail=f"No sales entry found for {entry_date}"
        )
    return sales

@router.put("/{entry_date}", response_model=SalesOut)
def update(
    entry_date: date,
    data: SalesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sales = sales_service.update_sales(db, entry_date, data)
    if not sales:
        raise HTTPException(status_code=404, detail="Sales entry not found")
    return sales

@router.delete("/{entry_date}")
def delete(
    entry_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = sales_service.delete_sales(db, entry_date)
    if not success:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"message": "Sales entry deleted successfully"}