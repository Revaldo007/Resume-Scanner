from pydantic import BaseModel
from datetime import datetime
from typing import List

from app.schemas.resume import ResumeOut
from app.schemas.job import JobOut


class ScreeningResultOut(BaseModel):
    id: int
    resume_id: int
    job_id: int
    skills_score: float
    education_score: float
    experience_score: float
    preferred_skills_score: float
    overall_score: float
    matched_required_skills: List[str] = []
    missing_required_skills: List[str] = []
    matched_preferred_skills: List[str] = []
    analysed_at: datetime

    class Config:
        from_attributes = True


class ScreeningDetailOut(ScreeningResultOut):
    """Includes full resume + job data for the detailed analysis page."""
    resume: ResumeOut
    job: JobOut

    class Config:
        from_attributes = True


class AnalyseMultipleRequest(BaseModel):
    resume_ids: List[int]
    job_id: int
