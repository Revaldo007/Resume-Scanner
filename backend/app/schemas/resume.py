from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class ResumeOut(BaseModel):
    id: int
    file_name: str
    file_size_kb: float
    candidate_name: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    skills: List[str] = []
    education: List[str] = []
    experience_years: float = 0
    previous_roles: List[str] = []
    companies: List[str] = []
    uploaded_at: datetime

    class Config:
        from_attributes = True


class ResumeUploadResult(BaseModel):
    """Returned right after upload+parsing for one file."""
    resume: Optional[ResumeOut] = None
    warning: Optional[str] = None
