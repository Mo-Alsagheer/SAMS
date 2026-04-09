from fastapi import APIRouter
from pydantic import BaseModel
import re
import json
from llm_config import call_llm

router = APIRouter()

INTERVIEW_SYSTEM_TEMPLATE = """You are a strict but fair interviewer for the {club_name} at a university.
Conduct a realistic club membership interview with exactly 5 questions, one at a time.

Club focus: {club_focus}

Interview rules:
- Ask ONE question per message, realistic and relevant to the club
- After each answer give ONE sentence of brief encouraging feedback, then ask the next question
- After the 5th answer output ONLY this block:
<result>
{{
  "scores": {{
    "motivation": 0,
    "skills": 0,
    "communication": 0,
    "teamwork": 0,
    "fit": 0
  }},
  "overall": 0,
  "verdict": "accepted" | "maybe" | "rejected",
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<area1>", "<area2>"],
  "summary": "<Three sentences summarizing the candidate and the decision.>"
}}
</result>
Be professional and realistic. No emojis.
"""

CLUB_FOCUS = {
    "ml_ai":     "ML and AI Club - machine learning, Python, data science, neural networks, projects",
    "java_oop":  "Java OOP Club - Java programming, OOP design patterns, software architecture, algorithms",
    "camera":    "Camera Club - photography, videography, visual composition, editing, creative projects",
    "hr":        "HR Club - human resources, communication, empathy, conflict resolution, team dynamics",
    "pr":        "PR Club - public relations, writing, social media, campaigns, public speaking",
    "organizer": "Organizer Club - event planning, logistics, time management, coordination, leadership",
}

def clean_text(text):
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()
    s = text.find("<result>")
    if s == -1: s = text.find("<r>")
    return (text[:s] if s != -1 else text).strip()

def parse_interview(text):
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()
    s = text.find("<result>")
    e = text.find("</result>")
    if s == -1: s = text.find("<r>")
    if e == -1: e = text.find("</r>")
    if s == -1 or e == -1: return None
    start_idx = s + 8 if text[s:s+8] == "<result>" else s + 3
    try: return json.loads(text[start_idx:e].strip())
    except: return None

class InterviewRequest(BaseModel):
    sid: str
    club: str = ""
    action: str = "chat"
    message: str = ""

interview_sessions = {}

@router.post("/interview/agent")
async def interview_agent(req: InterviewRequest):
    if req.action == "start":
        club_name = {
            "ml_ai": "ML and AI Club", "java_oop": "Java OOP Club",
            "camera": "Camera Club",   "hr": "HR Club",
            "pr": "PR Club",           "organizer": "Organizer Club",
        }.get(req.club, req.club)
        focus = CLUB_FOCUS.get(req.club, club_name)
        system = INTERVIEW_SYSTEM_TEMPLATE.format(
            club_name=club_name, club_focus=focus
        )
        interview_sessions[req.sid] = {"messages": [], "system": system, "club": club_name}
        try:
            reply, used = call_llm(
                [{"role": "user", "content": "Hello, I am ready for my interview."}],
                system
            )
            interview_sessions[req.sid]["messages"] = [
                {"role": "user", "content": "Hello, I am ready for my interview."},
                {"role": "assistant", "content": reply},
            ]
            return {
                "text": clean_text(reply),
                "backend": used,
                "result": parse_interview(reply),
            }
        except Exception as e:
            return {"error": str(e)}

    else:
        if req.sid not in interview_sessions:
            return {"error": "Interview session not found. Please select a club first."}
        sess = interview_sessions[req.sid]
        sess["messages"].append({"role": "user", "content": req.message})
        try:
            reply, used = call_llm(sess["messages"], sess["system"])
        except Exception as e:
            return {"error": str(e)}
        sess["messages"].append({"role": "assistant", "content": reply})
        return {
            "text": clean_text(reply),
            "backend": used,
            "result": parse_interview(reply),
        }
