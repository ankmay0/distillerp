from sqlalchemy import Column, Integer, String, Float, Date, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Production(Base):
    __tablename__ = "production"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    batch_number = Column(String, unique=True, nullable=False)
    shift = Column(String, nullable=False)
    operator = Column(String, nullable=False)

    # Raw materials (kg)
    mahua = Column(Float, default=0)
    sugar = Column(Float, default=0)
    molasses = Column(Float, default=0)

    # Output (litres)
    open_produced = Column(Float, default=0)
    pkg_produced = Column(Float, default=0)
    opening_stock = Column(Float, default=0)

    notes = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())