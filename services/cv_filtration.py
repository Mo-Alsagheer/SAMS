from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import re
import json
import base64
from llm_config import call_llm

router = APIRouter()

CV_SYSTEM = """\
You are a Student Club Advisor. Analyze the CV and score each club.
Clubs: ml_ai(ML/Python), java_oop(Java/OOP), camera(photography), hr(HR/people), pr(PR/marketing), organizer(events).
Reply ONLY with valid JSON, no markdown:
{"scores":{"ml_ai":0,"java_oop":0,"camera":0,"hr":0,"pr":0,"organizer":0},"top_club":"<id>","second_club":"<id>","profile_summary":"<2 sentences>","key_strengths":["<s1>","<s2>","<s3>"]}
"""

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

def parse_json(raw):
    raw = re.sub(r'<think>.*?</think>', '', raw, flags=re.DOTALL).strip()
    c = raw.replace("```json","").replace("```","").strip()
    try: return json.loads(c)
    except:
        s = c.find("{"); e = c.rfind("}")+1
        if s != -1 and e > s:
            try: return json.loads(c[s:e])
            except: pass
    return None

def extract_gdrive_text(gdrive_url: str) -> str:
    match = re.search(r"/d/([a-zA-Z0-9_-]+)", gdrive_url)
    if not match: match = re.search(r"id=([a-zA-Z0-9_-]+)", gdrive_url)
    file_id = match.group(1) if match else gdrive_url
    
    url = f"https://drive.google.com/uc?export=download&id={file_id}"
    import urllib.request
    req_gdrive = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req_gdrive) as response:
        pdf_bytes = response.read()
    return extract_pdf_text(pdf_bytes)

import asyncio

class CVItem(BaseModel):
    id: str
    type: str = "text"
    data: Optional[str] = None
    link: Optional[str] = None

class CVRequest(BaseModel):
    type: str = "text" # "text", "pdf", or "gdrive"
    data: Optional[str] = None
    link: Optional[str] = None

class BatchCVRequest(BaseModel):
    cvs: list[CVItem]

def process_single_cv_sync(req: CVItem) -> dict:
    if req.link:
        try:
            cv_text = extract_gdrive_text(req.link)
        except Exception as e:
            return {"id": req.id, "error": f"Failed to fetch from Google Drive link. Ensure it is public. Error: {str(e)}"}
    elif req.type == "pdf" and req.data:
        cv_text = extract_pdf_text(base64.b64decode(req.data))
    elif req.type == "gdrive" and req.data:
        try:
            cv_text = extract_gdrive_text(req.data)
        except Exception as e:
            return {"id": req.id, "error": f"Failed to fetch from Google Drive. Ensure the link is public (Anyone with the link can view). Error: {str(e)}"}
    elif req.data:
        cv_text = req.data
    else:
        return {"id": req.id, "error": "No data or link provided."}

    if not cv_text.strip():
        return {"id": req.id, "error": "Could not extract text from file."}
    
    try:
        raw, used = call_llm(
            [{"role": "user", "content": f"Student CV:\n\n{cv_text[:3000]}"}],
            CV_SYSTEM
        )
        result = parse_json(raw)
        if result is None:
            return {"id": req.id, "error": "Could not parse AI response. Raw: " + raw[:200]}
        result["backend"] = used
        result["id"] = req.id
        return result
    except Exception as e:
        return {"id": req.id, "error": str(e)}

@router.post("/evaluate")
async def evaluate_cv(req: CVRequest):
    item = CVItem(id="single", type=req.type, data=req.data, link=req.link)
    res = await asyncio.to_thread(process_single_cv_sync, item)
    res.pop("id", None)
    return res

@router.post("/evaluate/batch")
async def evaluate_cv_batch(req: BatchCVRequest):
    tasks = [asyncio.to_thread(process_single_cv_sync, cv) for cv in req.cvs]
    results = await asyncio.gather(*tasks)
    return {"results": results}
