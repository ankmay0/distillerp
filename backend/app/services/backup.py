import os
import json
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.backup_schedule import BackupSchedule
from app.models.production import Production
from app.models.sales import Sales
from app.models.expenses import Expense

def get_backup_path() -> Path:
    path = Path(settings.BACKUP_PATH)
    path.mkdir(parents=True, exist_ok=True)
    return path

def create_json_backup(db: Session) -> str:
    """Create a full JSON backup of all data"""
    productions = db.query(Production).all()
    sales = db.query(Sales).all()
    expenses = db.query(Expense).all()

    def serialize(obj):
        if hasattr(obj, '__dict__'):
            return {k: str(v) for k, v in obj.__dict__.items()
                   if not k.startswith('_')}
        return str(obj)

    data = {
        "backup_date": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "production": [serialize(p) for p in productions],
        "sales": [serialize(s) for s in sales],
        "expenses": [serialize(e) for e in expenses],
    }

    backup_path = get_backup_path()
    filename = f"distillerp_backup_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
    filepath = backup_path / filename

    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2, default=str)

    # Keep only last 30 backups
    cleanup_old_backups(backup_path, keep=30)

    return str(filepath)

def cleanup_old_backups(backup_path: Path, keep: int = 30):
    backups = sorted(backup_path.glob("*.json"), key=os.path.getmtime)
    while len(backups) > keep:
        backups[0].unlink()
        backups.pop(0)

def get_next_run(frequency: str, hour: int, minute: int) -> datetime:
    now = datetime.utcnow()
    if frequency == "hourly":
        return now + timedelta(hours=1)
    elif frequency == "daily":
        next_run = now.replace(hour=hour, minute=minute, second=0)
        if next_run <= now:
            next_run += timedelta(days=1)
        return next_run
    elif frequency == "weekly":
        next_run = now.replace(hour=hour, minute=minute, second=0)
        next_run += timedelta(days=7)
        return next_run
    return now + timedelta(days=1)

def run_scheduled_backups(db: Session):
    """Called periodically to run due backups"""
    now = datetime.utcnow()
    schedules = db.query(BackupSchedule).filter(
        BackupSchedule.is_active == True,
        BackupSchedule.next_run <= now
    ).all()

    for schedule in schedules:
        try:
            filepath = create_json_backup(db)
            schedule.last_run = now
            schedule.next_run = get_next_run(
                schedule.frequency,
                schedule.hour,
                schedule.minute
            )
            db.commit()
            print(f"✅ Backup created: {filepath}")
        except Exception as e:
            print(f"❌ Backup failed: {e}")