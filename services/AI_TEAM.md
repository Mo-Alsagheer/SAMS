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

### AI Module Responsibilities

The Python AI service must handle three distinct capabilities:

1. **Quiz Questions Generation** (`/quiz/generate`): Prompt the **Gemini free model** to generate dynamic questions assessing an unregistered user's fit for different committees.
2. **CV Evaluation and Filtering** (`/evaluate`): Scan and evaluate submitted resumes and application answers, outputting a recommendation and score.
3. **Mocking Interview Agent** (`/interview/agent`): Provide a conversational AI agent endpoint to conduct and score mock interviews.

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

### 1. Health

- `GET /health`
- Response:

```json
{ "ok": true, "service": "ats", "version": "0.1" }
```

### 2. Generate Quiz

- `POST /quiz/generate`
- **Description:** Generates a dynamic quiz using the Gemini free model to help unregistered users find a suitable committee.
- **Request:** Empty or basic user context.
- **Response:**

```json
{
  "questions": [
    {
      "id": "uuid",
      "prompt": "...",
      "type": "MCQ|TEXT",
      "options": ["A", "B", "C"]
    }
  ]
}
```

### 3. Evaluate Application (CV Filtering)

- `POST /evaluate`
- **Description:** Evaluates a submitted application (resume + quiz answers) and returns a score and recommendation.
- **Request:**

```json
{
  "applicationId": "uuid",
  "committeeId": "uuid",
  "userId": "uuid",
  "answers": [{ "questionId": "uuid", "prompt": "...", "answer": "..." }],
  "resumeText": "...",
  "metadata": { "language": "en" }
}
```

- **Response:**

```json
{
  "applicationId": "uuid",
  "score": 0.82,
  "recommendation": "FORWARD",
  "reasons": ["Strong motivation", "Relevant experience"],
  "extracted": { "skills": ["React", "Python"] },
  "modelVersion": "gemini-free-v1"
}
```

### 4. Mock Interview Agent

- `POST /interview/agent`
- **Description:** Acts as a mock interviewer. Takes user input/audio text and returns the next interview prompt or outcome.
- **Request:**

```json
{
  "applicationId": "uuid",
  "conversationHistory": [...],
  "userInput": "My previous experience includes..."
}
```

- **Response:**

```json
{
  "agentResponse": "That's interesting. Can you tell me about a time you faced a difficult bug?",
  "evaluationUpdate": "Candidate shows strong technical communication",
  "isComplete": false
}
```

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
