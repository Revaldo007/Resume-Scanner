from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.job import JobRequirement
from app.models.user import User
from app.schemas.job import JobCreate, JobUpdate, JobOut
from app.utils.security import get_current_user

router = APIRouter(
    prefix="/api/jobs", tags=["Job Requirements"], dependencies=[Depends(get_current_user)]
)


@router.post("", response_model=JobOut, status_code=status.HTTP_201_CREATED)
def create_job(payload: JobCreate, db: Session = Depends(get_db)):
    job = JobRequirement(**payload.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.get("", response_model=List[JobOut])
def list_jobs(db: Session = Depends(get_db)):
    return db.query(JobRequirement).order_by(JobRequirement.created_at.desc()).all()


@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(JobRequirement).filter(JobRequirement.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job requirement not found")
    return job


@router.put("/{job_id}", response_model=JobOut)
def update_job(job_id: int, payload: JobUpdate, db: Session = Depends(get_db)):
    job = db.query(JobRequirement).filter(JobRequirement.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job requirement not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)
    return job


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(JobRequirement).filter(JobRequirement.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job requirement not found")
    db.delete(job)
    db.commit()
    return None
