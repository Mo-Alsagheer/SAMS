from fastapi import APIRouter
from app.domains.quiz.quiz_schema import ChatRequest
from app.domains.quiz.quiz_service import clean_text, parse_rec, sessions
from app.domains.quiz.quiz_prompt import CHAT_SYSTEM
from app.providers.llm import call_llm

router = APIRouter()

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
