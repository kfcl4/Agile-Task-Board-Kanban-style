from sqlalchemy import Column, String, Text, Enum, ForeignKey
from database import Base
import enum

class StatusEnum(str, enum.Enum):
    todo = "To do"
    in_progress = "In Progress"
    done = "Done"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, index=True)
    title = Column(String(255))
    description = Column(Text)
    status = Column(Enum(StatusEnum))
    assignee_id = Column(String(100))
    project_id = Column(String(36), ForeignKey("projects.id"))
