from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import SessionLocal, Base, engine
from models.project_models import Project
from uuid import uuid4

router = APIRouter(tags=["Projects"])


class ProjectCreate(BaseModel):
    name: str
    description: str
    created_by: str

class ProjectOut(ProjectCreate):
    id: str
#get a DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ProjectUpdate(BaseModel):
    name: str
    description: Optional[str] = ""

@router.get("/")
def get_projects(db: Session = Depends(get_db)):
    return db.query(Project).all()



@router.post("/projects/", response_model=ProjectOut)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    project_id = str(uuid4())
    db_project = Project(id=project_id, **project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put("/projects/{project_id}", response_model=ProjectOut)
def update_project(project_id: str, updated: ProjectUpdate, db: Session = Depends(get_db)):
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        for key, value in updated.dict().items():
            setattr(project, key, value)
        project.name = updated.name
        project.description = updated.description
        db.commit()
        db.refresh(project)
        return project
    except Exception as e:
        db.rollback()
        print("Update failed:", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{project_id}")
def delete_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"message": "Deleted"}