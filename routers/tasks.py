
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from uuid import uuid4
from typing import List
from models.task_models import Task, StatusEnum
from database import SessionLocal, Base, engine
from sqlalchemy import Column, String, Text, Enum, ForeignKey
import enum
from models.user_models import User

class StatusEnum(str, enum.Enum):
    todo = "To do"
    in_progress = "In Progress"
    done = "Done"
from sqlalchemy import Column, String, ForeignKey
from database import Base




# class Task(Base):
#     __tablename__ = "tasks"
#
#     id = Column(String(36), primary_key=True, index=True)
#     title = Column(String(255))
#     description = Column(Text)
#     status = Column(Enum(StatusEnum))
#     assignee_id = Column(String(100))
#     project_id = Column(String(36), ForeignKey("projects.id"))  # 假设你也有 projects 表

#
# Base.metadata.create_all(bind=engine)


class TaskCreate(BaseModel):
    title: str
    description: str
    status: StatusEnum
    assignee_id: str
    project_id: str

class TaskOut(TaskCreate):
    id: str


router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=List[TaskOut])
def get_all_tasks(db: Session = Depends(get_db)):
    return db.query(Task).all()

@router.post("/tasks/", response_model=TaskOut)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    task_id = str(uuid4())


    db_task = Task(id=task_id, **task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/{project_id}", response_model=List[TaskOut])
def get_tasks(project_id: str, db: Session = Depends(get_db)):
    return db.query(Task).filter(Task.project_id == project_id).all()

@router.delete("/tasks/{task_id}")
def delete_task(task_id: str, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Deleted"}


@router.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: str, updated: TaskCreate, db: Session = Depends(get_db)):
    try:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        for key, value in updated.dict().items():
            setattr(task, key, value)
        # task.title = updated.title
        # task.description = updated.description
        # task.status = updated.status
        # task.assignee_id = updated.assignee_id
        # task.assignee_name = updated.assignee_name  # ✅ 关键

        db.commit()
        db.refresh(task)
        return task

    except Exception as e:
        db.rollback()
        print(" Update failed:", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/task/{task_id}", response_model=TaskOut)
def get_task_detail(task_id: str, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task