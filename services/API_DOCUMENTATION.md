# SAMS AI Services API Documentation

This document describes the REST API endpoints available in the SAMS AI Services backend. The server runs using FastAPI on port `8000` by default.

## Base URL
`http://localhost:8000`

---

## Health Check

### Get System Health
- **Endpoint**: `GET /health`
- **Description**: Returns the health status, service name, and version of the ATS backend.
- **Response Example**:
  ```json
  {
    "ok": true,
    "service": "ats",
    "version": "0.1"
  }
  ```

---

## Quiz Generation

### Generate Quiz Response
- **Endpoint**: `POST /quiz/generate`
- **Description**: Interacts with the AI advisor to ask the student questions and determine the best club fit.
- **Request Body** (JSON):
  - `sid` (string): Session ID to maintain conversation history.
  - `message` (string): The user's input/answer.
- **Response Format**:
  ```json
  {
    "text": "The next question from the AI advisor...",
    "backend": "model-name",
    "result": null // or a JSON recommendation object when the quiz is finished
  }
  ```

### Reset Quiz Session
- **Endpoint**: `POST /quiz/reset`
- **Description**: Resets the conversation history for a specific session ID.
- **Request Body** (JSON):
  - `sid` (string): Session ID to reset.
  - `message` (string): Optional text field.
- **Response Example**:
  ```json
  {
    "ok": true
  }
  ```

---

## CV Filtration

### Evaluate CV
- **Endpoint**: `POST /evaluate`
- **Description**: Evaluates a student's CV against available clubs and scores their suitability.
- **Request Body** (JSON):
  - `type` (string): The data type - `"text"`, `"pdf"`, or `"gdrive"`. Defaults to `"text"`.
  - `data` (string): Focuses on the type:
    - If `type` is `"text"`, the CV text content.
    - If `type` is `"pdf"`, a base64 encoded string of the PDF file.
    - If `type` is `"gdrive"`, the Google Drive file URL or ID. Note: the file must be set to "Anyone with the link can view".
  - `link` (string): Alternatively, you can directly pass a Google Drive URL via this field instead of using `type` and `data`.
- **Response Format**:
  ```json
  {
    "scores": {
      "ml_ai": 85,
      "java_oop": 40,
      "camera": 10,
      "hr": 20,
      "pr": 15,
      "organizer": 50
    },
    "top_club": "ml_ai",
    "second_club": "organizer",
    "profile_summary": "Two sentences summarizing the candidate's profile.",
    "key_strengths": ["Python", "Machine Learning", "Data Analysis"],
    "backend": "model-name"
  }
  ```

### Evaluate Batch CVs
- **Endpoint**: `POST /evaluate/batch`
- **Description**: Evaluates multiple student CVs concurrently.
- **Request Body** (JSON):
  - `cvs` (Array of Objects): Each object must have:
    - `id` (string): A unique identifier for the candidate request.
    - `type` (string), `data` (string), `link` (string): Options that map exactly to the single `/evaluate` endpoint.
- **Response Format**:
  ```json
  {
    "results": [
      {
        "id": "candidate_1",
        "scores": { ... },
        "top_club": "ml_ai",
        "second_club": "organizer",
        "profile_summary": "...",
        "key_strengths": ["..."],
        "backend": "model-name"
      }
    ]
  }
  ```

---

## Interview Agent

### Conduct Interview
- **Endpoint**: `POST /interview/agent`
- **Description**: Interacts with the AI interviewer for a specific club. Handles both starting the interview and continuing the chat.
- **Request Body** (JSON):
  - `sid` (string): Session ID.
  - `action` (string): `"start"` to begin an interview, or `"chat"` to continue answering. Defaults to `"chat"`.
  - `club` (string): Club ID (e.g., `"ml_ai"`, `"java_oop"`). Required when `action` is `"start"`.
  - `message` (string): The user's input/answer. Required when `action` is `"chat"`.
- **Response Format**:
  ```json
  {
    "text": "The interviewer's next question or feedback...",
    "backend": "model-name",
    "result": null // or an evaluation JSON object when the interview is complete
  }
  ```
- **Example Start Request**:
  ```json
  {
    "sid": "user_123",
    "action": "start",
    "club": "ml_ai"
  }
  ```
- **Example Chat Request**:
  ```json
  {
    "sid": "user_123",
    "action": "chat",
    "message": "I built a neural network for diagnosing plant diseases."
  }
  ```
