from sqlalchemy import Column, String
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(100))
