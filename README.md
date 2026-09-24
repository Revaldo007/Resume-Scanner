# Web-Based Resume Analysis and Intelligent Candidate Screening System

A full-stack mini/academic project that lets registered users sign up, log in, upload
candidate resumes (PDF/DOCX), extract structured information using NLP and
keyword-matching techniques, compare candidates against a job requirement,
and view an explainable matching score.

## Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS, React Router, Axios
- **Backend:** Python, FastAPI, Uvicorn, Pydantic, SQLAlchemy
- **Database:** SQLite
- **Resume/NLP Processing:** PyMuPDF (PDF), python-docx (DOCX), spaCy /
  lightweight keyword-based NLP

## Project Structure

```
resume-screening-system/
├── backend/            # FastAPI app, SQLite DB, NLP + matching services
└── frontend/           # React + Vite + Tailwind UI
```

## Development Status

This project is being built phase by phase. See each phase's notes for
setup, run, and testing instructions. Current phase: **1 — Project
scaffolding & environments**.

## Quick Start

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt   # also installs the spaCy model en_core_web_sm
cp .env.example .env              # Windows: copy .env.example .env
uvicorn app.main:app --reload
```
The API runs on http://127.0.0.1:8000 (interactive docs at `/docs`).
`GET /api/health` reports `"nlp": "full"` when the spaCy model is loaded.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

## Accounts

- **Register:** open `/register` (or click *Register* on the login page), choose a
  username (3-50 letters/numbers/`._-`) and a password (8-72 characters). You are
  signed in automatically.
- **Default account:** on first start the backend also creates the user from
  `AUTH_USERNAME` / `AUTH_PASSWORD` in `.env` (`admin` / `admin123` by default).

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `ERR_CONNECTION_REFUSED` on `/api/auth/login` | The backend is not running. Start it with `uvicorn app.main:app --reload` inside `backend/`. |
| `[E050] Can't find model 'en_core_web_sm'` | The spaCy model is missing. Run `pip install -r requirements.txt` again (or `python -m spacy download en_core_web_sm`). The backend also tries to download it on startup, and still works without it (only company detection is disabled). |
| `401 Unauthorized` on login | Wrong username/password. Register a new account or use the default one from `.env`. |
| Browser shows a CORS error | Run the frontend on port 5173, the only origin the backend allows (see `app/main.py`). |
