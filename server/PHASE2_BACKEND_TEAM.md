# Phase 2: Backend Team Guide (NestJS)

## Goal
Implement Phase 2 of the SAMS project, transforming the platform into a comprehensive Learning Management System (LMS) with online video sessions, a dynamic scoring system, and task tracking. 

The backend will act as the source of truth for:
- Course roadmaps & sessions linked to committees
- BigBlueButton (BBB) meeting integration
- Materials and task management (Cloudinary integration for files)
- Member scoring & manual attendance tracking

---

## Domain Model Additions

### Core Entities (Suggested)
- **Roadmap / Course**: `id`, `committeeId` (Foreign Key), `title`, `description`, `createdAt`
- **Session / Meeting**: `id`, `roadmapId` (Foreign Key), `title`, `description`, `scheduledAt`, `bbbMeetingId`, `isRecorded`
- **Material / Resource**: `id`, `sessionId` (Foreign Key), `title`, `fileUrl` (Cloudinary URL), `uploadedBy`
- **Task**: `id`, `sessionId` (Foreign Key), `title`, `description`, `dueDate`
- **TaskSubmission**: `id`, `taskId` (Foreign Key), `userId` (Member), `content` (Optional text), `fileUrl` (Cloudinary URL), `score` (0-5, default null), `submittedAt`
- **Attendance**: `id`, `sessionId` (Foreign Key), `userId` (Member), `attended` (Boolean, default false)
- **Score (View / Computed)**: Calculated sum of `(Attendance * 5) + TaskScores`.

---

## API Endpoints (Suggested Contract)

### Roadmap & Sessions (Director)
- `POST /director/committees/:committeeId/roadmap` - Create a roadmap for the committee
- `GET /committees/:committeeId/roadmap` - View the roadmap (User & Director)
- `POST /director/roadmap/:roadmapId/sessions` - Create a session (with scheduled date)
- `PATCH /director/sessions/:sessionId` - Update session info
- `DELETE /director/sessions/:sessionId` - Delete a session

### Materials & Files (Director & User)
> **Note**: Files must be uploaded to Cloudinary. You can either implement a backend proxy for upload or generate presigned URLs/signatures for the frontend to upload directly.
- `POST /director/sessions/:sessionId/materials` - Upload or attach a material to a session
- `DELETE /director/materials/:materialId` - Remove material
- `GET /sessions/:sessionId/materials` - View materials (User & Director)

### Tasks & Submissions
- `POST /director/sessions/:sessionId/tasks` - Create a task
- `GET /sessions/:sessionId/tasks` - View tasks
- `POST /tasks/:taskId/submissions` - Submit a task (User)
- `GET /director/tasks/:taskId/submissions` - View all submissions for a task
- `PATCH /director/submissions/:submissionId/score` - Grade a submission (Set score 0-5)

### Attendance & Scoring
- `GET /director/sessions/:sessionId/attendance` - Get list of users in the committee to mark attendance
- `PATCH /director/sessions/:sessionId/attendance` - Manually mark attendance (Array of userIds)
- `GET /users/me/score` - Get total score (Attendance points + Task points)
- `GET /committees/:committeeId/scoreboard` - (Optional) Director can view scores for all members

### BigBlueButton (BBB) Integration
> We are deploying our own BBB server. Use the base URL and Secret for the integration. You can use the `bigbluebutton-js` library or make direct HTTP calls with SHA-1 checksums.

- `POST /director/sessions/:sessionId/meeting/create`
  - Calls BBB `create` API to initialize the meeting.
  - Set `record=true`.
- `GET /sessions/:sessionId/meeting/join`
  - Generates the BBB `join` URL.
  - If role = `DIRECTOR`, generate Moderator join URL.
  - If role = `USER`, generate Attendee join URL.
  - Return the URL so the frontend can redirect the user.
- `GET /sessions/:sessionId/meeting/recordings`
  - Calls BBB `getRecordings` API using the `bbbMeetingId` to fetch the playback URL.

---

## BigBlueButton Details

### Expected Environment Variables
- `BBB_URL=https://your-bbb-server.com/bigbluebutton/api`
- `BBB_SECRET=your-bbb-shared-secret`
- `CLOUDINARY_URL=cloudinary://...` (for file uploads)

### Meeting Flow
1. Director schedules a Session in SAMS.
2. At meeting time, Director clicks "Start Meeting" on the frontend -> calls `POST /create` then `GET /join`.
3. Member clicks "Join Meeting" -> calls `GET /join`.
4. SAMS Backend generates the secure hash using the `BBB_SECRET` and returns the URL. The frontend handles the redirect.
5. After the meeting, SAMS can fetch recordings if requested.

---

## Acceptance Criteria (Backend)
- All CRUD operations for Roadmaps, Sessions, Tasks, and Materials are functional.
- Cloudinary is fully integrated for uploading resources and task submission files.
- BBB integration correctly generates join URLs with proper roles (Moderator vs Attendee).
- The scoring logic correctly computes: 5 points for every attended session + Sum of all task scores (0-5 per task).
- Manual attendance API properly flags members as `attended=true`.
