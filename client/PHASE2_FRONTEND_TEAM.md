# Phase 2: Frontend Team Guide (React)

## Goal
Build the Phase 2 LMS interface for the SAMS project. You will construct the user interfaces for the learning journey, online video sessions, file sharing, task submission, and scoring system.

The application relies on our self-hosted **plugNmeet** server for video conferencing and Cloudinary for file hosting.

---

## Primary Use-Cases to Implement

### Member (User / Applicant)
- **View Roadmap**: See a timeline or outline of the committee's sessions.
- **Session Details**: View scheduled date/time, description, and attached resources.
- **Join Meeting**: Connect to the live plugNmeet video session.
- **Submit Tasks**: View assigned tasks and upload files/text as a submission.
- **View Score**: Check accumulated score (Attendance + Graded Tasks).

### Director
- **Manage Roadmap**: Create and arrange sessions within their committee.
- **Manage Resources**: Upload materials (files, documents) to sessions via Cloudinary.
- **Host Meetings**: Start/Join plugNmeet sessions as an Admin/Moderator.
- **Assign Tasks**: Create tasks for a session with instructions and due dates.
- **Grade Submissions**: Review member task submissions and assign a score (0 to 5 points).
- **Mark Attendance**: Manually check off which members attended the session.

---

## Key Screens Details

### 1. Roadmap & Session View
- **Timeline UI**: Display sessions in chronological order.
- **Details Section**: Clicking a session expands/opens details:
  - Material downloads list.
  - Assigned tasks.
  - "Join Meeting" button (disabled if meeting is not active or hasn't started).
  - Meeting recordings (if available after the meeting).

### 2. File Uploads (Cloudinary)
- Use a file picker for Directors uploading materials and Members submitting tasks.
- If handling uploads on the frontend, use the Cloudinary upload widget or REST API. Ensure you coordinate with the backend team on how URLs or signatures are securely passed.

### 3. plugNmeet Meeting Join
- We will integrate plugNmeet by redirecting users to the client URL.
- The "Join Meeting" button should call the backend (e.g., `GET /sessions/:id/meeting/join`).
- The backend will return a plugNmeet `access_token` and the `serverUrl`.
- Use `window.location.href = 'https://[your-plugnmeet-server]/?access_token=' + token` or open a new tab to redirect the user directly to the plugNmeet room.

### 4. Task Management & Grading (Director)
- **Task List View**: Shows all tasks for the session.
- **Submissions View**: A table or list of all members who submitted a task.
  - Displays the submitted file link (Cloudinary).
  - Provides a 0-5 input/slider to set the grade.
  - "Save Grade" button to persist to the backend.

### 5. Attendance & Scoring System
- **Attendance Form (Director)**: A checklist of all committee members. The director checks the box next to users who attended and submits the list.
- **Scoreboard (Member)**: A prominent display showing:
  - `Total Points`: The accumulated score.
  - Breakdown: Points from attendance (5pts per session) + Points from tasks (max 5pts per task).

---

## API Integration Expectations

Coordinate with the Backend team to consume these endpoints:
- **Roadmaps/Sessions**: GET, POST, PATCH
- **Tasks**: POST task, POST submission
- **Grading**: PATCH submission score
- **Attendance**: GET members list, PATCH attendance array
- **Meeting**: GET the join URL/token
- **Score**: GET current user score

> **Important**: The backend generates the secure plugNmeet access tokens. Do not attempt to generate tokens on the frontend, as this would expose your API Secret.

---

## Suggested Additions to Routing

### Member
- `/committee/:id/roadmap` - View the learning journey.
- `/session/:id` - Session details, tasks, and join button.

### Director
- `/director/committee/:id/roadmap/edit` - Manage sessions.
- `/director/session/:id/manage` - Edit session details, upload resources.
- `/director/session/:id/attendance` - Manually mark attendance.
- `/director/task/:id/submissions` - View and grade task submissions.

---

## UI Deliverables
- **Premium Design**: Ensure the learning journey (Roadmap) feels dynamic and modern. Use step-indicators or timelines to represent progress.
- **Status Indicators**: Clearly show if a task is "Pending", "Submitted", or "Graded".
- **Responsive Tables**: The director's grading and attendance screens should be easy to use, even if the roster is large.
