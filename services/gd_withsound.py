"""
Student Club AI Advisor
=======================
Run:  python3 student_club_advisor.py
Opens browser at http://localhost:8080

100% FREE - NO API KEY REQUIRED for the primary backend.

Backend 1: mlvoca.com  (FREE, no key, no signup, no install)
  - Hosted free LLM API, works instantly
  - Uses deepseek-r1:1.5b model

Backend 2: GitHub Models  (FREE, needs GitHub account)
  - 150 requests/day free
  - To enable: create a token at https://github.com/settings/tokens
    (no special permissions needed, just create any token)
  - Paste it as GITHUB_TOKEN below

Backend 3: Groq  (FREE, needs new key)
  - Get new key at https://console.groq.com/keys
  - Paste it as GROQ_API_KEY below

No pip installs. Python 3.7+ stdlib only.
"""

import sys, json, re, base64, threading, webbrowser, uuid
import urllib.request, urllib.error, http.server
from typing import Optional, Tuple

# ===========================================================================
#  CONFIG  - mlvoca works with NO key. Add others as backup.
# ===========================================================================

# No key needed - works out of the box
MLVOCA_URL   = "https://mlvoca.com/api/chat"
MLVOCA_MODEL = "deepseek-r1:1.5b"

# Optional: free GitHub token from https://github.com/settings/tokens
GITHUB_TOKEN = "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"
GITHUB_URL   = "https://models.inference.ai.azure.com/chat/completions"
GITHUB_MODEL = "gpt-4o-mini"

# Optional: new Groq key from https://console.groq.com/keys
GROQ_API_KEY = "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"
GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODELS  = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "llama3-8b-8192",
]

PORT = 8080

# ---------------------------------------------------------------------------
# Prompts
# ---------------------------------------------------------------------------
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
  "scores": {"ml_ai":<0-100>,"java_oop":<0-100>,"camera":<0-100>,"hr":<0-100>,"pr":<0-100>,"organizer":<0-100>},
  "reason": "<Two sentences explaining why.>"
}
</r>
Rules: one question per message, professional, no emojis.
"""

CV_SYSTEM = """\
You are a Student Club Advisor. Analyze the CV and score each club.
Clubs: ml_ai(ML/Python), java_oop(Java/OOP), camera(photography), hr(HR/people), pr(PR/marketing), organizer(events).
Reply ONLY with valid JSON, no markdown:
{"scores":{"ml_ai":<0-100>,"java_oop":<0-100>,"camera":<0-100>,"hr":<0-100>,"pr":<0-100>,"organizer":<0-100>},"top_club":"<id>","second_club":"<id>","profile_summary":"<2 sentences>","key_strengths":["<s1>","<s2>","<s3>"]}
"""

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
    "motivation": <0-100>,
    "skills": <0-100>,
    "communication": <0-100>,
    "teamwork": <0-100>,
    "fit": <0-100>
  }},
  "overall": <0-100>,
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

# ---------------------------------------------------------------------------
# State
# ---------------------------------------------------------------------------
class Backend:
    name:  str = ""
    kind:  str = ""
    model: str = ""

# ---------------------------------------------------------------------------
# HTTP helper
# ---------------------------------------------------------------------------
def _post(url, payload, headers, timeout=30):
    req = urllib.request.Request(
        url, data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json", **headers},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())

# ---------------------------------------------------------------------------
# Backend callers
# ---------------------------------------------------------------------------
def _call_mlvoca(messages, system):
    full = [{"role": "system", "content": system}] + messages
    body = _post(MLVOCA_URL,
                 {"model": MLVOCA_MODEL, "messages": full, "stream": False},
                 {}, timeout=60)
    return body["message"]["content"]

def _call_github(messages, system):
    full = [{"role": "system", "content": system}] + messages
    body = _post(GITHUB_URL,
                 {"model": GITHUB_MODEL, "messages": full, "max_tokens": 1024},
                 {"Authorization": f"Bearer {GITHUB_TOKEN}"}, timeout=30)
    return body["choices"][0]["message"]["content"]

def _call_groq(messages, system, model):
    full = [{"role": "system", "content": system}] + messages
    body = _post(GROQ_URL,
                 {"model": model, "messages": full, "max_tokens": 1024},
                 {"Authorization": f"Bearer {GROQ_API_KEY}"}, timeout=30)
    return body["choices"][0]["message"]["content"]

# ---------------------------------------------------------------------------
# Startup detection
# ---------------------------------------------------------------------------
def setup_backend():
    print()
    print("=" * 56)
    print("  STUDENT CLUB AI ADVISOR")
    print("=" * 56)
    print()
    print("  Detecting working backend...")
    print()

    # 1. mlvoca - no key needed
    print("  [1] mlvoca.com (free, no key)...", end="", flush=True)
    try:
        _call_mlvoca([{"role": "user", "content": "hi"}], "Reply: ok")
        print(" OK")
        Backend.kind  = "mlvoca"
        Backend.model = MLVOCA_MODEL
        Backend.name  = f"mlvoca / {MLVOCA_MODEL} (free)"
        return
    except Exception as e:
        print(f" failed: {e}")

    # 2. GitHub Models
    if GITHUB_TOKEN:
        print(f"  [2] GitHub Models ({GITHUB_MODEL})...", end="", flush=True)
        try:
            _call_github([{"role": "user", "content": "hi"}], "Reply: ok")
            print(" OK")
            Backend.kind  = "github"
            Backend.model = GITHUB_MODEL
            Backend.name  = f"GitHub Models / {GITHUB_MODEL} (free)"
            return
        except Exception as e:
            print(f" failed: {e}")
    else:
        print("  [2] GitHub Models - no token set (optional)")

    # 3. Groq
    if GROQ_API_KEY:
        for model in GROQ_MODELS:
            print(f"  [3] Groq / {model}...", end="", flush=True)
            try:
                _call_groq([{"role": "user", "content": "hi"}], "Reply: ok", model)
                print(" OK")
                Backend.kind  = "groq"
                Backend.model = model
                Backend.name  = f"Groq / {model} (free)"
                return
            except urllib.error.HTTPError as e:
                print(f" HTTP {e.code}")
                if e.code == 401: break
            except Exception as e:
                print(f" failed: {e}")

    # Nothing works
    print()
    print("  ERROR: All backends failed.")
    print()
    print("  EASIEST FIX - Get a free GitHub token (takes 1 minute):")
    print("    1. Go to https://github.com/settings/tokens")
    print("    2. Click 'Generate new token (classic)'")
    print("    3. Give it any name, no permissions needed, click Generate")
    print("    4. Copy the token and paste it as GITHUB_TOKEN in this script")
    print()
    print("  OR - Get a new Groq key:")
    print("    1. Go to https://console.groq.com/keys")
    print("    2. Create a new key, paste as GROQ_API_KEY in this script")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Unified LLM call
# ---------------------------------------------------------------------------
def call_llm(messages, system) -> Tuple[str, str]:
    try:
        if Backend.kind == "mlvoca":
            return _call_mlvoca(messages, system), Backend.name
        elif Backend.kind == "github":
            return _call_github(messages, system), Backend.name
        elif Backend.kind == "groq":
            return _call_groq(messages, system, Backend.model), Backend.name
    except Exception as e:
        raise RuntimeError(str(e))
    raise RuntimeError("No backend.")

# ---------------------------------------------------------------------------
# Sessions + Jobs
# ---------------------------------------------------------------------------
sessions: dict = {}
jobs:     dict = {}
interview_sessions: dict = {}

def get_session(sid):
    if sid not in sessions:
        sessions[sid] = {"messages": []}
    return sessions[sid]

# ---------------------------------------------------------------------------
# PDF extractor (stdlib only)
# ---------------------------------------------------------------------------
def extract_pdf_text(data: bytes) -> str:
    try:    raw = data.decode("latin-1")
    except: raw = data.decode("utf-8", errors="replace")
    texts = []
    for block in re.findall(r'BT(.*?)ET', raw, re.DOTALL):
        texts += re.findall(r'\((.*?)\)\s*Tj', block)
        for arr in re.findall(r'\[(.*?)\]\s*TJ', block, re.DOTALL):
            texts += re.findall(r'\((.*?)\)', arr)
    if texts:
        r = " ".join(texts)
        for a, b in [("\\n","\n"),("\\r","\n"),("\\t"," "),("\\(","("),("\\)",")")]:
            r = r.replace(a, b)
        r = re.sub(r'[^\x20-\x7e\n]', ' ', r)
        r = re.sub(r' {2,}', ' ', r).strip()
        if len(r) > 80: return r
    strings = re.findall(r'[A-Za-z0-9 ,.\-:;@/\n\t\'\"()]{4,}', raw)
    out = "\n".join(s.strip() for s in strings if len(s.strip()) > 3)
    return out[:6000] if out else "[Could not extract text from PDF]"

def parse_rec(text):
    s = text.find("<r>"); e = text.find("</r>")
    if s == -1 or e == -1: return None
    try: return json.loads(text[s+3:e].strip())
    except: return None

def clean_text(text):
    # Strip <think>...</think> blocks (deepseek-r1 adds these)
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()
    s = text.find("<r>")
    return (text[:s] if s != -1 else text).strip()

def parse_json(raw):
    # Strip <think>...</think> blocks
    raw = re.sub(r'<think>.*?</think>', '', raw, flags=re.DOTALL).strip()
    c = raw.replace("```json","").replace("```","").strip()
    try: return json.loads(c)
    except:
        s = c.find("{"); e = c.rfind("}")+1
        if s != -1 and e > s:
            try: return json.loads(c[s:e])
            except: pass
    return None

def parse_interview(text):
    """Parse <r>...</r> block from interview AI response."""
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()
    s = text.find("<r>"); e = text.find("</r>")
    if s == -1 or e == -1: return None
    try: return json.loads(text[s+3:e].strip())
    except: return None

# ---------------------------------------------------------------------------
# HTML
# ---------------------------------------------------------------------------
HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Student Club AI Advisor</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',system-ui,sans-serif;background:#080812;color:#e0e0e0;min-height:100vh;display:flex;flex-direction:column}
header{background:#0e0e1c;border-bottom:1px solid #1c1c34;padding:16px 28px;display:flex;align-items:center;gap:14px}
header h1{font-size:19px;font-weight:700;color:#fff}
header p{font-size:11px;color:#44445a;margin-top:2px}
.badge{margin-left:auto;background:#13132a;border:1px solid #24244a;border-radius:99px;padding:4px 14px;font-size:11px;color:#6c63ff;white-space:nowrap;max-width:300px;overflow:hidden;text-overflow:ellipsis}
.tabs{display:flex;background:#0e0e1c;border-bottom:1px solid #1c1c34;padding:0 28px}
.tab{padding:13px 20px;font-size:13px;font-weight:500;color:#44445a;cursor:pointer;border:none;border-bottom:2px solid transparent;background:none;transition:all .2s}
.tab.active{color:#a78bfa;border-bottom-color:#a78bfa}
.tab:hover{color:#bbb}
.panel{display:none;flex:1;padding:28px;max-width:820px;margin:0 auto;width:100%}
.panel.active{display:flex;flex-direction:column}
.chat-box{flex:1;overflow-y:auto;padding:4px 0 12px;min-height:340px;max-height:460px}
.row{display:flex;margin-bottom:12px;align-items:flex-end;gap:8px}
.row.user{justify-content:flex-end}
.av{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#4f46e5,#7c3aed);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0}
.bbl{max-width:74%;padding:10px 15px;font-size:13px;line-height:1.65}
.bbl.bot{background:#14142a;border-radius:4px 14px 14px 14px;color:#ddd}
.bbl.user{background:linear-gradient(135deg,#4f46e5,#6d28d9);border-radius:14px 4px 14px 14px;color:#fff}
.dots{display:flex;gap:5px;padding:8px 12px}
.dot{width:6px;height:6px;border-radius:50%;background:#6c63ff;animation:bop .85s infinite}
.dot:nth-child(2){animation-delay:.15s}.dot:nth-child(3){animation-delay:.3s}
@keyframes bop{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
.inp-row{display:flex;gap:8px;margin-top:12px}
.inp{flex:1;padding:11px 16px;background:#13132a;border:1px solid #24244a;border-radius:99px;color:#fff;font-size:13px;outline:none;transition:border .2s}
.inp:focus{border-color:#4f46e5}
.btn-s{padding:11px 22px;border-radius:99px;border:none;background:linear-gradient(135deg,#4f46e5,#6d28d9);color:#fff;font-weight:700;font-size:13px;cursor:pointer}
.btn-s:disabled{opacity:.35;cursor:default}
.btn-r{padding:11px 14px;border-radius:99px;border:1px solid #24244a;background:none;color:#55556a;font-size:12px;cursor:pointer}
.be-tag{font-size:11px;color:#33334a;text-align:right;margin-top:3px}
.res-card{margin-top:8px;background:#0c0c1e;border:1px solid #24244a;border-radius:12px;padding:18px}
.res-card h3{font-size:11px;color:#44445a;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px}
.sr{display:flex;align-items:center;gap:9px;margin-bottom:8px}
.sn{font-size:12px;color:#888;width:160px;flex-shrink:0}
.sn.t{color:#a78bfa;font-weight:700}
.tr{flex:1;background:#18183a;border-radius:99px;height:7px;overflow:hidden}
.tf{height:100%;border-radius:99px;background:#2a2a50;transition:width 1.2s ease}
.tf.t{background:linear-gradient(90deg,#4f46e5,#a78bfa);box-shadow:0 0 8px #6c63ff55}
.sp{font-size:11px;color:#55556a;width:34px;text-align:right;flex-shrink:0}
.sp.t{color:#a78bfa;font-weight:700}
.top-b{margin-top:12px;padding:12px 16px;background:#110c2a;border:1px solid #4f46e533;border-radius:10px}
.top-b .cn{font-size:15px;font-weight:700;color:#a78bfa}
.top-b .rea{font-size:12px;color:#888;margin-top:5px;line-height:1.65}
.drop{border:2px dashed #24244a;border-radius:16px;padding:52px 28px;text-align:center;cursor:pointer;transition:all .2s;background:#0c0c1a;user-select:none}
.drop.over{border-color:#4f46e5;background:#121230}
.drop .ico{font-size:48px;margin-bottom:14px;opacity:.5}
.drop h2{font-size:17px;font-weight:600;color:#ccc;margin-bottom:8px}
.drop p{font-size:12px;color:#44445a}
.drop .hint{margin-top:16px;font-size:11px;color:#2e2e4a}
#fi{display:none}
.btn-br{display:inline-block;margin-top:16px;padding:10px 26px;border-radius:99px;border:1px solid #24244a;background:none;color:#a78bfa;font-size:13px;cursor:pointer;transition:background .2s}
.btn-br:hover{background:#16163a}
.spin{display:none;text-align:center;padding:40px;font-size:13px;color:#55556a}
.spin.on{display:block}
.ring{display:inline-block;width:36px;height:36px;border:3px solid #1e1e3a;border-top-color:#6c63ff;border-radius:50%;animation:sp .7s linear infinite;margin-bottom:12px}
@keyframes sp{to{transform:rotate(360deg)}}
.cv-res{margin-top:24px}
.sum{background:#0c0c1a;border:1px solid #24244a;border-radius:12px;padding:18px;margin-bottom:16px}
.sum h3{font-size:11px;color:#44445a;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px}
.sum p{font-size:13px;color:#ccc;line-height:1.7}
.tags{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}
.tag{padding:4px 12px;border-radius:99px;background:#141434;font-size:11px;color:#a78bfa}
.tc{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}
.cc{background:#0c0c1a;border:1px solid #24244a;border-radius:12px;padding:16px}
.cc.f{border-color:#4f46e544}
.cc .rk{font-size:10px;color:#44445a;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px}
.cc .nm{font-size:14px;font-weight:700;color:#a78bfa}
.cc .ds{font-size:11px;color:#44445a;margin-top:4px;line-height:1.5}
.cc .pc{font-size:28px;font-weight:800;color:#a78bfa;margin-top:10px}
.err{background:#180a0a;border:1px solid #6b2020;border-radius:10px;padding:14px;font-size:13px;color:#ff8888;line-height:1.8;margin-top:6px}
.err a{color:#a78bfa}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#24244a;border-radius:99px}

.club-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}
.club-card{background:#0d0d20;border:1px solid #1e1e38;border-radius:14px;padding:20px 16px;cursor:pointer;transition:all .2s;text-align:center}
.club-card:hover{border-color:#4f46e5;background:#121230;transform:translateY(-2px)}
.club-card .ci{font-size:32px;margin-bottom:10px}
.club-card .cn2{font-size:13px;font-weight:700;color:#ccc}
.club-card .cd{font-size:11px;color:#44445a;margin-top:4px;line-height:1.5}
/* voice interview */
.iv-stage{display:flex;flex-direction:column;align-items:center;gap:0;padding:12px 0 0}
.iv-header{background:#0d0d20;border:1px solid #1e1e38;border-radius:12px;padding:12px 18px;margin-bottom:14px;display:flex;align-items:center;gap:12px;width:100%}
.iv-header .ico2{font-size:22px}
.iv-header .ti{font-size:14px;font-weight:700;color:#a78bfa}
.iv-header .su{font-size:11px;color:#44445a;margin-top:1px}
.iv-avatar{position:relative;width:100px;height:100px;margin:8px 0 4px}
.av-ring{position:absolute;inset:0;border-radius:50%;border:3px solid #4f46e5;opacity:0;animation:none}
.av-ring.speaking{animation:pulse-ring 1s ease-out infinite}
@keyframes pulse-ring{0%{transform:scale(1);opacity:.8}100%{transform:scale(1.45);opacity:0}}
.av-face{width:100%;height:100%;border-radius:50%;background:linear-gradient(135deg,#1e1b4b,#312e81);display:flex;align-items:center;justify-content:center;font-size:38px;border:2px solid #4f46e544;position:relative;z-index:1}
.iv-status{font-size:12px;color:#55556a;margin:6px 0 10px;min-height:18px;text-align:center}
.iv-transcript{width:100%;background:#0c0c1a;border:1px solid #1e1e38;border-radius:10px;padding:12px 16px;font-size:13px;color:#888;min-height:52px;margin-bottom:12px;line-height:1.6;font-style:italic;text-align:center}
.iv-transcript.user-text{color:#a78bfa;font-style:normal}
.iv-last-q{width:100%;background:#14142a;border:1px solid #24244a;border-radius:10px;padding:12px 16px;font-size:13px;color:#ccc;min-height:52px;line-height:1.6;margin-bottom:14px}
.iv-last-q .qlbl{font-size:10px;color:#44445a;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px}
.voice-controls{display:flex;gap:10px;align-items:center;margin-bottom:10px}
.btn-mic{width:62px;height:62px;border-radius:50%;border:none;cursor:pointer;font-size:24px;display:flex;align-items:center;justify-content:center;transition:all .2s;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;box-shadow:0 0 0 0 #4f46e555}
.btn-mic.recording{background:linear-gradient(135deg,#dc2626,#991b1b);animation:mic-pulse 1.2s ease infinite;box-shadow:0 0 0 0 #dc262655}
@keyframes mic-pulse{0%,100%{box-shadow:0 0 0 0 #dc262655}50%{box-shadow:0 0 0 12px #dc262600}}
.btn-mic:disabled{opacity:.35;cursor:default;animation:none}
.btn-skip{padding:10px 18px;border-radius:99px;border:1px solid #24244a;background:none;color:#55556a;font-size:12px;cursor:pointer;transition:all .2s}
.btn-skip:hover{border-color:#4f46e5;color:#a78bfa}
.iv-qcount{font-size:11px;color:#33334a;text-align:center;margin-top:4px}
.iv-text-row{display:flex;gap:8px;width:100%;margin-top:6px}
.iv-text-row .inp{flex:1}
/* results */
.iv-res{background:#0c0c1e;border:1px solid #24244a;border-radius:14px;padding:22px;margin-top:8px}
.iv-res h3{font-size:11px;color:#44445a;text-transform:uppercase;letter-spacing:2px;margin-bottom:14px}
.verdict{display:inline-block;padding:6px 18px;border-radius:99px;font-size:13px;font-weight:700;margin-bottom:16px}
.verdict.accepted{background:#0a2a1a;color:#4ade80;border:1px solid #166534}
.verdict.maybe{background:#1a1a0a;color:#facc15;border:1px solid #854d0e}
.verdict.rejected{background:#2a0a0a;color:#f87171;border:1px solid #7f1d1d}
.iv-scores{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px}
.iv-score-row{display:flex;align-items:center;gap:8px}
.iv-sn{font-size:11px;color:#888;width:110px;flex-shrink:0}
.iv-tr{flex:1;background:#18183a;border-radius:99px;height:6px;overflow:hidden}
.iv-tf{height:100%;border-radius:99px;background:linear-gradient(90deg,#4f46e5,#a78bfa);transition:width 1s ease}
.iv-sp{font-size:11px;color:#a78bfa;width:30px;text-align:right;flex-shrink:0}
.overall-score{text-align:center;padding:16px;background:#110c2a;border:1px solid #4f46e533;border-radius:12px;margin-bottom:16px}
.overall-score .num{font-size:48px;font-weight:900;color:#a78bfa;line-height:1}
.overall-score .lbl{font-size:11px;color:#44445a;margin-top:4px;text-transform:uppercase;letter-spacing:2px}
.iv-cols{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}
.iv-col{background:#0c0c1a;border:1px solid #24244a;border-radius:10px;padding:14px}
.iv-col h4{font-size:10px;color:#44445a;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px}
.iv-col li{font-size:12px;color:#ccc;margin-bottom:6px;padding-left:14px;position:relative;line-height:1.5}
.iv-col li::before{content:"•";position:absolute;left:0;color:#6c63ff}
.iv-sum{font-size:13px;color:#aaa;line-height:1.7;background:#0c0c1a;border:1px solid #24244a;border-radius:10px;padding:14px}
.btn-restart{margin-top:16px;padding:11px 24px;border-radius:99px;border:none;background:linear-gradient(135deg,#4f46e5,#6d28d9);color:#fff;font-weight:700;font-size:13px;cursor:pointer}

</style>
</head>
<body>
<header>
  <div><h1>Student Club AI Advisor</h1><p>Find your perfect university club</p></div>
  <div class="badge" id="badge">Connecting...</div>
</header>
<div class="tabs">
  <button class="tab active" onclick="sw('chat')">Chat Advisor</button>
  <button class="tab"        onclick="sw('cv')">CV Scanner</button>
  <button class="tab"        onclick="sw('interview')">Mock Interview</button>
</div>

<div class="panel active" id="panel-chat">
  <div class="chat-box" id="cb"></div>
  <div class="inp-row">
    <input class="inp" id="ci" placeholder="Type your answer and press Enter..."
           onkeydown="if(event.key==='Enter')send()"/>
    <button class="btn-s" id="bs" onclick="send()">Send</button>
    <button class="btn-r" onclick="rst()">Restart</button>
  </div>
  <div class="be-tag" id="cbe"></div>
</div>

<div class="panel" id="panel-cv">
  <div class="drop" id="dz"
       ondragover="dov(event)" ondragleave="dlv()" ondrop="ddr(event)"
       onclick="document.getElementById('fi').click()">
    <div class="ico">&#128196;</div>
    <h2>Drag and drop your CV here</h2>
    <p>Supports PDF and TXT files</p>
    <button class="btn-br" onclick="event.stopPropagation();document.getElementById('fi').click()">Browse File</button>
    <div class="hint">Analyzed securely - nothing stored</div>
  </div>
  <input type="file" id="fi" accept=".pdf,.txt" onchange="hfs(event)"/>
  <div class="spin" id="spn"><div class="ring"></div><br>Analyzing with <span id="spbe">AI</span>...</div>
  <div class="cv-res" id="cvr" style="display:none"></div>
</div>

<script>
const SID=Math.random().toString(36).slice(2);
let busy=false;
const CN={ml_ai:'ML and AI Club',java_oop:'Java OOP Club',camera:'Camera Club',hr:'HR Club',pr:'PR Club',organizer:'Organizer Club'};
const CD={ml_ai:'Machine learning, data science, Python.',java_oop:'Java, OOP design, algorithms.',camera:'Photography, videography, storytelling.',hr:'Human resources, recruitment.',pr:'Public relations, marketing.',organizer:'Event planning, coordination.'};

// sw() defined in interview section below
async function ping(){
  try{const r=await fetch('/api/ping');const d=await r.json();document.getElementById('badge').textContent=d.backend;}
  catch{document.getElementById('badge').textContent='offline - restart script';}
}
ping();setInterval(ping,10000);

function bub(role,html){
  const b=document.getElementById('cb'),r=document.createElement('div');
  r.className='row '+role;
  r.innerHTML=role==='bot'?`<div class="av">AI</div><div class="bbl bot">${html}</div>`:`<div class="bbl user">${html}</div>`;
  b.appendChild(r);b.scrollTop=b.scrollHeight;
}
function showDots(){
  const b=document.getElementById('cb'),r=document.createElement('div');
  r.className='row bot';r.id='td';
  r.innerHTML='<div class="av">AI</div><div class="bbl bot"><div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div>';
  b.appendChild(r);b.scrollTop=b.scrollHeight;
}
function hideDots(){const t=document.getElementById('td');if(t)t.remove();}

function scoreHTML(res){
  const s=Object.entries(res.scores).sort((a,b)=>b[1]-a[1]);
  const rows=s.map(([id,v])=>{const t=id===res.top_club;return`<div class="sr"><div class="sn ${t?'t':''}">${CN[id]||id}</div><div class="tr"><div class="tf ${t?'t':''}" style="width:${v}%"></div></div><div class="sp ${t?'t':''}">${v}%</div></div>`;}).join('');
  return`<div class="res-card"><h3>Club Compatibility</h3>${rows}<div class="top-b"><div class="cn">${CN[res.top_club]||res.top_club}</div><div class="rea">${res.reason||''}</div></div></div>`;
}
function errBox(msg){return`<div class="err">${msg}</div>`;}
function setB(v){busy=v;document.getElementById('bs').disabled=v;document.getElementById('ci').disabled=v;}

async function start(){
  setB(true);showDots();
  try{
    const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sid:SID,message:'Hello, I am a student looking to join a club.'})});
    const d=await r.json();hideDots();
    if(d.error){bub('bot',errBox(d.error));return;}
    if(d.text)bub('bot',d.text);
    document.getElementById('cbe').textContent='via '+d.backend;
    if(d.result)bub('bot',scoreHTML(d.result));
  }catch(e){hideDots();bub('bot',errBox('Cannot reach server. Make sure the Python script is running in your terminal.'));}
  finally{setB(false);}
}
async function send(){
  if(busy)return;
  const i=document.getElementById('ci'),m=i.value.trim();
  if(!m)return;i.value='';bub('user',m);setB(true);showDots();
  try{
    const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sid:SID,message:m})});
    const d=await r.json();hideDots();
    if(d.error){bub('bot',errBox(d.error));return;}
    if(d.text)bub('bot',d.text);
    document.getElementById('cbe').textContent='via '+d.backend;
    if(d.result)bub('bot',scoreHTML(d.result));
  }catch(e){hideDots();bub('bot',errBox('Connection error.'));}
  finally{setB(false);}
}
function rst(){
  document.getElementById('cb').innerHTML='';document.getElementById('cbe').textContent='';
  fetch('/api/reset',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sid:SID})});
  start();
}
function dov(e){e.preventDefault();document.getElementById('dz').classList.add('over');}
function dlv(){document.getElementById('dz').classList.remove('over');}
function ddr(e){e.preventDefault();dlv();const f=e.dataTransfer.files[0];if(f)proc(f);}
function hfs(e){const f=e.target.files[0];if(f)proc(f);}
function proc(f){
  const isPdf=f.name.toLowerCase().endsWith('.pdf')||f.type==='application/pdf';
  const rd=new FileReader();
  rd.onload=async function(ev){
    document.getElementById('spn').classList.add('on');
    document.getElementById('cvr').style.display='none';
    document.getElementById('spbe').textContent='AI';
    try{
      const body=isPdf?JSON.stringify({type:'pdf',data:ev.target.result.split(',')[1]}):JSON.stringify({type:'text',data:ev.target.result});
      const jr=await fetch('/api/scan_cv',{method:'POST',headers:{'Content-Type':'application/json'},body});
      const jd=await jr.json();
      if(jd.error){
        document.getElementById('spn').classList.remove('on');
        const el=document.getElementById('cvr');el.innerHTML=errBox(jd.error);el.style.display='block';return;
      }
      let dots=1;
      const poll=setInterval(async()=>{
        dots=dots%3+1;
        document.getElementById('spbe').textContent='AI'+'.'.repeat(dots);
        try{
          const pr=await fetch('/api/cv_result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({job_id:jd.job_id})});
          const pd=await pr.json();
          if(pd.status==='done'){
            clearInterval(poll);document.getElementById('spn').classList.remove('on');renderCV(pd.result);
          }else if(pd.status==='error'){
            clearInterval(poll);document.getElementById('spn').classList.remove('on');
            const el=document.getElementById('cvr');el.innerHTML=errBox(pd.result?.error||'Analysis failed.');el.style.display='block';
          }
        }catch(e){}
      },1500);
    }catch(ex){
      document.getElementById('spn').classList.remove('on');
      const el=document.getElementById('cvr');el.innerHTML=errBox('Failed: '+ex.message);el.style.display='block';
    }
  };
  isPdf?rd.readAsDataURL(f):rd.readAsText(f);
}
function renderCV(d){
  const s=Object.entries(d.scores).sort((a,b)=>b[1]-a[1]);
  const rows=s.map(([id,v])=>{const t=id===d.top_club;return`<div class="sr"><div class="sn ${t?'t':''}">${CN[id]||id}</div><div class="tr"><div class="tf ${t?'t':''}" style="width:${v}%"></div></div><div class="sp ${t?'t':''}">${v}%</div></div>`;}).join('');
  const tags=(d.key_strengths||[]).map(s=>`<span class="tag">${s}</span>`).join('');
  const el=document.getElementById('cvr');
  el.innerHTML=`
    <div class="sum"><h3>Profile Summary</h3><p>${d.profile_summary||''}</p><div class="tags">${tags}</div></div>
    <div class="tc">
      <div class="cc f"><div class="rk">1st Match</div><div class="nm">${CN[d.top_club]||d.top_club}</div><div class="ds">${CD[d.top_club]||''}</div><div class="pc">${d.scores[d.top_club]||0}%</div></div>
      <div class="cc"><div class="rk">2nd Match</div><div class="nm">${CN[d.second_club]||d.second_club}</div><div class="ds">${CD[d.second_club]||''}</div><div class="pc">${d.scores[d.second_club]||0}%</div></div>
    </div>
    <div class="res-card"><h3>Full Compatibility Scores</h3>${rows}</div>
    <div class="be-tag" style="margin-top:6px">Analyzed via ${d.backend}</div>`;
  el.style.display='block';
}

// ---- INTERVIEW (voice + text, real-time) ----
const CLUBS_INFO = {
  ml_ai:    {icon:'🤖', name:'ML and AI Club',   desc:'Machine learning & data science'},
  java_oop: {icon:'☕', name:'Java OOP Club',     desc:'Java & software architecture'},
  camera:   {icon:'📷', name:'Camera Club',       desc:'Photography & videography'},
  hr:       {icon:'🤝', name:'HR Club',           desc:'Human resources & communication'},
  pr:       {icon:'📢', name:'PR Club',           desc:'Public relations & marketing'},
  organizer:{icon:'📋', name:'Organizer Club',    desc:'Event planning & leadership'},
};

let ibusy       = false;
let currentClub = '';
let qCount      = 0;
let recognition = null;
let isRecording = false;
let synth       = window.speechSynthesis;
let currentUtterance = null;
let voiceReady  = false;

// ── Speech helpers ──────────────────────────────────────────────────────

function aiSpeak(text, onDone) {
  if (!synth) { if(onDone) onDone(); return; }
  synth.cancel();
  // strip any leftover markdown / tags
  const clean = text.replace(/<[^>]+>/g,'').replace(/[*_`#]/g,'').trim();
  const utt = new SpeechSynthesisUtterance(clean);
  utt.rate  = 0.95;
  utt.pitch = 1.0;
  // prefer a natural English voice if available
  const voices = synth.getVoices();
  const pick = voices.find(v=>v.lang.startsWith('en')&&v.name.includes('Natural'))
            || voices.find(v=>v.lang.startsWith('en')&&!v.localService)
            || voices.find(v=>v.lang.startsWith('en'))
            || voices[0];
  if (pick) utt.voice = pick;
  utt.onstart = () => {
    document.getElementById('av-ring').classList.add('speaking');
    setStatus('AI is speaking...');
  };
  utt.onend = utt.onerror = () => {
    document.getElementById('av-ring').classList.remove('speaking');
    if (onDone) onDone();
  };
  currentUtterance = utt;
  synth.speak(utt);
}

function stopSpeaking() {
  if (synth) synth.cancel();
  document.getElementById('av-ring').classList.remove('speaking');
}

// ── Speech recognition ──────────────────────────────────────────────────

function initRecognition() {
  const SRClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SRClass) return null;
  const r = new SRClass();
  r.continuous      = false;
  r.interimResults  = true;
  r.lang            = 'en-US';
  r.onresult = (e) => {
    let interim = '', final = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) final += e.results[i][0].transcript;
      else interim += e.results[i][0].transcript;
    }
    const el = document.getElementById('iv-transcript');
    el.textContent = final || interim || '...';
    el.className   = 'iv-transcript user-text';
    if (final) {
      stopMic();
      document.getElementById('ii').value = final;
      iSendText();
    }
  };
  r.onerror = (e) => {
    console.warn('SR error', e.error);
    stopMic();
    if (e.error === 'not-allowed')
      setStatus('Microphone blocked. Use text input below.');
    else
      setStatus('Speech error. Use text input below.');
  };
  r.onend = () => { if (isRecording) stopMic(); };
  return r;
}

function toggleMic() {
  if (ibusy) return;
  if (isRecording) { stopMic(); return; }
  stopSpeaking();
  const SRClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SRClass) {
    setStatus('Your browser does not support voice. Use Chrome or Edge.');
    return;
  }
  recognition = initRecognition();
  try {
    recognition.start();
    isRecording = true;
    document.getElementById('btn-mic').classList.add('recording');
    document.getElementById('btn-mic').textContent = '⏹';
    document.getElementById('iv-transcript').textContent = 'Listening...';
    document.getElementById('iv-transcript').className   = 'iv-transcript';
    setStatus('Listening... speak now');
  } catch(e) {
    setStatus('Could not start mic: ' + e.message);
  }
}

function stopMic() {
  isRecording = false;
  const btn = document.getElementById('btn-mic');
  btn.classList.remove('recording');
  btn.textContent = '🎤';
  if (recognition) { try { recognition.stop(); } catch(e){} }
  setStatus('Processing...');
}

// ── UI helpers ──────────────────────────────────────────────────────────

function setStatus(txt) {
  document.getElementById('iv-status').textContent = txt;
}
function setQuestion(txt) {
  document.getElementById('iv-q-text').textContent = txt;
}
function setTranscript(txt, isUser) {
  const el = document.getElementById('iv-transcript');
  el.textContent = txt;
  el.className   = 'iv-transcript' + (isUser ? ' user-text' : '');
}

function buildClubGrid(){
  const g = document.getElementById('club-grid');
  g.innerHTML = Object.entries(CLUBS_INFO).map(([id,c])=>
    `<div class="club-card" onclick="startInterview('${id}')">
      <div class="ci">${c.icon}</div>
      <div class="cn2">${c.name}</div>
      <div class="cd">${c.desc}</div>
    </div>`
  ).join('');
}

function sw(n){
  document.querySelectorAll('.tab').forEach((t,i)=>
    t.classList.toggle('active',
      (n==='chat'&&i===0)||(n==='cv'&&i===1)||(n==='interview'&&i===2)));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('panel-'+n).classList.add('active');
}

// ── Interview flow ──────────────────────────────────────────────────────

async function startInterview(club) {
  currentClub = club;
  qCount      = 0;
  const info  = CLUBS_INFO[club];

  document.getElementById('iv-select').style.display = 'none';
  document.getElementById('iv-result').style.display  = 'none';
  document.getElementById('iv-chat').style.display    = 'flex';
  document.getElementById('av-face').textContent      = info.icon;
  document.getElementById('iv-header').innerHTML =
    `<div class="ico2">${info.icon}</div>
     <div><div class="ti">${info.name} — Voice Interview</div>
     <div class="su">5 questions · speak or type · AI voice responses</div></div>
     <button class="btn-r" style="margin-left:auto" onclick="iReset()">✕ Exit</button>`;

  setStatus('Starting interview...');
  setQuestion('Waiting for interviewer...');
  setTranscript('Press the mic button and speak your answer', false);
  document.getElementById('iv-qcount').textContent = '';
  document.getElementById('ii').value = '';
  document.getElementById('ibe').textContent = '';

  ibusy = true;
  setBtnState(true);
  try {
    const r = await fetch('/api/interview', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({sid:SID, club:club, action:'start'})
    });
    const d = await r.json();
    if (d.error) { setStatus('Error: ' + d.error); ibusy=false; setBtnState(false); return; }
    document.getElementById('ibe').textContent = 'via ' + d.backend;
    if (d.result) { showInterviewResult(d.result); return; }
    if (d.text)   handleAITurn(d.text, 1);
  } catch(e) {
    setStatus('Server error: ' + e.message);
    ibusy = false; setBtnState(false);
  }
}

function handleAITurn(text, questionNum) {
  qCount = questionNum;
  setQuestion(text);
  document.getElementById('iv-qcount').textContent =
    questionNum <= 5 ? `Question ${questionNum} of 5` : '';
  setTranscript('Press the mic button and speak your answer', false);

  // speak it aloud, then unlock controls
  aiSpeak(text, () => {
    ibusy = false;
    setBtnState(false);
    setStatus('Your turn — press mic or type below');
  });
}

async function iSendText() {
  if (ibusy) return;
  const inp = document.getElementById('ii');
  const msg = inp.value.trim();
  if (!msg) return;
  inp.value = '';
  stopMic();
  stopSpeaking();

  setTranscript(msg, true);
  setStatus('AI is thinking...');
  ibusy = true;
  setBtnState(true);

  try {
    const r = await fetch('/api/interview', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({sid:SID, club:currentClub, action:'chat', message:msg})
    });
    const d = await r.json();
    if (d.error) { setStatus('Error: ' + d.error); ibusy=false; setBtnState(false); return; }
    document.getElementById('ibe').textContent = 'via ' + d.backend;
    if (d.result) { showInterviewResult(d.result); return; }
    if (d.text)   handleAITurn(d.text, qCount + 1);
  } catch(e) {
    setStatus('Error: ' + e.message);
    ibusy = false; setBtnState(false);
  }
}

function setBtnState(disabled) {
  document.getElementById('btn-mic').disabled = disabled;
  document.getElementById('ibs').disabled     = disabled;
}

function showInterviewResult(res) {
  stopSpeaking();
  document.getElementById('iv-chat').style.display = 'none';
  const vc     = res.verdict || 'maybe';
  const vLabel = vc==='accepted' ? 'Accepted' : vc==='maybe' ? 'Borderline' : 'Not Selected';
  const scoreNames = {motivation:'Motivation',skills:'Skills',communication:'Communication',teamwork:'Teamwork',fit:'Club Fit'};
  const scoreRows = Object.entries(res.scores||{}).map(([k,v])=>
    `<div class="iv-score-row">
      <div class="iv-sn">${scoreNames[k]||k}</div>
      <div class="iv-tr"><div class="iv-tf" style="width:${v}%"></div></div>
      <div class="iv-sp">${v}%</div>
    </div>`).join('');
  const strengths    = (res.strengths||[]).map(s=>`<li>${s}</li>`).join('');
  const improvements = (res.improvements||[]).map(s=>`<li>${s}</li>`).join('');

  const el = document.getElementById('iv-result');
  el.innerHTML = `
    <div class="iv-res">
      <h3>Interview Result</h3>
      <div class="overall-score">
        <div class="num">${res.overall||0}</div>
        <div class="lbl">Overall Score</div>
      </div>
      <div class="verdict ${vc}">${vLabel}</div>
      <div class="iv-scores" style="margin-top:16px">${scoreRows}</div>
      <div class="iv-cols">
        <div class="iv-col"><h4>Strengths</h4><ul>${strengths}</ul></div>
        <div class="iv-col"><h4>Areas to Improve</h4><ul>${improvements}</ul></div>
      </div>
      <div class="iv-sum">${res.summary||''}</div>
      <button class="btn-restart" onclick="iReset()">Try Another Club</button>
    </div>`;
  el.style.display = 'block';

  // Read the summary aloud
  aiSpeak('Interview complete. ' + (res.summary||''), null);
}

function iReset() {
  stopSpeaking();
  stopMic();
  ibusy = false;
  qCount = 0;
  document.getElementById('iv-select').style.display = 'block';
  document.getElementById('iv-chat').style.display   = 'none';
  document.getElementById('iv-result').style.display  = 'none';
  currentClub = '';
}

window.onload=()=>{start();buildClubGrid();};
</script>
<div class="panel" id="panel-interview">

  <!-- Club selector -->
  <div id="iv-select">
    <div style="text-align:center;padding:28px 0 18px">
      <div style="font-size:15px;font-weight:700;color:#ccc;margin-bottom:5px">Choose a club to interview for</div>
      <div style="font-size:12px;color:#44445a;margin-bottom:24px">AI interviewer · voice + text · real-time feedback</div>
    </div>
    <div class="club-grid" id="club-grid"></div>
  </div>

  <!-- Voice interview stage -->
  <div id="iv-chat" style="display:none;flex-direction:column;flex:1">
    <div class="iv-header" id="iv-header"></div>

    <div class="iv-stage">
      <!-- AI avatar -->
      <div class="iv-avatar">
        <div class="av-ring" id="av-ring"></div>
        <div class="av-face" id="av-face">🤖</div>
      </div>
      <div class="iv-status" id="iv-status">Connecting...</div>

      <!-- Last question display -->
      <div class="iv-last-q" id="iv-last-q">
        <div class="qlbl">Interviewer</div>
        <div id="iv-q-text">Waiting for interviewer...</div>
      </div>

      <!-- Live transcript (what user is saying) -->
      <div class="iv-transcript" id="iv-transcript">Press the mic button and speak your answer</div>

      <!-- Controls -->
      <div class="voice-controls">
        <button class="btn-mic" id="btn-mic" onclick="toggleMic()" title="Hold to speak">🎤</button>
        <div>
          <div style="font-size:12px;color:#55556a;margin-bottom:4px">Click mic to speak</div>
          <button class="btn-skip" onclick="iReset()">↩ Change Club</button>
        </div>
      </div>
      <div class="iv-qcount" id="iv-qcount"></div>

      <!-- Fallback text input -->
      <div class="iv-text-row">
        <input class="inp" id="ii" placeholder="Or type your answer here and press Enter..."
               onkeydown="if(event.key==='Enter')iSendText()"/>
        <button class="btn-s" id="ibs" onclick="iSendText()">Send</button>
      </div>
      <div class="be-tag" id="ibe"></div>
    </div>
  </div>

  <!-- Result card -->
  <div id="iv-result" style="display:none"></div>

</div>

</body>
</html>"""

# ---------------------------------------------------------------------------
# HTTP handler
# ---------------------------------------------------------------------------
class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt, *args): print('[HTTP]', fmt % args)

    def send_json(self, data, code=200):
        body = json.dumps(data).encode()
        self.send_response(code)
        self.send_header("Content-Type",   "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin",  "*")
        self.send_header("Access-Control-Allow-Methods", "POST,GET,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        if self.path in ("/", "/index.html"):
            body = HTML.encode()
            self.send_response(200)
            self.send_header("Content-Type",   "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        elif self.path == "/api/ping":
            self.send_json({"backend": Backend.name or "none"})
        else:
            self.send_response(404); self.end_headers()

    def do_POST(self):
        try:
            n    = int(self.headers.get("Content-Length", 0))
            raw  = self.rfile.read(n)
            body = json.loads(raw.decode())
        except Exception as e:
            self.send_json({"error": f"Bad request: {e}"}); return
        try:
            self._handle_post(body)
        except Exception as e:
            import traceback
            print("[ERROR]", traceback.format_exc())
            try: self.send_json({"error": str(e)})
            except: pass

    def _handle_post(self, body):

        # ---- Reset session ----
        if self.path == "/api/reset":
            sid = body.get("sid", "")
            if sid in sessions: del sessions[sid]
            if sid in interview_sessions: del interview_sessions[sid]
            self.send_json({"ok": True})

        # ---- Chat advisor ----
        elif self.path == "/api/chat":
            sid  = body.get("sid", "")
            msg  = body.get("message", "").strip()
            sess = get_session(sid)
            sess["messages"].append({"role": "user", "content": msg})
            try:
                reply, used = call_llm(sess["messages"], CHAT_SYSTEM)
            except RuntimeError as e:
                self.send_json({"error": str(e)}); return
            sess["messages"].append({"role": "assistant", "content": reply})
            self.send_json({
                "text":    clean_text(reply),
                "backend": used,
                "result":  parse_rec(reply),
            })

        # ---- CV scan submit ----
        elif self.path == "/api/scan_cv":
            cv_type = body.get("type", "text")
            data    = body.get("data", "")
            cv_text = extract_pdf_text(base64.b64decode(data)) if cv_type == "pdf" else data
            if not cv_text.strip():
                self.send_json({"error": "Could not extract text from file."}); return
            job_id = str(uuid.uuid4())
            jobs[job_id] = {"status": "pending", "result": None}
            def run(jid, txt):
                try:
                    raw, used = call_llm(
                        [{"role": "user", "content": f"Student CV:\n\n{txt[:3000]}"}],
                        CV_SYSTEM
                    )
                    result = parse_json(raw)
                    if result is None:
                        jobs[jid] = {"status": "error", "result": {"error": "Could not parse AI response. Raw: " + raw[:200]}}
                    else:
                        result["backend"] = used
                        jobs[jid] = {"status": "done", "result": result}
                except Exception as e:
                    jobs[jid] = {"status": "error", "result": {"error": str(e)}}
            threading.Thread(target=run, args=(job_id, cv_text), daemon=True).start()
            self.send_json({"job_id": job_id})

        # ---- CV result poll ----
        elif self.path == "/api/cv_result":
            job_id = body.get("job_id", "")
            if job_id not in jobs:
                self.send_json({"status": "error", "result": {"error": "Job not found"}}); return
            self.send_json({"status": jobs[job_id]["status"], "result": jobs[job_id]["result"]})

        # ---- Mock interview ----
        elif self.path == "/api/interview":
            sid    = body.get("sid", "")
            msg    = body.get("message", "").strip()
            club   = body.get("club", "")
            action = body.get("action", "chat")

            if action == "start":
                club_name = {
                    "ml_ai": "ML and AI Club", "java_oop": "Java OOP Club",
                    "camera": "Camera Club",   "hr": "HR Club",
                    "pr": "PR Club",           "organizer": "Organizer Club",
                }.get(club, club)
                focus  = CLUB_FOCUS.get(club, club_name)
                system = INTERVIEW_SYSTEM_TEMPLATE.format(
                    club_name=club_name, club_focus=focus
                )
                interview_sessions[sid] = {"messages": [], "system": system, "club": club_name}
                try:
                    reply, used = call_llm(
                        [{"role": "user", "content": "Hello, I am ready for my interview."}],
                        system
                    )
                    interview_sessions[sid]["messages"] = [
                        {"role": "user",      "content": "Hello, I am ready for my interview."},
                        {"role": "assistant", "content": reply},
                    ]
                    self.send_json({
                        "text":    clean_text(reply),
                        "backend": used,
                        "result":  parse_interview(reply),
                    })
                except RuntimeError as e:
                    self.send_json({"error": str(e)})

            else:  # chat turn
                if sid not in interview_sessions:
                    self.send_json({"error": "Interview session not found. Please select a club first."}); return
                sess = interview_sessions[sid]
                sess["messages"].append({"role": "user", "content": msg})
                try:
                    reply, used = call_llm(sess["messages"], sess["system"])
                except RuntimeError as e:
                    self.send_json({"error": str(e)}); return
                sess["messages"].append({"role": "assistant", "content": reply})
                self.send_json({
                    "text":    clean_text(reply),
                    "backend": used,
                    "result":  parse_interview(reply),
                })

        else:
            self.send_response(404); self.end_headers()

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    setup_backend()
    print()
    print(f"  Backend : {Backend.name}")
    print(f"  Server  : http://localhost:{PORT}")
    print("  Opening browser...")
    print("  Press Ctrl+C to stop.")
    print("=" * 56)

    server = http.server.ThreadingHTTPServer(("", PORT), Handler)
    def open_b():
        import time; time.sleep(0.8)
        webbrowser.open(f"http://localhost:{PORT}")
    threading.Thread(target=open_b,daemon=True).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Stopped. Goodbye.")

if __name__ == "__main__":
    main()
