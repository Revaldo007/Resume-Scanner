from sqlalchemy import Column, Integer, String, Text, Float, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(255), nullable=False)
    file_size_kb = Column(Float, default=0)

    candidate_name = Column(String(200), default="")
    email = Column(String(200), default="")
    phone = Column(String(50), default="")

    extracted_text = Column(Text, default="")

    # Structured NLP output, stored as JSON
    skills = Column(JSON, default=list)              # ["python", "react", ...]
    education = Column(JSON, default=list)            # ["B.Tech", "MCA", ...]
    experience_years = Column(Float, default=0)
    previous_roles = Column(JSON, default=list)        # ["Software Engineer", ...]
    companies = Column(JSON, default=list)             # ["Infosys", ...]

    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    screening_results = relationship(
        "ScreeningResult", back_populates="resume", cascade="all, delete-orphan"
    )
