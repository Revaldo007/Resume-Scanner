from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.resume import Resume
from app.models.job import JobRequirement
from app.models.screening import ScreeningResult
from app.schemas.screening import ScreeningResultOut, ScreeningDetailOut, AnalyseMultipleRequest
from app.services import matching_engine
from app.utils.security import get_current_user

router = APIRouter(
    prefix="/api/screening", tags=["Screening"], dependencies=[Depends(get_current_user)]
)


def _run_and_store(resume: Resume, job: JobRequirement, db: Session) -> ScreeningResult:
    result = matching_engine.calculate_overall_score(
        candidate_skills=resume.skills or [],
        candidate_education=resume.education or [],
        candidate_experience_years=resume.experience_years or 0,
        required_skills=job.skills_list("required_skills"),
        preferred_skills=job.skills_list("preferred_skills"),
        minimum_education=job.minimum_education or "",
        minimum_experience=job.minimum_experience or 0,
    )

    screening = ScreeningResult(
        resume_id=resume.id,
        job_id=job.id,
        skills_score=result["skills_score"],
        education_score=result["education_score"],
        experience_score=result["experience_score"],
        preferred_skills_score=result["preferred_skills_score"],
        overall_score=result["overall_score"],
        matched_required_skills=result["matched_required_skills"],
        missing_required_skills=result["missing_required_skills"],
        matched_preferred_skills=result["matched_preferred_skills"],
    )
    db.add(screening)
    db.commit()
    db.refresh(screening)
    return screening


@router.post("/analyse/{resume_id}/{job_id}", response_model=ScreeningResultOut, status_code=status.HTTP_201_CREATED)
def analyse_single(resume_id: int, job_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    job = db.query(JobRequirement).filter(JobRequirement.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job requirement not found")

    return _run_and_store(resume, job, db)


@router.post("/analyse-multiple", response_model=List[ScreeningResultOut], status_code=status.HTTP_201_CREATED)
def analyse_multiple(payload: AnalyseMultipleRequest, db: Session = Depends(get_db)):
    job = db.query(JobRequirement).filter(JobRequirement.id == payload.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job requirement not found")

    if not payload.resume_ids:
        raise HTTPException(status_code=400, detail="No resume IDs provided")

    results = []
    for resume_id in payload.resume_ids:
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not resume:
            continue  # skip missing resumes rather than failing the whole batch
        results.append(_run_and_store(resume, job, db))

    if not results:
        raise HTTPException(status_code=404, detail="None of the given resume IDs were found")

    results.sort(key=lambda r: r.overall_score, reverse=True)
    return results


@router.get("/results", response_model=List[ScreeningResultOut])
def list_results(db: Session = Depends(get_db)):
    return (
        db.query(ScreeningResult)
        .order_by(ScreeningResult.analysed_at.desc())
        .all()
    )


@router.get("/results/{result_id}", response_model=ScreeningDetailOut)
def get_result(result_id: int, db: Session = Depends(get_db)):
    result = db.query(ScreeningResult).filter(ScreeningResult.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Screening result not found")
    return result
