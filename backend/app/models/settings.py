from sqlalchemy import Column, Float, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, default="Distillery Co.")
    location = Column(String, nullable=True)
    excise_licence = Column(String, nullable=True)
    gst_number = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    default_shift = Column(String, default="Morning")

    # Price slabs
    rate_p1 = Column(Float, default=50)
    label_p1 = Column(String, default="Slab A")
    rate_p2 = Column(Float, default=45)
    label_p2 = Column(String, default="Slab B")
    rate_p3 = Column(Float, default=20)
    label_p3 = Column(String, default="Slab C")

    rate_o1 = Column(Float, default=170)
    label_o1 = Column(String, default="Tier 1")
    rate_o2 = Column(Float, default=120)
    label_o2 = Column(String, default="Tier 2")
    rate_o3 = Column(Float, default=100)
    label_o3 = Column(String, default="Tier 3")

    updated_at = Column(DateTime(timezone=True), onupdate=func.now())