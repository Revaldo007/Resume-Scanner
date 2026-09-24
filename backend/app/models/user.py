from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    """
    The system has exactly one authorized user (no roles). This table
    exists mainly so the login flow is 'real' (hashed password + DB
    lookup) rather than a hardcoded check in the route.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
