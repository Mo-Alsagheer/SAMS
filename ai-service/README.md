# SAMS AI Service

A Python-based AI microservice for the SAMS platform. Built with **FastAPI** and the **Google Gemini SDK**, it handles intelligent resume screening, structured CV scoring, and interactive mock interviews with conversational session persistence.

---

## 🏗️ Architecture & Core Components

This service is designed with a modular, domain-driven structure to clean-room AI operations from the NestJS main application:

* **FastAPI Routers**: Exposes lightweight endpoints with Pydantic body validation schemas.
* **Document Parsers**: Dynamic text extraction supporting PDF and Word (`.docx`) file processing from raw byte buffers.
* **Rubrics-Driven Prompting**: Automatically retrieves target committee specifications (skills, tech-stack requirements, and negative filters) from a central `committee_requirements.json` configuration file, passing it into the evaluation prompt.
* **Rate-Limiting Queues**: Handles batch evaluations with intelligent sleep triggers to avoid rate limits (e.g. HTTP 429) on free-tier Gemini API keys.
* **Gemini LLM Provider**: Interfaces directly with Google's Gemini models using structured JSON schema response formats.

---

## ⚙️ Core Modules & Business Domains

### 1. CV Parser & Evaluator (`/app/domains/cv`)
* **File Parser**: Parses document buffers (`pdf`, `docx`, and Base64 encoded files) into text.
* **Structured Scorer**: Prompt engineering structures Gemini responses into a strict JSON schema containing:
  * `totalScore` (out of 10)
  * `technicalScore`
  * `analyticalScore`
  * `experienceScore`
  * `justification`
  * `isDisqualified` flag based on rubrics (e.g., lack of prerequisite languages).

### 2. Interactive Mock Interview Agent (`/app/domains/interview`)
* **Session Initiator**: Sets up conversational system contexts representing technical/behavioral interviewers for specific branches.
* **Interactive Agent**: Processes conversational messages and outputs appropriate technical follow-up questions or final candidate evaluations.

---

## 📂 Project Directory Structure

```text
app/
├── api/
│   └── routes/
│       ├── cv.py              # Single and batch CV evaluation endpoints
│       └── interview.py       # Conversational chat-agent endpoints
├── core/
│   ├── committee_requirements.json # Base criteria, tech stack, and filters per committee
│   └── config.py          # Environment settings loader
├── domains/
│   ├── cv/
│   │   ├── cv_parser.py   # PDF and Docx binary stream readers
│   │   ├── cv_prompt.py   # Evaluation prompts generators
│   │   ├── cv_schema.py   # Pydantic schemas for JSON verification
│   │   └── cv_service.py  # Single/batch runner logic with rate-limiting
│   └── interview/
│       ├── interview_agent.py  # Chat session memory compiler
│       ├── interview_prompt.py # Interview system role prompts
│       └── interview_schema.py # Chat query and response validation
├── providers/
│   └── llm.py             # Gemini API client & configuration
└── main.py                # FastAPI bootstrapper, CORS setups, and health checks
```

---

## 🛠️ Installation & Setup

1. **Create Virtual Environment**:
   ```bash
   # Navigate to the ai-service directory
   cd ai-service

   # Create virtual environment
   python -m venv venv

   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   Create a `.env` file inside the `ai-service` directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   PORT=8000
   ```

4. **Run Development Server**:
   ```bash
   python -m app.main
   ```

---

## 📖 API Documentation

Once running, access the interactive OpenAPI/Swagger documentations at:
* **Swagger UI**: `http://localhost:8000/docs`
* **Redoc**: `http://localhost:8000/redoc`
* **Health Check**: `GET http://localhost:8000/health`
