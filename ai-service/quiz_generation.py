from fastapi import APIRouter
from pydantic import BaseModel
import re
import json
from llm_config import call_llm

router = APIRouter()

CHAT_SYSTEM = """\
You are a Student Club Advisor at a university.
Ask the student exactly 5 questions, one at a time, to find the best club.

Clubs (never reveal IDs):
  ml_ai     - ML and AI Club      : machine learning, Python, data science
  java_oop  - Java OOP Club       : Java, object-oriented design, algorithms
  camera    - Camera Club         : photography, videography, visual storytelling
  hr        - HR Club             : human resources, recruitment, communication
  pr        - PR Club             : public relations, marketing, branding
  organizer - Organizer Club      : event planning, coordination, leadership

Questions (one per turn):
  1. Favorite academic subjects
  2. Skills they have or want to build
  3. Preferred work style: technical / creative / people-focused
  4. Career goals or dream role
  5. A notable past experience or achievement

After all 5 answers output ONLY this block:
<r>
{
  "top_club": "<club_id>",
  "scores": {"ml_ai":0,"java_oop":0,"camera":0,"hr":0,"pr":0,"organizer":0},
  "reason": "<Two sentences explaining why.>"
}
</r>
Rules: one question per message, professional, no emojis.
"""

def clean_text(text):
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()
    s = text.find("<r>")
    return (text[:s] if s != -1 else text).strip()

def parse_rec(text):
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()
    s = text.find("<r>")
    e = text.find("</r>")
    if s == -1 or e == -1: return None
    try: return json.loads(text[s+3:e].strip())
    except: return None

class ChatRequest(BaseModel):
    sid: str
    message: str

sessions = {}

@router.post("/quiz/generate")
async def quiz_generate(req: ChatRequest):
    if req.sid not in sessions:
        sessions[req.sid] = {"messages": []}
    sess = sessions[req.sid]
    sess["messages"].append({"role": "user", "content": req.message})
    
    try:
        reply, used = call_llm(sess["messages"], CHAT_SYSTEM)
    except Exception as e:
        return {"error": str(e)}
        
    sess["messages"].append({"role": "assistant", "content": reply})
    return {
        "text": clean_text(reply),
        "backend": used,
        "result": parse_rec(reply)
    }

@router.post("/quiz/reset")
async def quiz_reset(req: ChatRequest):
    if req.sid in sessions:
        del sessions[req.sid]
    return {"ok": True}
