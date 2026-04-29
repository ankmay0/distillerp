from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class SalesCreate(BaseModel):
    date: date
    # Packaged quantities
    qty_p1: float = 0
    qty_p2: float = 0
    qty_p3: float = 0
    # Packaged rates
    rate_p1: float = 0
    rate_p2: float = 0
    rate_p3: float = 0
    # Open liquor quantities
    qty_o1: float = 0
    qty_o2: float = 0
    qty_o3: float = 0
    # Open rates
    rate_o1: float = 0
    rate_o2: float = 0
    rate_o3: float = 0

class SalesUpdate(BaseModel):
    qty_p1: Optional[float] = None
    qty_p2: Optional[float] = None
    qty_p3: Optional[float] = None
    rate_p1: Optional[float] = None
    rate_p2: Optional[float] = None
    rate_p3: Optional[float] = None
    qty_o1: Optional[float] = None
    qty_o2: Optional[float] = None
    qty_o3: Optional[float] = None
    rate_o1: Optional[float] = None
    rate_o2: Optional[float] = None
    rate_o3: Optional[float] = None

class SalesOut(BaseModel):
    id: int
    date: date
    qty_p1: float
    qty_p2: float
    qty_p3: float
    rate_p1: float
    rate_p2: float
    rate_p3: float
    qty_o1: float
    qty_o2: float
    qty_o3: float
    rate_o1: float
    rate_o2: float
    rate_o3: float
    total_sales: float
    created_by: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True