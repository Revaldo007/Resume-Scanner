import os
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.resume import Resume
from app.schemas.resume import ResumeOut, ResumeUploadResult
from app.services import resume_parser, nlp_processor
from app.utils.security import get_current_user

router = APIRouter(
    prefix="/api/resumes", tags=["Resumes"], dependencies=[Depends(get_current_user)]
)

MAX_UPLOAD_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


def _save_and_process_single(file_bytes: bytes, filename: str, db: Session) -> ResumeUploadResult:
    warning = None

    if len(file_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"'{filename}' exceeds the {settings.MAX_UPLOAD_SIZE_MB}MB upload limit.",
        )

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"'{filename}' is empty.",
        )

    try:
        text = resume_parser.extract_text(filename, file_bytes)
    except resume_parser.UnsupportedFileTypeError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except resume_parser.CorruptedFileError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    except resume_parser.EmptyResumeError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))

    # Check for a duplicate upload (same filename + same extracted text)
    existing = (
        db.query(Resume)
        .filter(Resume.file_name == filename, Resume.extracted_text == text)
        .first()
    )
    if existing:
        warning = f"A resume identical to '{filename}' was already uploaded on {existing.uploaded_at}."

    try:
        profile = nlp_processor.process_resume_text(text)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"NLP extraction failed for '{filename}': {exc}",
        )

    # Persist the raw file to disk (not served back out over the API)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = resume_parser.get_extension(filename)
    stored_name = f"{uuid.uuid4().hex}{ext}"
    with open(os.path.join(settings.UPLOAD_DIR, stored_name), "wb") as f:
        f.write(file_bytes)

    resume = Resume(
        file_name=filename,
        file_size_kb=round(len(file_bytes) / 1024, 2),
        extracted_text=text,
        candidate_name=profile["candidate_name"],
        email=profile["email"],
        phone=profile["phone"],
        skills=profile["skills"],
        education=profile["education"],
        experience_years=profile["experience_years"],
        previous_roles=profile["previous_roles"],
        companies=profile["companies"],
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return ResumeUploadResult(resume=ResumeOut.model_validate(resume), warning=warning)


@router.post("/upload", response_model=ResumeUploadResult, status_code=status.HTTP_201_CREATED)
async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_bytes = await file.read()
    return _save_and_process_single(file_bytes, file.filename, db)


@router.post("/upload-multiple", response_model=List[ResumeUploadResult], status_code=status.HTTP_201_CREATED)
async def upload_multiple_resumes(files: List[UploadFile] = File(...), db: Session = Depends(get_db)):
    if not files:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No files provided")

    results = []
    for file in files:
        file_bytes = await file.read()
        try:
            results.append(_save_and_process_single(file_bytes, file.filename, db))
        except HTTPException as exc:
            # Continue processing remaining files; report this one's failure inline
            results.append(
                ResumeUploadResult(
                    resume=None,  # type: ignore[arg-type]
                    warning=f"Failed to process '{file.filename}': {exc.detail}",
                )
            )
    return results


@router.get("", response_model=List[ResumeOut])
def list_resumes(db: Session = Depends(get_db)):
    return db.query(Resume).order_by(Resume.uploaded_at.desc()).all()


@router.get("/{resume_id}", response_model=ResumeOut)
def get_resume(resume_id: int, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume
