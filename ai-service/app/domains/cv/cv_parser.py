import re
import json

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
