from sqlalchemy import Column, String
from database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String)
    created_by = Column(String(100))
