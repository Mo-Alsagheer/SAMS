# AI Team Guide (Python Service)

## Goal
Build an AI/ATS component that:
- **Scans** an application
- **Evaluates** it
- **Forwards** a recommendation to the backend (NestJS)

This service should be deployable independently and communicate with Nest via HTTP.

Current placeholder exists at `services/main.py` (empty).

---

## Scope (MVP → Iterations)
### MVP (Week 1–2)
- Implement a simple scoring pipeline (rules + heuristics) using:
  - Keyword matching / skill overlap
  - Minimum required fields checks
  - Simple rubric for quiz answers
- Return a normalized response (score + reasons).

### Iteration 2
- Add better NLP extraction (skills, education, experience) using open-source models.

### Iteration 3 (Optional)
- Integrate an LLM-based evaluator (if allowed by project constraints) with strict prompting and safe output schema.

---

## Service Framework (Recommended)
Use **FastAPI** for an HTTP API.

Suggested structure:
```
services/
  app/
    main.py
    schemas.py
    scorer/
      rules.py
      features.py
    utils/
      text.py
  requirements.txt
```

---

## API Contract (Must-Have)
### Health
- `GET /health`
- Response:
```json
{ "ok": true, "service": "ats", "version": "0.1" }
```

### Evaluate Application
- `POST /evaluate`

**Request** (proposed; align with backend once DTOs are finalized):
```json
{
  "applicationId": "uuid",
  "committeeId": "uuid",
  "userId": "uuid",
  "answers": [
    {"questionId": "uuid", "prompt": "...", "answer": "..."}
  ],
  "resumeText": "...",
  "metadata": {"language": "en"}
}
```

**Response**
```json
{
  "applicationId": "uuid",
  "score": 0.0,
  "recommendation": "REJECT" ,
  "reasons": ["..."],
  "extracted": {"skills": ["..."]},
  "modelVersion": "v0.1"
}
```

**Recommendation enum**
- `FORWARD` (send to director)
- `REJECT` (do not forward)
- (optional) `REVIEW` (needs manual review)

---

## Evaluation Logic Guidelines
- Output must be deterministic and schema-valid.
- Always provide **human-readable reasons**.
- Avoid sensitive inferences (no guessing gender/health/politics).
- Keep score in `[0, 1]` or `[0, 100]` but be consistent.

### Suggested Feature Set (MVP)
- Completeness score (required fields present)
- Quiz score (per-question rubric)
- Resume skill match score (committee skills list)
- Penalties for empty/very short answers

### Committee-Specific Requirements
- Backend should provide committee config (skills/rubric). If not available yet, mock as static config by `committeeId` for MVP.

---

## Integration Notes (With NestJS)
- NestJS will call `POST /evaluate` on application submission.
- The AI service must:
  - respond within a reasonable time (target < 3–5 seconds for MVP)
  - include `modelVersion`
  - never crash on missing fields (return 400 with details)

**Operational requirements:**
- Add request logging (no PII in logs if possible)
- Add timeouts to any external model calls

---

## Local Dev Commands (Suggested)
- Create `requirements.txt` including: `fastapi`, `uvicorn`, and any NLP libs.
- Run:
  - `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`

Environment variables (suggested):
- `PORT=8000`
- `LOG_LEVEL=info`

---

## Acceptance Criteria (AI)
- `GET /health` returns OK.
- `POST /evaluate` returns valid JSON response with score + recommendation + reasons.
- Handles bad inputs with 4xx errors and clear messages.
- Works end-to-end when called from Nest backend.
