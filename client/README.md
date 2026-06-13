# SAMS (Student Activity Management System)

SAMS is a state-of-the-art Student Activity Management System designed to handle recruitment, tasks, evaluations, meetings, and materials for student-run organizations and committees. It provides a seamless interface for administrators, committee directors, executives, and prospective applicants.

---

## 🏗️ System Architecture & Stack

SAMS is structured as a multi-tier application comprising three main components:

1. **Frontend (`/client`)**
   - **Core**: React (Vite, React Router v6)
   - **State & API**: Axios with a centralized API interflow, standard custom hooks
   - **UI & Aesthetics**: Tailwind CSS, Shadcn UI components, Lucide icons, and modern transition systems
   - **Form Validation**: Zod schemas integrated with flexible popups and controllers

2. **Backend (`/server`)**
   - **Core**: NestJS (TypeScript framework)
   - **Database & ORM**: TypeORM interfacing with relational databases
   - **Security**: JWT passport strategies, role-based guard protections, custom Joi validations, and data sanitization layers
   - **Auditing**: Internal interceptors log every critical administrative action (Audit logs)

3. **AI Service (`/ai-service`)**
   - **Core**: Python backend providing intelligent CV screening, skill evaluation, and scoring for incoming student applications based on committee specifications.

---

## 🌟 Core Features

### 🔐 Authentication & Authorization
* Centralized authentication (Sign In, forgot/reset password flow via secure email tokens).
* Role-Based Access Control (RBAC) supporting four distinct roles:
  * **Executive**: Oversees committees, manages global/committee recruitment.
  * **Director**: Manages their specific committee, tracks roadmap/materials, reviews applications, grades submissions, and tracks attendance.
  * **Member**: Accesses roadmaps, views materials, submits tasks, and attends practice interviews.
  * **Public**: Explores active committees/executive vacancies and applies.

### 📢 Recruitment Management
* **Committee Recruitment**: Executives can open, configure, and close recruitment processes for specific committees (e.g., target member count, opening, and optional closing dates).
* **Global Executive Recruitment**: Dedicated configurations for executive roles (Web Master & Technical Director, Treasurer, Secretary, and Chairman) without standard committee requirements.
* **Applicant Submissions**: Public users can dynamically apply for open committee slots or executive roles, with values validated by frontend schemas.
* **Email Notifications**: Automatic notification dispatching when directors/executives transition an application status.

### 📚 Learning Management (LMS)
* **Roadmap & Materials**: Directors can design structural roadmaps and upload educational resources (integrated with Cloudinary file storage).
* **Task Management**: Directors can assign tasks with deadlines. Members submit tasks, which directors grade and comment on directly.

### 🤝 Meetings & Attendance
* **Video Conferencing**: Built-in PlugNmeet integration allows direct meeting generation and interactive session links.
* **Attendance Tracking**: Detailed session attendance marking and recording logs for committee members.

### 🧠 Compatibility Quiz
* Gamified compatibility quiz to help applicants discover their strengths and recommend corresponding committees.

---

## 📂 Project Directory Structure

### Client Structure (`/client/src`)
```
src/
├── assets/          # Static media (logos, whitepapers)
├── auth/            # Authentication pages (Login, Forgot/Reset Password)
├── components/      # Reusable UI controls (shared layout, custom dialogs)
├── constant/        # Application-wide system constants
├── data/            # Static configuration data
├── director/        # Director-specific dashboards and task monitors
├── executive/       # Executive management dashboards (Committees, Recruitment)
├── features/        # Centralized API fetchers mapped to NestJS routes
├── hooks/           # Custom React hooks (theme toggles, state hooks)
├── layout/          # Dashboard wrapper layouts
├── lib/             # Third-party utilities (shadcn helpers)
├── member/          # Member workspace (roadmaps, task submission, virtual rooms)
├── user/            # Public-facing views (landing page, application forms, quiz)
└── utils/           # Helper libraries and validators
```

### Server Structure (`/server/src`)
```
src/
├── common/          # Guards, pipes, decorators, and global filters
├── config/          # Configurations (App configuration, Swagger definition)
├── integrations/    # External clients (Cloudinary, AI Evaluation, PlugNmeet)
├── modules/         # Modular business logic units
│   ├── applications # Application submission, review, and sorting
│   ├── attendace    # Member attendance logging
│   ├── audit-log    # Interceptors capturing system mutations
│   ├── auth         # JWT generation and login flows
│   ├── committees   # Committee modeling and members registry
│   ├── director     # Director operations & applicant review controls
│   ├── email        # Nodemailer notifications service
│   ├── executive    # Executive dashboards and roles configuration
│   ├── materials    # LMS resource attachments
│   ├── meetings     # Virtual video session management
│   ├── quiz         # Student compatibility questionnaire
│   ├── recruitment  # Recruitment processes (dates, targets, states)
│   ├── roadmap      # Committee roadmaps metadata
│   ├── sessions     # Workshop session scheduling
│   ├── tasks        # Homework assignment and grading flow
│   └── users        # Core user profiles and account records
└── seed.ts          # Core system setup database seed script
```

---

## 🛠️ How to Run & Build

### Frontend
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Run development server
npm run dev

# Build production bundle
npm run build
```

### Backend
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Run NestJS in watch mode
npm run start:dev

# Run database seed
npm run seed

# Build production distribution
npm run build
```
