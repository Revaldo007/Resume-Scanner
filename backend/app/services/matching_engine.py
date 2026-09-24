"""
Explainable resume <-> job matching.

Weights (must sum to 1.0):
    Skills (required)   : 50%
    Education           : 20%
    Experience           : 20%
    Preferred skills      : 10%

Every sub-score is a simple, inspectable percentage -- there is no
black-box model here, which is the point: a reviewer can recompute
any score by hand from the matched/missing lists returned alongside it.
"""
from typing import List, Dict, Any

WEIGHTS = {
    "skills": 0.50,
    "education": 0.20,
    "experience": 0.20,
    "preferred_skills": 0.10,
}


def _normalize(items: List[str]) -> List[str]:
    return [i.strip().lower() for i in items if i and i.strip()]


def score_skills(candidate_skills: List[str], required_skills: List[str]) -> Dict[str, Any]:
    candidate_skills = set(_normalize(candidate_skills))
    required_skills = _normalize(required_skills)

    if not required_skills:
        return {"score": 100.0, "matched": [], "missing": []}

    matched = [s for s in required_skills if s in candidate_skills]
    missing = [s for s in required_skills if s not in candidate_skills]
    score = (len(matched) / len(required_skills)) * 100
    return {"score": round(score, 2), "matched": matched, "missing": missing}


def score_preferred_skills(candidate_skills: List[str], preferred_skills: List[str]) -> Dict[str, Any]:
    candidate_skills = set(_normalize(candidate_skills))
    preferred_skills = _normalize(preferred_skills)

    if not preferred_skills:
        return {"score": 100.0, "matched": []}

    matched = [s for s in preferred_skills if s in candidate_skills]
    score = (len(matched) / len(preferred_skills)) * 100
    return {"score": round(score, 2), "matched": matched}


def score_education(candidate_education: List[str], minimum_education: str) -> float:
    """
    Simple containment check: does any of the candidate's detected
    education terms match (or exceed) the minimum required term?
    If no minimum is specified, education is considered fully satisfied.
    """
    if not minimum_education or not minimum_education.strip():
        return 100.0

    minimum = minimum_education.strip().lower()
    candidate_terms = set(_normalize(candidate_education))

    if minimum in candidate_terms:
        return 100.0

    # Partial credit if the candidate has ANY recognised qualification
    # but not the exact one requested (keeps the score explainable
    # rather than an all-or-nothing cliff).
    if candidate_terms:
        return 50.0

    return 0.0


def score_experience(candidate_years: float, minimum_years: float) -> float:
    if not minimum_years or minimum_years <= 0:
        return 100.0
    if candidate_years <= 0:
        return 0.0
    score = (candidate_years / minimum_years) * 100
    return round(min(score, 100.0), 2)


def calculate_overall_score(
    candidate_skills: List[str],
    candidate_education: List[str],
    candidate_experience_years: float,
    required_skills: List[str],
    preferred_skills: List[str],
    minimum_education: str,
    minimum_experience: float,
) -> Dict[str, Any]:
    skills_result = score_skills(candidate_skills, required_skills)
    preferred_result = score_preferred_skills(candidate_skills, preferred_skills)
    education_score = score_education(candidate_education, minimum_education)
    experience_score = score_experience(candidate_experience_years, minimum_experience)

    overall = (
        skills_result["score"] * WEIGHTS["skills"]
        + education_score * WEIGHTS["education"]
        + experience_score * WEIGHTS["experience"]
        + preferred_result["score"] * WEIGHTS["preferred_skills"]
    )
    overall = round(max(0.0, min(overall, 100.0)), 2)

    return {
        "skills_score": skills_result["score"],
        "matched_required_skills": skills_result["matched"],
        "missing_required_skills": skills_result["missing"],
        "preferred_skills_score": preferred_result["score"],
        "matched_preferred_skills": preferred_result["matched"],
        "education_score": education_score,
        "experience_score": experience_score,
        "overall_score": overall,
    }


def score_label(overall_score: float) -> str:
    """Human-readable label for the calculated score (NOT a hiring decision)."""
    if overall_score >= 90:
        return "Excellent match"
    if overall_score >= 75:
        return "Strong match"
    if overall_score >= 60:
        return "Moderate match"
    return "Low match"
