from sqlalchemy import Column, Integer, Float, Date, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)

    salary = Column(Float, default=0)
    diesel = Column(Float, default=0)
    petrol = Column(Float, default=0)
    meals = Column(Float, default=0)
    others = Column(Float, default=0)
    others_desc = Column(String, nullable=True)
    total = Column(Float, default=0)

    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())