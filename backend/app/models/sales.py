from sqlalchemy import Column, Integer, Float, Date, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class Sales(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)

    # Packaged bottles (qty)
    qty_p1 = Column(Float, default=0)
    qty_p2 = Column(Float, default=0)
    qty_p3 = Column(Float, default=0)

    # Packaged rates
    rate_p1 = Column(Float, default=0)
    rate_p2 = Column(Float, default=0)
    rate_p3 = Column(Float, default=0)

    # Open liquor (litres)
    qty_o1 = Column(Float, default=0)
    qty_o2 = Column(Float, default=0)
    qty_o3 = Column(Float, default=0)

    # Open rates
    rate_o1 = Column(Float, default=0)
    rate_o2 = Column(Float, default=0)
    rate_o3 = Column(Float, default=0)

    total_sales = Column(Float, default=0)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())