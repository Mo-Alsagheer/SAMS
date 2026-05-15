# SAMS AI Service

This directory contains the Python-based AI microservice for the SAMS project. It is built using **FastAPI** and provides intelligent endpoints for evaluating applicant CVs and conducting automated interviews using LLMs (e.g., Google Gemini).

## Features

- **CV Evaluation**: Automatically parses and extracts text from PDFs, DOCX files, and Google Drive links. It then evaluates the CV against specific committee requirements and outputs a score, justification, and recommendation.
- **Batch CV Evaluation**: Supports evaluating multiple CVs in a single request with built-in rate limiting (e.g., waiting between requests to respect free-tier limits).
- **Interactive Interview Agent**: A chatbot endpoint that conducts technical and behavioral interviews for applicants based on the specific club/committee they are applying for.

## Architecture

The service follows a modular domain-driven structure:

- `app/api/routes/`: Contains the FastAPI router definitions (`cv.py` and `interview.py`).
- `app/core/`: Contains core configurations, constants, and the essential `committee_requirements.json` which dictates the scoring rubrics, expected skills, and disqualifiers for each committee.
- `app/domains/`: Houses the core business logic.
  - `cv/`: Logic for parsing CVs (`cv_parser.py`), handling the LLM prompt (`cv_prompt.py`), schemas, and the CV service logic (`cv_service.py`).
  - `interview/`: Logic for maintaining interview sessions (`interview_agent.py`), prompts, and schemas.
- `app/providers/`: Contains integrations with external services, primarily the LLM provider (`llm.py`).

## Endpoints

### 1. CV Endpoints
- `POST /evaluate`: Evaluates a single CV. Accepts base64 encoded data or a Google Drive link, along with the target committee name.
- `POST /evaluate/batch`: Evaluates a list of CVs sequentially.

### 2. Interview Endpoints
- `POST /interview/agent`: Interactive endpoint for conducting an interview. Use `"action": "start"` to initialize the session for a specific club, and then send subsequent messages to continue the conversation.

### 3. Utility
- `GET /health`: Health check endpoint.

## Prerequisites

- Python 3.9+ installed
- API Keys for Google Gemini (configured via environment variables, see `.env` if applicable)

## Installation

1. Navigate to the `ai-service` directory.
2. (Optional but recommended) Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   *Note: Ensure `pypdf` and `python-docx` are installed for CV parsing.*

## How to Run

You can run the development server using Python directly:

```bash
python -m app.main
```

Alternatively, you can run it via Uvicorn:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The service will be accessible at `http://localhost:8000`. You can also view the interactive API documentation (Swagger UI) at `http://localhost:8000/docs`.
