from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.production import Production
from app.schemas.production import ProductionCreate, ProductionUpdate
from datetime import date

def generate_batch_number(db: Session, entry_date: date) -> str:
    # Format: B-YYMMDD-NNN
    date_str = entry_date.strftime("%y%m%d")
    count = db.query(Production).filter(
        func.date(Production.date) == entry_date
    ).count()
    seq = str(count + 1).zfill(3)
    return f"B-{date_str}-{seq}"

def create_production(
    db: Session,
    data: ProductionCreate,
    user_id: int
) -> Production:
    batch = generate_batch_number(db, data.date)
    production = Production(
        **data.model_dump(),
        batch_number=batch,
        created_by=user_id
    )
    db.add(production)
    db.commit()
    db.refresh(production)
    return production

def get_production_by_date(db: Session, entry_date: date):
    return db.query(Production).filter(
        func.date(Production.date) == entry_date
    ).first()

def get_all_productions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Production).order_by(
        Production.date.desc()
    ).offset(skip).limit(limit).all()

def update_production(
    db: Session,
    entry_date: date,
    data: ProductionUpdate
) -> Production:
    production = get_production_by_date(db, entry_date)
    if not production:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(production, field, value)
    db.commit()
    db.refresh(production)
    return production

def delete_production(db: Session, entry_date: date) -> bool:
    production = get_production_by_date(db, entry_date)
    if not production:
        return False
    db.delete(production)
    db.commit()
    return True