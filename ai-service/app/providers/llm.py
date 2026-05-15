import os, json, urllib.request, urllib.error
import logging
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

if os.path.exists('.env'):
    with open('.env', 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, val = line.split('=', 1)
                os.environ[key.strip()] = val.strip().strip('"\'')

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

MLVOCA_URL   = os.environ.get("MLVOCA_URL", "https://mlvoca.com/api/generate")
MLVOCA_MODEL = os.environ.get("MLVOCA_MODEL", "deepseek-r1:1.5b")

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
GITHUB_URL   = os.environ.get("GITHUB_URL", "https://models.inference.ai.azure.com/chat/completions")
GITHUB_MODEL = os.environ.get("GITHUB_MODEL", "gpt-4o-mini")

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_URL     = os.environ.get("GROQ_URL", "https://api.groq.com/openai/v1/chat/completions")
GROQ_MODELS  = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "llama3-8b-8192",
]

class Backend:
    name:  str = ""
    kind:  str = ""
    model: str = ""

def _post(url, payload, headers, timeout=30):
    req = urllib.request.Request(
        url, data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0", **headers},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())

def _call_gemini(messages, system):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    contents = []
    for m in messages:
        role = "user" if m["role"] == "user" else "model"
        contents.append({
            "role": role,
            "parts": [{"text": m["content"]}]
        })
    
    payload = {"contents": contents}
    if system:
        payload["systemInstruction"] = {"parts": [{"text": system}]}
        
    body = _post(url, payload, {}, timeout=30)
    try:
        return body["candidates"][0]["content"]["parts"][0]["text"]
    except KeyError:
        raise RuntimeError(f"Unexpected response from Gemini: {body}")

def _call_mlvoca(messages, system):
    prompt = "\n".join([f"{m['role']}: {m['content']}" for m in messages])
    body = _post(MLVOCA_URL,
                 {"model": MLVOCA_MODEL, "prompt": prompt, "system": system, "stream": False},
                 {}, timeout=60)
    return body.get("response", "")

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

def setup_backend():
    logger.info("Setting up LLM backend...")
    
    if GEMINI_API_KEY:
        try:
            _call_gemini([{"role": "user", "content": "hi"}], "Reply: ok")
            Backend.kind  = "gemini"
            Backend.model = GEMINI_MODEL
            Backend.name  = f"Gemini / {GEMINI_MODEL}"
            print(f"========== [LLM BACKEND INITIALIZED] Using {Backend.name} ==========")
            return True
        except Exception as e:
            logger.warning(f"gemini backend failed during setup: {e}")

    try:
        _call_mlvoca([{"role": "user", "content": "hi"}], "Reply: ok")
        Backend.kind  = "mlvoca"
        Backend.model = MLVOCA_MODEL
        Backend.name  = f"mlvoca / {MLVOCA_MODEL} (free)"
        print(f"========== [LLM BACKEND INITIALIZED] Using {Backend.name} ==========")
        return True
    except Exception as e:
        logger.warning(f"mlvoca backend failed during setup: {e}")

    if GITHUB_TOKEN:
        try:
            _call_github([{"role": "user", "content": "hi"}], "Reply: ok")
            Backend.kind  = "github"
            Backend.model = GITHUB_MODEL
            Backend.name  = f"GitHub Models / {GITHUB_MODEL} (free)"
            print(f"========== [LLM BACKEND INITIALIZED] Using {Backend.name} ==========")
            return True
        except Exception as e:
            logger.warning(f"github backend failed during setup: {e}")

    if GROQ_API_KEY:
        for model in GROQ_MODELS:
            try:
                _call_groq([{"role": "user", "content": "hi"}], "Reply: ok", model)
                Backend.kind  = "groq"
                Backend.model = model
                Backend.name  = f"Groq / {model} (free)"
                print(f"========== [LLM BACKEND INITIALIZED] Using {Backend.name} ==========")
                return True
            except Exception as e:
                logger.warning(f"groq model {model} failed during setup: {e}")

    print("========== [LLM BACKEND FAILURE] No working backend found! ==========")
    return False

def call_llm(messages, system) -> Tuple[str, str]:
    if not Backend.kind:
        setup_backend()
    
    print(f"[LLM Provider] Handling request using model: {Backend.name}")
    try:
        if Backend.kind == "gemini":
            return _call_gemini(messages, system), Backend.name
        elif Backend.kind == "mlvoca":
            return _call_mlvoca(messages, system), Backend.name
        elif Backend.kind == "github":
            return _call_github(messages, system), Backend.name
        elif Backend.kind == "groq":
            return _call_groq(messages, system, Backend.model), Backend.name
    except Exception as e:
        raise RuntimeError(str(e))
    raise RuntimeError("No working backend found.")
