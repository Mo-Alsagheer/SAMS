# SAMS Backend Service

A progressive, modular, and domain-driven NestJS (TypeScript) API service powering the SAMS (Student Activity Management System) platform. It manages user roles, recruitment pipelines, interactive assessments, task/LMS workflows, video conferencing sessions, and detailed audit trails.

---

## 🏗️ Architecture & Core Components

This backend is built on a Domain-Driven Design (DDD) pattern in NestJS:

* **Modules**: Self-contained packages grouping controller, service, entity, and DTO layers together.
* **TypeORM Database Layer**: Handles relational mappings, transactions, and seeding logic.
* **Security & Guards**: Built-in passport-jwt mechanisms and custom RBAC guards.
* **Interceptors & Filters**: Global exception filtering and audit logging interceptors for tracing system mutations.
* **Joi Validation Layer**: Granular request inputs validation (separate body, parameters, query schemas).

---

## ⚙️ Core Modules & Business Domains

### 1. `auth` & `users`
* **JWT Authentication**: Secure login, profile retrieval, and status changes.
* **Password Recovery**: Secure forgot/reset password flow via email verification tokens.
* **Role Management**: Standardizes roles (`EXECUTIVE`, `DIRECTOR`, `MEMBER`) to enforce granular endpoint security.

### 2. `recruitment` & `applications`
* **Flexible Recruitment Configurations**:
  * Committee recruitment (target members, opening/closing dates, specific roles).
  * Global executive recruitment (Web Master & Technical Director, Treasurer, Secretary, Chairman) without standard committee requirements.
* **Pipeline Review**: Track candidate profile info, CV links, and LinkedIn records.
* **Automated Status Triggers**: Email notifications are dispatched automatically using Nodemailer when application statuses transition (e.g. accepted/rejected).

### 3. `roadmap`, `tasks`, & `materials`
* **Learning Roadmaps**: Directors define technical learning roadmaps.
* **Educational Materials**: Cloudinary-integrated files uploaded by directors to support member training.
* **Assignments & Submissions**: Directors create homework tasks with deadlines. Members submit code links or files, and directors review, comment, and assign grades.

### 4. `sessions`, `attendace`, & `meetings`
* **plugNmeet Integration**: Automated conference room creation and secure meeting URL activation.
* **Scheduling**: Set upcoming session calendars.
* **Attendance Logs**: Log student presence or absence during workshops.

### 5. `audit-log`
* **Audit Interceptor**: Tracks critical administrative changes (who modified what, endpoint path, and timestamp) in the database.

---

## 📂 Project Directory Structure

```text
src/
├── common/              # Shared guards, decorators, custom pipes, filters, and constants
│   ├── constants/       # Role enums, state constants
│   ├── decorators/      # @Public() and @Roles() decorators
│   ├── filters/         # Global exception filters
│   ├── guards/          # JwtAuthGuard, RolesGuard
│   └── pipes/           # ParseIntIdPipe, ParseUlidPipe
├── config/              # Centralized environment configuration loader and swagger setup
├── integrations/        # External API integrations
│   ├── ai-service/      # Candidate CV screening and AI mock interview APIs
│   ├── cloudinary/      # Media upload helper
│   └── plugnmeet/       # Video conference room activator
├── modules/             # Primary modular business domains
│   ├── applications/    # Application management & candidate review
│   ├── attendace/       # Member attendance tracking
│   ├── audit-log/       # Admin activity logs
│   ├── auth/            # JWT authentication & password recovery
│   ├── committees/      # Committee registries
│   ├── director/        # Committee directors actions
│   ├── email/           # Email templates & nodemailer client
│   ├── executive/       # Executive operations & global metrics
│   ├── materials/       # Cloudinary files management
│   ├── meetings/        # Meeting session wrappers
│   ├── quiz/            # Compatibility questionnaire
│   ├── recruitment/     # Global/committee recruitment status & dates
│   ├── roadmap/         # LMS learning modules
│   ├── sessions/        # Schedule workshops & meetings
│   ├── tasks/           # Assignment delivery & evaluation
│   └── users/           # User registry and settings
├── main.ts              # Server bootstrapper & global interceptors setup
└── seed.ts              # DB seeding script for default roles & committees
```

---

## 🛠️ Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root `server` directory:
   ```env
   # App Config
   PORT=3000
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=password
   DB_DATABASE=sams_db
   
   # JWT
   JWT_SECRET=your_jwt_secret_key
   
   # Nodemailer
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # AI Service
   AI_SERVICE_URL=http://localhost:8000
   ```

3. **Run Database Seeds**:
   ```bash
   npm run seed
   ```

4. **Start Development Server**:
   ```bash
   npm run start:dev
   ```

---

## 📖 API Documentation & Testing

* **Swagger UI**: Access Swagger documentation at `http://localhost:3000/api` when the server is active.
* **Code Formatting**: Ensure compliance with prettier policies:
  ```bash
  npm run format
  ```
* **Testing Suite**:
  ```bash
  # Unit tests
  npm run test
  
  # End-to-end tests
  npm run test:e2e
  ```
