from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class JobBase(BaseModel):
    job_title: str = Field(..., min_length=1, max_length=200)
    job_description: Optional[str] = ""
    required_skills: Optional[str] = ""   # comma-separated, e.g. "python,react,sql"
    preferred_skills: Optional[str] = ""
    minimum_education: Optional[str] = ""
    minimum_experience: Optional[float] = 0


class JobCreate(JobBase):
    pass


class JobUpdate(JobBase):
    job_title: Optional[str] = Field(None, min_length=1, max_length=200)


class JobOut(JobBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
