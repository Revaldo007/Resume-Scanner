import logging

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.utils.security import hash_password

from app.routers import auth, jobs, resumes, screening, dashboard
from app.services import nlp_processor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("resume_screening")

app = FastAPI(
    title="Resume Analysis & Intelligent Candidate Screening System",
    description="Mini project: NLP-based resume parsing and explainable job-matching scores.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == settings.AUTH_USERNAME).first()
        if not existing:
            user = User(
                username=settings.AUTH_USERNAME,
                password_hash=hash_password(settings.AUTH_PASSWORD),
            )
            db.add(user)
            db.commit()
            logger.info("Seeded the default user '%s'.", settings.AUTH_USERNAME)
    finally:
        db.close()

    # Load the spaCy model now (downloads it if missing) so the first resume
    # upload isn't slow. This never blocks startup from succeeding.
    try:
        nlp_processor.warm_up()
        logger.info("NLP pipeline ready (mode: %s).", nlp_processor.nlp_status())
    except Exception as exc:
        logger.error("NLP warm-up failed: %s", exc)


# --- Centralised error handling -----------------------------------------

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first = errors[0] if errors else {}
    field = ".".join(str(part) for part in first.get("loc", []) if part not in ("body", "query", "path"))
    message = str(first.get("msg", "Invalid request data")).removeprefix("Value error, ")
    detail = f"{field}: {message}" if field else message

    # Only return loc/msg/type. Pydantic's raw errors also echo the submitted
    # input (e.g. the password) and may hold objects that are not JSON-safe.
    safe_errors = [
        {"loc": [str(p) for p in e.get("loc", [])], "msg": e.get("msg", ""), "type": e.get("type", "")}
        for e in errors
    ]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": detail, "errors": safe_errors},
    )


@app.exception_handler(SQLAlchemyError)
async def db_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error("Database error: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "A database error occurred. Please try again."},
    )


@app.get("/")
def root():
    return {"message": "Resume Analysis & Candidate Screening API is running."}


@app.get("/api/health")
def health_check():
    return {"status": "ok", "nlp": nlp_processor.nlp_status()}


app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(resumes.router)
app.include_router(screening.router)
app.include_router(dashboard.router)
