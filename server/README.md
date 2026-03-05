# SAMS Recruitment System Backend

A progressive, modular, and domain-driven NestJS backend for managing recruitment processes, assessments, and AI-driven candidate evaluation.

## 🚀 Features

- **Recruitment Management**: Open/close recruitment phases for different committees.
- **AI-Powered Assessments**:
  - Dynamic Quiz Generation using Gemini AI.
  - Automated CV Evaluation and Filtering.
  - Interactive AI Mock Interview Agent.
- **Modular Architecture**: Domain-Driven Design (DDD) for high scalability.
- **API Documentation**: Automated Swagger UI generation.
- **Security**: JWT-based authentication and Role-Based Access Control (RBAC).

## 📁 Project Structure

This project follows a scalable, large-scale structure:

```text
src/
├── common/              # Shared utilities (guards, decorators, constants, pipes)
├── config/              # Application and database configuration
├── database/            # Migrations and global database setup
├── integrations/        # External service integrations (Email, AI, Storage)
├── modules/             # Business domain modules
│   ├── auth/            # Authentication & Authorization
│   ├── users/           # User & Profile management
│   ├── committees/      # Committee management
│   ├── recruitment/     # Recruitment flow logic
│   ├── applications/    # Candidate applications
│   ├── quiz/            # AI Quiz logic
│   ├── director/        # Director decision-making features
│   └── ai/              # AI service wrapper
├── workers/             # Background jobs and queues
├── main.ts              # Entry point
└── app.module.ts        # Root module
```

## 🛠️ Setup & Installation

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the root directory and configure:

   ```env
   DATABASE_URL=postgres://user:password@localhost:5432/sams_db
   JWT_SECRET=your_secret_key
   AI_BASE_URL=http://localhost:8000
   PORT=3000
   ```

3. **Database Seeding**:
   Populate the database with initial committees and test users:
   ```bash
   npm run seed
   ```

## 🏃 Running the Project

```bash
# development
npm run start:dev

# build and run
npm run build
npm run start:prod
```

## 📖 API Documentation

Once the server is running, visit:
[http://localhost:3000/api](http://localhost:3000/api)

This provides an interactive Swagger UI to explore and test all endpoints.

## 🧪 Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e
```


