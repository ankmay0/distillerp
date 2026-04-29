from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.expenses import Expense
from app.schemas.expenses import ExpenseCreate, ExpenseUpdate
from datetime import date

def calculate_total(data: dict) -> float:
    return sum([
        data.get("salary", 0),
        data.get("diesel", 0),
        data.get("petrol", 0),
        data.get("meals", 0),
        data.get("others", 0),
    ])

def create_expense(db: Session, data: ExpenseCreate, user_id: int) -> Expense:
    data_dict = data.model_dump()
    total = calculate_total(data_dict)
    expense = Expense(**data_dict, total=total, created_by=user_id)
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

def get_expense_by_date(db: Session, entry_date: date):
    return db.query(Expense).filter(
        func.date(Expense.date) == entry_date
    ).first()

def get_all_expenses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Expense).order_by(
        Expense.date.desc()
    ).offset(skip).limit(limit).all()

def update_expense(db: Session, entry_date: date, data: ExpenseUpdate) -> Expense:
    expense = get_expense_by_date(db, entry_date)
    if not expense:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(expense, field, value)
    expense.total = calculate_total({
        "salary": expense.salary,
        "diesel": expense.diesel,
        "petrol": expense.petrol,
        "meals": expense.meals,
        "others": expense.others,
    })
    db.commit()
    db.refresh(expense)
    return expense

def delete_expense(db: Session, entry_date: date) -> bool:
    expense = get_expense_by_date(db, entry_date)
    if not expense:
        return False
    db.delete(expense)
    db.commit()
    return True