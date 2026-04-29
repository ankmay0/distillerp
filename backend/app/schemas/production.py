from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class ProductionCreate(BaseModel):
    date: date
    shift: str
    operator: str
    mahua: float = 0
    sugar: float = 0
    molasses: float = 0
    open_produced: float = 0
    pkg_produced: float = 0
    opening_stock: float = 0
    notes: Optional[str] = None

class ProductionUpdate(BaseModel):
    shift: Optional[str] = None
    operator: Optional[str] = None
    mahua: Optional[float] = None
    sugar: Optional[float] = None
    molasses: Optional[float] = None
    open_produced: Optional[float] = None
    pkg_produced: Optional[float] = None
    opening_stock: Optional[float] = None
    notes: Optional[str] = None

class ProductionOut(BaseModel):
    id: int
    date: date
    batch_number: str
    shift: str
    operator: str
    mahua: float
    sugar: float
    molasses: float
    open_produced: float
    pkg_produced: float
    opening_stock: float
    notes: Optional[str]
    created_by: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True