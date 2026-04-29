from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    decode_token
)
from app.core.deps import get_current_user, require_superadmin
from app.models.user import User
from app.models.login_log import LoginLog
from app.schemas.user import UserLogin, Token, UserOut, UserOutWithPassword
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Authentication"])

class RefreshRequest(BaseModel):
    refresh_token: str

class PasswordChange(BaseModel):
    password: str

@router.post("/login", response_model=Token)
def login(
    data: UserLogin,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == data.email).first()

    log = LoginLog(
        email=data.email,
        ip_address="N/A",
    )

    if not user or not verify_password(data.password, user.hashed_password):
        log.success = False
        log.reason = "Invalid credentials"
        db.add(log)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.is_active:
        log.success = False
        log.reason = "Account disabled"
        db.add(log)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is disabled. Contact your administrator."
        )

    log.success = True
    db.add(log)
    db.commit()

    access_token = create_access_token({
        "sub": str(user.id),
        "role": user.role
    })
    refresh_token = create_refresh_token({
        "sub": str(user.id),
        "role": user.role
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/refresh")
def refresh_token(
    data: RefreshRequest,
    db: Session = Depends(get_db)
):
    payload = decode_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    user = db.query(User).filter(
        User.id == int(payload["sub"])
    ).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    access_token = create_access_token({
        "sub": str(user.id),
        "role": user.role
    })
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserOut)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user

@router.get("/users", response_model=List[UserOutWithPassword])
def get_all_users(
    current_user: User = Depends(require_superadmin),
    db: Session = Depends(get_db)
):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "plain_password": u.plain_password if u.role != "superadmin" else "••••••••",
            "created_at": u.created_at
        }
        for u in users
    ]

@router.get("/login-logs")
def get_login_logs(
    current_user: User = Depends(require_superadmin),
    db: Session = Depends(get_db)
):
    logs = db.query(LoginLog).order_by(
        LoginLog.created_at.desc()
    ).limit(100).all()
    return logs

@router.patch("/users/{user_id}/toggle-active")
def toggle_user(
    user_id: int,
    current_user: User = Depends(require_superadmin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    if user.role == "superadmin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify superadmin account"
        )
    user.is_active = not user.is_active
    db.commit()
    return {
        "message": f"{user.full_name} is now {'active' if user.is_active else 'disabled'}"
    }

@router.put("/users/{user_id}/password")
def change_password(
    user_id: int,
    data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "superadmin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to change this password"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if len(data.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters"
        )

    user.hashed_password = hash_password(data.password)
    if current_user.role == "superadmin" and user.role != "superadmin":
        user.plain_password = data.password
    db.commit()
    return {"message": "Password updated successfully"}