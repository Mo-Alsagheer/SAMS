# Backend Team Guide (NestJS)

## Goal
Implement the Recruitment System backend in **NestJS** with:
- Role-based access control (User / Director / Executive)
- Recruitment process lifecycle
- Applications + quiz handling
- Integration with the AI service (Python) to scan/evaluate applications

Current backend lives under `server/`.

---

## Domain Model (Minimum)
### Roles
- `USER` (Applicant)
- `DIRECTOR`
- `EXECUTIVE`
- (optional) `ATS_AGENT` as a system role/service account

### Core Entities (Suggested)
- **User**: id, name, email, role, createdAt
- **Committee**: id, name, description, createdBy (executive), directorId, isOpen
- **RecruitmentProcess**: id, committeeId, status (`OPEN|CLOSED`), openedAt, closedAt
- **Quiz**: id, committeeId
- **QuizQuestion**: id, quizId, type (`MCQ|TEXT`), prompt, choices[]
- **Application**: id, userId, committeeId, status, submittedAt
- **ApplicationAnswer**: id, applicationId, questionId, answer
- **Interview**: id, applicationId, scheduledAt, location, notes
- **AIReview**: id, applicationId, score, recommendation, reasons[], modelVersion, createdAt

### Application Status Lifecycle (Proposed)
Keep this explicit and stable for frontend:
- `DRAFT`
- `SUBMITTED`
- `AI_REVIEWED`
- `PHASE1_ACCEPTED` / `PHASE1_REJECTED`
- `INTERVIEW_SCHEDULED`
- `PHASE2_ACCEPTED` / `PHASE2_REJECTED`

---

## Modules (Suggested Nest Structure)
- `auth` (JWT/session, guards)
- `users`
- `committees`
- `recruitment` (open/close process)
- `quiz` (questions, submit answers)
- `applications` (create/submit/status)
- `director` (phase1 decisions, interview scheduling, phase2 decisions)
- `ai` (client to Python service + persistence of AIReview)

---

## API Endpoints (Suggested Contract)
> Adjust paths, but keep capability coverage.

### Auth
- `POST /auth/login`
- `GET /auth/me`

### Committees (User)
- `GET /committees` (filter by open)
- `GET /committees/:id`

### Committees (Executive)
- `POST /executive/committees`
- `PATCH /executive/committees/:id`

### Recruitment Process (Executive)
- `POST /executive/recruitment/:committeeId/open`
- `POST /executive/recruitment/:committeeId/close`
- `GET /executive/recruitment` (monitor)

### Quiz (User)
- `GET /committees/:committeeId/quiz`
- `POST /committees/:committeeId/quiz/submissions`

### Applications (User)
- `POST /applications` (create draft)
- `PATCH /applications/:id` (update draft)
- `POST /applications/:id/submit`
- `GET /applications/me`
- `GET /applications/:id`

### Director
- `PATCH /director/committees/:committeeId/description`
- `GET /director/applications?committeeId=...&status=...`
- `POST /director/applications/:id/phase1/accept`
- `POST /director/applications/:id/phase1/reject`
- `POST /director/applications/:id/interview/schedule`
- `POST /director/applications/:id/phase2/accept`
- `POST /director/applications/:id/phase2/reject`

### AI Integration (Internal / System)
- `POST /ai/applications/:id/evaluate` (trigger scan/eval; usually called on submit)

---

## AI Service Integration (Nest ↔ Python)
### Recommended Approach
- Python runs as a separate HTTP service (FastAPI recommended).
- Nest calls it synchronously on submission OR asynchronously via a job queue.

**Start simple:** synchronous HTTP call with timeouts + retries.

### Contract (Proposal)
**Request to AI**
- `POST {AI_BASE_URL}/evaluate`
- Payload:
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

**Response from AI**
```json
{
  "applicationId": "uuid",
  "score": 0.82,
  "recommendation": "FORWARD" ,
  "reasons": ["Strong motivation", "Relevant experience"],
  "extracted": {"skills": ["..."]},
  "modelVersion": "v0.1"
}
```

### Backend Responsibilities
- Persist AI response into `AIReview`.
- Update `Application.status` to `AI_REVIEWED` (or keep `SUBMITTED` + add AIReview; but frontend needs a stable rule).
- Never trust AI output blindly for final acceptance—Director decisions remain authoritative.

### Reliability
- Add timeouts (e.g. 5–15s) and retries with backoff.
- If AI fails, keep application submitted and mark `aiStatus=FAILED` for retry.

---

## Storage & ORM
Decide early:
- PostgreSQL (recommended) + Prisma or TypeORM

Minimum requirements:
- Migrations
- Seed data for committees + quiz

---

## Security / Access Control
- Guards for role access:
  - User: only their own applications
  - Director: only their committee’s applications
  - Executive: system-wide
- Input validation via DTOs (`class-validator`).

---

## Dev Setup (Backend)
From `server/`:
- `npm install`
- `npm run start:dev`

Environment variables (suggested):
- `PORT=3000`
- `DATABASE_URL=...`
- `AI_BASE_URL=http://localhost:8000`
- `JWT_SECRET=...`

---

## Acceptance Criteria (Backend)
- All use-cases supported via stable REST API.
- Role restrictions enforced.
- AI evaluation is integrated and persisted.
- Errors are consistent (status codes + message format).
