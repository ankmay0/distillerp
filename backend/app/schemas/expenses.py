from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class ExpenseCreate(BaseModel):
    date: date
    salary: float = 0
    diesel: float = 0
    petrol: float = 0
    meals: float = 0
    others: float = 0
    others_desc: Optional[str] = None

class ExpenseUpdate(BaseModel):
    salary: Optional[float] = None
    diesel: Optional[float] = None
    petrol: Optional[float] = None
    meals: Optional[float] = None
    others: Optional[float] = None
    others_desc: Optional[str] = None

class ExpenseOut(BaseModel):
    id: int
    date: date
    salary: float
    diesel: float
    petrol: float
    meals: float
    others: float
    others_desc: Optional[str]
    total: float
    created_by: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True