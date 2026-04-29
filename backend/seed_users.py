import sys
sys.path.append(".")

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User

db = SessionLocal()

users = [
    {
        "full_name": "Super Admin",
        "email": "superadmin@distillerp.com",
        "password": "super@123",
        "role": "superadmin",
        "is_admin": True,
    },
    {
        "full_name": "Owner Admin",
        "email": "owner@distillerp.com",
        "password": "owner@123",
        "role": "owner",
        "is_admin": True,
    },
    {
        "full_name": "Admin 2",
        "email": "admin2@distillerp.com",
        "password": "admin2@123",
        "role": "admin",
        "is_admin": True,
    },
]

for u in users:
    existing = db.query(User).filter(User.email == u["email"]).first()
    if not existing:
        user = User(
            full_name=u["full_name"],
            email=u["email"],
            hashed_password=hash_password(u["password"]),
            plain_password=u["password"],
            role=u["role"],
            is_admin=u["is_admin"],
        )
        db.add(user)
        print(f"✅ Created: {u['full_name']} ({u['role']})")
    else:
        print(f"⚠️ Already exists: {u['email']}")

db.commit()
db.close()
print("\n🎉 Done! Users seeded.")