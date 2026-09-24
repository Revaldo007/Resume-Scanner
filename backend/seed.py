"""
Seed script: creates 10 default Job Requirements.

Usage:
    cd backend
    python seed.py

Safe to re-run: existing job titles are skipped (not duplicated).
"""
from app.database import SessionLocal, engine, Base
from app.models.job import JobRequirement
from app.models import user, resume, screening  # noqa: F401  (register all models)

JOBS = [
    dict(
        job_title="Python Developer",
        job_description="Develop Python-based applications, APIs, and database-driven backend systems.",
        required_skills="python, django, fast api, postgresql, git",
        preferred_skills="docker, aws, redis",
        minimum_education="b.tech",
        minimum_experience=0,
    ),
    dict(
        job_title="Java Developer",
        job_description="Develop scalable backend applications and APIs using Java and Spring Boot.",
        required_skills="java, spring boot, sql, rest api, git",
        preferred_skills="docker, aws, microservices",
        minimum_education="b.tech",
        minimum_experience=1,
    ),
    dict(
        job_title="Full Stack Developer",
        job_description="Design and develop complete web applications across frontend, backend, and database layers.",
        required_skills="react.js, python, fastapi, postgresql, rest api",
        preferred_skills="docker, aws, github actions",
        minimum_education="b.tech",
        minimum_experience=2,
    ),
    dict(
        job_title="Frontend Developer",
        job_description="Build responsive and interactive web interfaces using modern frontend technologies.",
        required_skills="react.js, javascript, html, css, git",
        preferred_skills="typescript, tailwind, redux",
        minimum_education="b.tech",
        minimum_experience=1,
    ),
    dict(
        job_title="Backend Developer",
        job_description="Develop and maintain REST APIs and backend services for web applications.",
        required_skills="python, fastapi, postgresql, rest api, git",
        preferred_skills="docker, aws, redis",
        minimum_education="b.tech",
        minimum_experience=0,
    ),
    dict(
        job_title="Data Analyst",
        job_description="Analyze business data and build reports/dashboards to support decision making.",
        required_skills="python, sql, excel, power bi, data analysis",
        preferred_skills="pandas, numpy, tableau",
        minimum_education="b.tech",
        minimum_experience=0,
    ),
    dict(
        job_title="Data Scientist",
        job_description="Build and evaluate machine learning models to solve business problems.",
        required_skills="python, machine learning, pandas, numpy, sql",
        preferred_skills="tensorflow, pytorch, scikit-learn",
        minimum_education="mca",
        minimum_experience=1,
    ),
    dict(
        job_title="DevOps Engineer",
        job_description="Manage CI/CD pipelines, cloud infrastructure, and container orchestration.",
        required_skills="docker, kubernetes, aws, linux, ci/cd",
        preferred_skills="jenkins, azure, terraform",
        minimum_education="b.tech",
        minimum_experience=2,
    ),
    dict(
        job_title="QA Engineer",
        job_description="Design and execute test plans to ensure software quality across releases.",
        required_skills="sql, git, agile, jira, rest api",
        preferred_skills="python, ci/cd, scrum",
        minimum_education="b.tech",
        minimum_experience=0,
    ),
    dict(
        job_title="UI/UX Designer",
        job_description="Design intuitive user interfaces and experiences for web and mobile products.",
        required_skills="html, css, git",
        preferred_skills="react, tailwind, bootstrap",
        minimum_education="b.tech",
        minimum_experience=0,
    ),
]


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing_titles = {
            title for (title,) in db.query(JobRequirement.job_title).all()
        }
        created = 0
        for job in JOBS:
            if job["job_title"] in existing_titles:
                print(f"skip (already exists): {job['job_title']}")
                continue
            db.add(JobRequirement(**job))
            created += 1
            print(f"created: {job['job_title']}")
        db.commit()
        print(f"\nDone. {created} job requirement(s) created, "
              f"{len(JOBS) - created} skipped.")
    finally:
        db.close()


if __name__ == "__main__":
    run()