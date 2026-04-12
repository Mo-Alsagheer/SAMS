from fastapi import APIRouter
from app.domains.interview.interview_schema import InterviewRequest
from app.domains.interview.interview_agent import (
    interview_sessions, clean_text, parse_interview
)
from app.domains.interview.interview_prompt import INTERVIEW_SYSTEM_TEMPLATE
from app.providers.llm import call_llm
from app.core.constants import CLUBS

router = APIRouter()

@router.post("/interview/agent")
async def interview_agent_endpoint(req: InterviewRequest):
    if req.action == "start":
        club_name = {
            "ml_ai": "ML and AI Club", "java_oop": "Java OOP Club",
            "camera": "Camera Club",   "hr": "HR Club",
            "pr": "PR Club",           "organizer": "Organizer Club",
        }.get(req.club, req.club)
        
        club_data = CLUBS.get(req.club)
        focus = club_data["focus"] if club_data else club_name
        
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
