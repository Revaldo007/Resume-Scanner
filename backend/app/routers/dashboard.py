from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.resume import Resume
from app.models.job import JobRequirement
from app.models.screening import ScreeningResult
from app.schemas.screening import ScreeningResultOut
from app.utils.security import get_current_user
from typing import List

router = APIRouter(
    prefix="/api/dashboard", tags=["Dashboard"], dependencies=[Depends(get_current_user)]
)


@router.get("/statistics")
def get_statistics(db: Session = Depends(get_db)):
    total_resumes = db.query(func.count(Resume.id)).scalar() or 0
    total_jobs = db.query(func.count(JobRequirement.id)).scalar() or 0
    avg_score = db.query(func.avg(ScreeningResult.overall_score)).scalar() or 0

    recent_results = (
        db.query(ScreeningResult)
        .order_by(ScreeningResult.analysed_at.desc())
        .limit(5)
        .all()
    )

    return {
        "total_resumes_analysed": total_resumes,
        "total_job_requirements": total_jobs,
        "average_matching_score": round(float(avg_score), 2),
        "recent_screening_results": [
            ScreeningResultOut.model_validate(r) for r in recent_results
        ],
    }
