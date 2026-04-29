from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime
from pathlib import Path
from typing import List
from pydantic import BaseModel
from app.core.database import get_db
from app.core.deps import get_current_user, require_superadmin
from app.models.user import User
from app.models.backup_schedule import BackupSchedule
from app.services.backup import (
    create_json_backup, get_backup_path,
    get_next_run
)

router = APIRouter(prefix="/backup", tags=["Backup"])

class ScheduleCreate(BaseModel):
    frequency: str = "daily"
    hour: int = 2
    minute: int = 0

@router.post("/now")
def backup_now(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    try:
        filepath = create_json_backup(db)
        return {
            "message": "Backup created successfully",
            "file": Path(filepath).name,
            "created_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
def list_backups(
    current_user: User = Depends(require_superadmin)
):
    backup_path = get_backup_path()
    files = sorted(backup_path.glob("*.json"), key=lambda f: f.stat().st_mtime, reverse=True)
    return [
        {
            "filename": f.name,
            "size_kb": round(f.stat().st_size / 1024, 2),
            "created_at": datetime.fromtimestamp(f.stat().st_mtime).isoformat()
        }
        for f in files
    ]

@router.get("/download/{filename}")
def download_backup(
    filename: str,
    current_user: User = Depends(require_superadmin)
):
    filepath = get_backup_path() / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Backup file not found")
    return FileResponse(
        path=str(filepath),
        filename=filename,
        media_type="application/json"
    )

@router.post("/schedule")
def create_schedule(
    data: ScheduleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    # Deactivate existing schedules
    db.query(BackupSchedule).update({"is_active": False})

    schedule = BackupSchedule(
        created_by=current_user.id,
        frequency=data.frequency,
        hour=data.hour,
        minute=data.minute,
        next_run=get_next_run(data.frequency, data.hour, data.minute)
    )
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return {
        "message": f"Backup scheduled {data.frequency}",
        "next_run": schedule.next_run.isoformat()
    }

@router.get("/schedule")
def get_schedule(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_superadmin)
):
    schedule = db.query(BackupSchedule).filter(
        BackupSchedule.is_active == True
    ).first()
    if not schedule:
        return {"message": "No active schedule"}
    return schedule