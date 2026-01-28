# Frontend Team Guide (React)

## Goal
Build the user-facing web app for the Recruitment System with role-based views for:
- **User** (applicant)
- **Director** (committee director)
- **Executive Person** (admin/executive)

The backend (NestJS) is the source of truth. The frontend should be a thin client: validate for UX, but rely on backend validation for correctness.

---

## Primary Use-Cases to Implement
### User
- View Committees
- Take Committee Quiz
- Fill out an application
- Submit Application
- View Result

### Director
- Write a committee description
- View filtered applications
- Accept/Reject application (**Phase 1**)
- Schedule offline interview
- Accept/Reject user (**Phase 2**)

### Executive Person
- Create committee
- Start recruitment process
- Monitor the process
- Close recruitment process

---

## Pages / Routes (Suggested)
> You can adjust names, but keep the concepts.

### Public
- `/login` / `/register` (if required)
- `/committees` (list)
- `/committees/:id` (details + description)

### User (Applicant)
- `/applicant/apply/:committeeId` (application form)
- `/applicant/quiz/:committeeId` (committee quiz)
- `/applicant/applications` (history)
- `/applicant/applications/:id` (status + result)

### Director
- `/director/committees/:committeeId/edit` (committee description)
- `/director/applications?committeeId=...&status=...` (filtered list)
- `/director/applications/:applicationId` (review + phase 1 decision)
- `/director/interviews/:applicationId` (schedule & view interview)
- `/director/final/:applicationId` (phase 2 decision)

### Executive
- `/executive/committees/new` (create)
- `/executive/committees` (manage)
- `/executive/recruitment` (start/monitor/close)

---

## UI Deliverables
- Responsive layout (desktop-first is fine, but should not break on mobile).
- Role-based navigation (hide routes user can’t access).
- Clear status indicators for application progress.
- Form UX:
  - Draft saving (optional but very useful)
  - Field-level validation + server error display
  - Loading / empty / error states

---

## Data + State Management
- Use React Router for routing.
- Use a data-fetching library (recommended: **TanStack Query**) for caching, retries, and status.
- Keep auth/session state separate from query cache.

**Global state (minimal):**
- Current user (id, name, role)
- Auth token / session

---

## API Integration Expectations (High-Level)
Backend will expose REST endpoints; frontend should:
- Use a single `apiClient` (fetch/axios) with:
  - Base URL from env
  - Auth header injection
  - Consistent error normalization
- Align with backend DTOs exactly (no guessing types).

**Environment variables (suggested):**
- `VITE_API_BASE_URL=http://localhost:3000`

---

## Key Screens Details
### Committees List
- Cards/table with: name, status (open/closed), short description, action buttons.

### Committee Quiz
- Fetch questions from backend.
- Track progress, timer if required.
- Submit answers once; handle re-take rules via backend.

### Application Form
Fields depend on the project, but typically:
- Personal info (name, email, phone)
- Committee selection (pre-filled when applying)
- Uploaded attachments (CV/portfolio) OR pasted text
- Motivation answers

### Application Status & Result
Show:
- Status timeline: `DRAFT → SUBMITTED → AI_REVIEWED → PHASE1_(ACCEPTED|REJECTED) → INTERVIEW_SCHEDULED → PHASE2_(ACCEPTED|REJECTED)`
- If rejected: show reason (if allowed).
- If accepted: show next steps.

---

## Acceptance Criteria (Frontend)
- Each role can complete their listed use-cases through the UI.
- Proper loading/error/empty handling.
- Works against backend swagger/postman collection (once available).

---

## What You Need From Backend (Request Early)
- Auth flows + roles mapping.
- Endpoint list + DTO schemas.
- Enum/status values for applications and recruitment process.
- File upload mechanism (multipart vs presigned URLs).

---

## Suggested Folder Structure (Client)
```
client/
  src/
    app/ (routing + layout)
    features/
      committees/
      quiz/
      applications/
      director/
      executive/
    components/
    lib/ (api client, query client)
    styles/
```

---

## Team Sync Checklist
- Confirm application status lifecycle with backend.
- Confirm quiz format (MCQ, free-text, scoring).
- Confirm interview scheduling fields (date/time, location, notes).
