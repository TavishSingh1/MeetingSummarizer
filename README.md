# 🎙️ Meeting Summarizer

An AI-powered meeting summarization system that converts meeting audio into a structured, action-oriented recap.

The system accepts an audio recording, transcribes it using OpenAI's speech-to-text API, processes the transcript through a LangGraph workflow, and generates:

- 📝 Meeting transcript
- ✨ Concise summary
- 📌 Key points
- 🎯 Key decisions
- ✅ Action items
- 👤 Action-item owners
- 📅 Deadlines when identified

## 🎥 Demo

Watch the project demo on YouTube:

[▶️ Meeting Summarizer Demo](https://youtu.be/rlUx4S9rutM)

---

## 🚀 Features

- Upload meeting audio directly from the web interface
- Automatic speech-to-text transcription
- LangGraph-based processing workflow
- AI-generated meeting summaries
- Key point extraction
- Decision extraction
- Action-item extraction
- Owner and deadline identification
- PostgreSQL persistence
- React-based frontend
- FastAPI backend
- API health monitoring
- Structured JSON responses

---

## 🏗️ Architecture

```text
                        Meeting Audio
                             │
                             ▼
                    ┌─────────────────┐
                    │  React Frontend │
                    └────────┬────────┘
                             │
                       Audio Upload
                             │
                             ▼
                    ┌─────────────────┐
                    │     FastAPI     │
                    │     Backend     │
                    └────────┬────────┘
                             │
                             ▼
                 ┌─────────────────────┐
                 │ OpenAI Transcription│
                 │       (ASR)         │
                 └──────────┬──────────┘
                            │
                        Transcript
                            │
                            ▼
                    ┌─────────────────┐
                    │    LangGraph    │
                    │     Workflow    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   GPT-4o-mini   │
                    │  Summarization  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
          Summary        Decisions     Action Items
              │              │              │
              └──────────────┼──────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  React Results  │
                    └─────────────────┘
```

---

## 🧠 Why LangGraph?

LangGraph is used to orchestrate the meeting-processing workflow as a stateful graph.

The current workflow follows:

```text
START
  ↓
Summarize Transcript
  ↓
END
```

The graph receives the transcript as state and produces a structured `MeetingSummary`.

This design also makes the application easy to extend with additional workflow stages such as:

```text
Transcript
    ↓
Cleaning
    ↓
Key Point Extraction
    ↓
Decision Extraction
    ↓
Action Item Extraction
    ↓
Final Summary
    ↓
Quality Check
```

Using a graph-based architecture keeps the processing stages modular and makes it easier to introduce branching, validation, retries, or additional AI processing nodes as the application grows.

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- Lucide React

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn

### AI / LLM

- OpenAI Audio Transcription API
- GPT-4o-mini
- LangGraph
- LangChain components

### Database

- PostgreSQL

### Development

- Git
- Docker / Docker Compose

---

## 📁 Project Structure

```text
MeetingSummarizer/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py
│   │   ├── core/
│   │   │   └── config.py
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   ├── session.py
│   │   │   └── init_db.py
│   │   ├── langgraph/
│   │   │   └── workflow.py
│   │   ├── models/
│   │   │   └── meeting.py
│   │   ├── schemas/
│   │   │   └── meeting.py
│   │   ├── services/
│   │   │   └── transcription.py
│   │   └── main.py
│   │
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── styles.css
│   │
│   └── package.json
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## ⚙️ Prerequisites

Make sure the following are installed:

- Python 3.10+
- Node.js 18+
- PostgreSQL
- Git
- Docker (optional, if using Docker Compose)

You also need an OpenAI API key.

---

## 🔑 Environment Variables

Create:

```text
backend/.env
```

Use `backend/.env.example` as the template.

Example:

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/meeting_summarizer
OPENAI_API_KEY=your_openai_api_key
OPENAI_SUMMARY_MODEL=gpt-4o-mini
CORS_ORIGINS=["http://localhost:5173"]
```

Never commit `.env` to GitHub.

Use `.env.example` as the template for other developers.

---

# 💻 Running Locally

## 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd MeetingSummarizer
```

---

## 2. Start PostgreSQL

Using Docker:

```bash
docker compose up -d postgres
```

Or use an existing local PostgreSQL installation.

If the database does not already exist, create it:

```sql
CREATE DATABASE meeting_summarizer;
```

---

## 3. Set up the backend

```powershell
cd backend
python -m venv .venv
```

### Windows

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

Initialize the database tables:

```powershell
python -m app.db.init_db
```

Start FastAPI:

```powershell
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 4. Start the frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Frontend:

```text
http://127.0.0.1:5173
```

---

# 🔌 API

## Health Check

```http
GET /api/health
```

Example response:

```json
{
  "status": "ok"
}
```

---

## Upload Meeting Audio

```http
POST /api/meetings/upload
```

Request:

```text
multipart/form-data
file=<audio-file>
```

Example response:

```json
{
  "id": 1,
  "filename": "meeting.mp3",
  "transcript": "Today's meeting is about...",
  "summary": "The team discussed...",
  "key_points": [
    "PostgreSQL will be used as the database."
  ],
  "decisions": [
    "Use PostgreSQL as the database."
  ],
  "action_items": [
    {
      "task": "Complete the backend",
      "owner": "Tavish",
      "due_date": "Friday"
    }
  ]
}
```

---

# 🔄 Processing Flow

When a user uploads an audio file:

### 1. Audio Upload

The React frontend sends the recording to the FastAPI backend.

### 2. Transcription

The backend sends the audio to OpenAI's transcription API and receives the meeting transcript.

### 3. LangGraph Processing

The transcript is passed into the LangGraph workflow as graph state.

### 4. LLM Summarization

GPT-4o-mini processes the transcript and generates structured information.

### 5. Structured Output

The system extracts:

- Summary
- Key points
- Decisions
- Action items
- Owners
- Deadlines

### 6. Persistence

The meeting result is stored in PostgreSQL.

### 7. Frontend Display

The React application displays the complete meeting recap.

---

# 🧪 Example

## Input

A meeting recording containing:

```text
Today's meeting is about the Meeting Summarizer project.

We decided to use PostgreSQL as the database.

Tavish will complete the backend by Friday.

Rahul will finish the frontend by Monday.

The final review is scheduled for Wednesday.
```

## Output

**Summary**

> The meeting focused on the Meeting Summarizer project, including database selection and task assignments.

**Key Decision**

- Use PostgreSQL as the database.

**Action Items**

| Task | Owner | Due Date |
|---|---|---|
| Complete the backend | Tavish | Friday |
| Finish the frontend | Rahul | Monday |
| Conduct the final review | Unassigned | Wednesday |

---

# 🎯 Evaluation Alignment

The project directly addresses the following evaluation areas:

| Evaluation Area | Implementation |
|---|---|
| Transcription accuracy | OpenAI speech-to-text |
| Summary quality | GPT-4o-mini |
| LLM prompt effectiveness | Structured JSON summarization prompt |
| Code structure | React + FastAPI + LangGraph + PostgreSQL |
| Workflow orchestration | LangGraph |
| User experience | React + Tailwind interface |

---

# 🔮 Future Improvements

Potential extensions include:

- Speaker diarization
- Speaker name detection
- Timestamped transcripts
- Multi-language transcription
- Meeting history and search
- Export summaries as PDF
- Email/calendar integration
- Quality-check and retry nodes in LangGraph
- Authentication and user-specific meetings
- Cloud deployment
- MCP integrations for external productivity tools

---

# 🎥 Demo

The demonstration covers:

1. Opening the Meeting Summarizer
2. Checking API connectivity
3. Uploading a meeting recording
4. Transcribing the audio
5. Generating the meeting summary
6. Extracting decisions
7. Generating action items with owners and deadlines
8. Displaying the complete structured recap

**Demo video:**  
https://youtu.be/rlUx4S9rutM

---

# 👨‍💻 Author

**Tavish Singh**

Built as an AI-powered meeting intelligence project using **LangGraph, FastAPI, React, PostgreSQL, and OpenAI**.
