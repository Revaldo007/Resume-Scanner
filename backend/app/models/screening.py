from sqlalchemy import Column, Integer, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class ScreeningResult(Base):
    __tablename__ = "screening_results"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("job_requirements.id"), nullable=False)

    skills_score = Column(Float, default=0)
    education_score = Column(Float, default=0)
    experience_score = Column(Float, default=0)
    preferred_skills_score = Column(Float, default=0)
    overall_score = Column(Float, default=0)

    matched_required_skills = Column(JSON, default=list)
    missing_required_skills = Column(JSON, default=list)
    matched_preferred_skills = Column(JSON, default=list)

    analysed_at = Column(DateTime(timezone=True), server_default=func.now())

    resume = relationship("Resume", back_populates="screening_results")
    job = relationship("JobRequirement", back_populates="screening_results")
