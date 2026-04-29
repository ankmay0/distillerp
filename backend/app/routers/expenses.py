from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.expenses import ExpenseCreate, ExpenseUpdate, ExpenseOut
from app.services import expenses as expense_service

router = APIRouter(prefix="/expenses", tags=["Expenses"])

@router.post("/", response_model=ExpenseOut)
def create(
    data: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = expense_service.get_expense_by_date(db, data.date)
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Expense entry already exists for {data.date}. Use PUT to update."
        )
    return expense_service.create_expense(db, data, current_user.id)

@router.get("/", response_model=List[ExpenseOut])
def get_all(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return expense_service.get_all_expenses(db, skip, limit)

@router.get("/{entry_date}", response_model=ExpenseOut)
def get_by_date(
    entry_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = expense_service.get_expense_by_date(db, entry_date)
    if not expense:
        raise HTTPException(
            status_code=404,
            detail=f"No expense entry found for {entry_date}"
        )
    return expense

@router.put("/{entry_date}", response_model=ExpenseOut)
def update(
    entry_date: date,
    data: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = expense_service.update_expense(db, entry_date, data)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense entry not found")
    return expense

@router.delete("/{entry_date}")
def delete(
    entry_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    success = expense_service.delete_expense(db, entry_date)
    if not success:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"message": "Expense entry deleted successfully"}