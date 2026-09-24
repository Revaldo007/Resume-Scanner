from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class JobRequirement(Base):
    __tablename__ = "job_requirements"

    id = Column(Integer, primary_key=True, index=True)
    job_title = Column(String(200), nullable=False)
    job_description = Column(Text, default="")

    # Stored as comma-separated strings for simplicity (e.g. "python,react,sql")
    required_skills = Column(Text, default="")
    preferred_skills = Column(Text, default="")

    minimum_education = Column(String(100), default="")
    # Minimum years of experience required
    minimum_experience = Column(Float, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    screening_results = relationship(
        "ScreeningResult", back_populates="job", cascade="all, delete-orphan"
    )

    def skills_list(self, field: str) -> list[str]:
        raw = getattr(self, field) or ""
        return [s.strip().lower() for s in raw.split(",") if s.strip()]
