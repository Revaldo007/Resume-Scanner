"""
Lightweight NLP + keyword-matching based information extraction.

Important (per project scope): this module uses spaCy for basic NLP
tasks (tokenization, sentence splitting, named-entity recognition for
candidate names) combined with regular expressions and curated keyword
lists for skills/education/experience. It is NOT a large-language-model
based "AI resume reader" -- the extraction is transparent and rule based,
which is exactly what an explainable screening tool needs.
"""
import importlib
import logging
import re
import subprocess
import sys
from functools import lru_cache
from typing import List, Dict, Any

import spacy

logger = logging.getLogger("resume_screening.nlp")

MODEL_NAME = "en_core_web_sm"

# --- Keyword banks -----------------------------------------------------

SKILL_KEYWORDS = [
    "python", "java", "c++", "c#", "javascript", "typescript", "react",
    "react.js", "angular", "vue", "node.js", "nodejs", "express",
    "fastapi", "django", "flask", "spring boot", "sql", "mysql",
    "postgresql", "postgres", "mongodb", "sqlite", "html", "css",
    "tailwind", "bootstrap", "git", "github", "docker", "kubernetes",
    "aws", "azure", "gcp", "linux", "rest api", "graphql", "redux",
    "pandas", "numpy", "scikit-learn", "machine learning", "deep learning",
    "tensorflow", "pytorch", "nlp", "data analysis", "power bi", "excel",
    "jira", "agile", "scrum", "ci/cd", "jenkins", "spacy",
]

EDUCATION_KEYWORDS = [
    "b.tech", "btech", "b.e", "bachelor of technology",
    "bachelor of engineering", "b.sc", "bsc", "bachelor of science",
    "bca", "bachelor of computer applications", "m.tech", "mtech",
    "master of technology", "mca", "master of computer applications",
    "mba", "master of business administration", "m.sc", "msc",
    "master of science", "computer science", "information technology",
    "phd", "ph.d", "doctorate", "diploma",
]

ROLE_KEYWORDS = [
    "software engineer", "software developer", "web developer",
    "full stack developer", "frontend developer", "backend developer",
    "data analyst", "data scientist", "data engineer", "intern",
    "software engineer intern", "project manager", "business analyst",
    "qa engineer", "test engineer", "devops engineer", "system administrator",
    "product manager", "ui/ux designer", "machine learning engineer",
]

EMAIL_REGEX = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")

# Finds phone-number-like runs (digits with spaces, dashes, brackets, "+").
# Each candidate is then validated in extract_phone(). Newlines and dots are
# deliberately NOT allowed inside a candidate so that "CGPA 8.52 2019-2023"
# or digits split across two lines are not glued into a fake number.
PHONE_CANDIDATE_REGEX = re.compile(r"(?<![\w.])\+?\(?\d[\d \t()-]{7,18}\d(?!\w)")
# A run made only of years, e.g. "2019 - 2023" or "2018 2019 2020"
YEAR_RANGE_REGEX = re.compile(r"(?:(?:19|20)\d{2}\D+)*(?:19|20)\d{2}")
# "BE" (Bachelor of Engineering) is matched case-sensitively and separately,
# because a lowercase "be" is just the English word.
BE_DEGREE_REGEX = re.compile(r"(?<![A-Za-z0-9])B\.?E\.?(?![A-Za-z0-9])")
EXPERIENCE_YEARS_REGEX = re.compile(
    r"(\d+(?:\.\d+)?)\s*\+?\s*(?:years|yrs|year)\b", re.IGNORECASE
)


def _try_load_model():
    try:
        return spacy.load(MODEL_NAME)
    except OSError:
        return None


def _download_model() -> bool:
    """Best-effort one-time download of the spaCy model (needs internet)."""
    logger.warning("spaCy model '%s' not found - trying to download it...", MODEL_NAME)
    try:
        subprocess.run(
            [sys.executable, "-m", "spacy", "download", MODEL_NAME],
            check=True,
            timeout=300,
        )
        importlib.invalidate_caches()
        return True
    except Exception as exc:  # network down, pip missing, timeout, ...
        logger.error("Could not download '%s': %s", MODEL_NAME, exc)
        return False


@lru_cache(maxsize=1)
def _get_nlp():
    """
    Load the spaCy pipeline once and cache it.

    1. Use the installed model if present.
    2. Otherwise try to download it automatically.
    3. If that also fails, fall back to a blank English pipeline so uploads
       still work. Skills, education, experience, email, phone and roles are
       all regex/keyword based and do not need the model; only spaCy's named
       entity recognition (name fallback + company detection) is lost.
    """
    nlp = _try_load_model()
    if nlp is None and _download_model():
        nlp = _try_load_model()
    if nlp is None:
        logger.error(
            "Running WITHOUT the spaCy model. Company detection is disabled. "
            "Fix: python -m spacy download %s",
            MODEL_NAME,
        )
        nlp = spacy.blank("en")
    return nlp


def warm_up() -> None:
    """Load the model at server start so the first upload is not slow."""
    _get_nlp()


def nlp_status() -> str:
    """'full' when the real model is loaded, 'fallback' for the blank pipeline."""
    return "full" if _get_nlp().has_pipe("ner") else "fallback"


def extract_email(text: str) -> str:
    match = EMAIL_REGEX.search(text)
    return match.group(0) if match else ""


def extract_phone(text: str) -> str:
    for match in PHONE_CANDIDATE_REGEX.finditer(text):
        candidate = match.group(0).strip()
        digits = re.sub(r"\D", "", candidate)
        if not 10 <= len(digits) <= 13:
            continue
        if YEAR_RANGE_REGEX.fullmatch(candidate):
            continue
        return candidate
    return ""


NAME_LINE_STOPWORDS = {
    "resume", "curriculum", "vitae", "cv", "profile", "summary", "objective",
    "contact", "email", "phone", "address", "skills", "education",
    "experience", "projects", "certifications",
}


def _looks_like_name_line(line: str) -> bool:
    """Heuristic: 2-4 capitalized words, no digits, no resume-section keywords."""
    words = line.split()
    if not (1 <= len(words) <= 4):
        return False
    if any(ch.isdigit() for ch in line):
        return False
    if EMAIL_REGEX.search(line):
        return False
    if any(w.lower().strip(":") in NAME_LINE_STOPWORDS for w in words):
        return False
    return all(w[0].isupper() for w in words if w[0].isalpha())


def extract_name(text: str) -> str:
    """
    Resume names almost always appear as a short, title-cased line at
    the very top of the document -- more reliably than a general NER
    model, which can misfire on skill lists or headings in a header.
    We check that heuristic first, then fall back to spaCy's PERSON
    entity recognition, then to the first non-empty line of any kind.
    """
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    for line in lines[:3]:
        if _looks_like_name_line(line):
            return line

    header = text[:300]
    nlp = _get_nlp()
    doc = nlp(header)
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            return ent.text.strip()

    for line in lines:
        if line and len(line.split()) <= 5 and not EMAIL_REGEX.search(line):
            return line
    return ""


def extract_skills(text: str) -> List[str]:
    lower_text = text.lower()
    found = set()
    for skill in SKILL_KEYWORDS:
        pattern = r"(?<![a-zA-Z0-9])" + re.escape(skill) + r"(?![a-zA-Z0-9])"
        if re.search(pattern, lower_text):
            found.add(skill)
    return sorted(found)


def extract_education(text: str) -> List[str]:
    lower_text = text.lower()
    found = set()
    for term in EDUCATION_KEYWORDS:
        pattern = r"(?<![a-zA-Z0-9])" + re.escape(term) + r"(?![a-zA-Z0-9])"
        if re.search(pattern, lower_text):
            found.add(term)
    if BE_DEGREE_REGEX.search(text):
        found.add("be")
    return sorted(found)


def extract_experience_years(text: str) -> float:
    matches = EXPERIENCE_YEARS_REGEX.findall(text)
    if not matches:
        return 0.0
    years = [float(m) for m in matches]
    return max(years)  # assume the largest mentioned figure is the total


def extract_roles(text: str) -> List[str]:
    lower_text = text.lower()
    found = set()
    for role in ROLE_KEYWORDS:
        # Word boundaries stop "intern" matching "internal"/"international";
        # the optional suffix still accepts "interns", "internship", etc.
        pattern = r"(?<![a-z0-9])" + re.escape(role) + r"(?:s|ship)?(?![a-z0-9])"
        if re.search(pattern, lower_text):
            found.add(role)
    return sorted(found)


def extract_companies(text: str) -> List[str]:
    """
    Best-effort company extraction using spaCy's ORG entity recognition.
    This is inherently noisy on resumes (headers/sections can be tagged
    as ORG), so we keep only short, title-cased results and cap the list.
    """
    nlp = _get_nlp()
    doc = nlp(text[:4000])  # cap for performance on long resumes
    companies = []
    seen = set()
    for ent in doc.ents:
        if ent.label_ == "ORG":
            name = ent.text.strip()
            if 2 <= len(name) <= 60 and name.lower() not in seen:
                seen.add(name.lower())
                companies.append(name)
    return companies[:10]


def process_resume_text(text: str) -> Dict[str, Any]:
    """Run the full extraction pipeline and return a structured profile."""
    return {
        "candidate_name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "skills": extract_skills(text),
        "education": extract_education(text),
        "experience_years": extract_experience_years(text),
        "previous_roles": extract_roles(text),
        "companies": extract_companies(text),
    }
