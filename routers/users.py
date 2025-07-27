from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import SessionLocal
from models.user_models import User
import uuid

router = APIRouter(prefix="/users", tags=["Users"])

class UserCreate(BaseModel):
    name: str


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    user_id = str(uuid.uuid4())
    db_user = User(id=user_id, name=user.name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/")
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

