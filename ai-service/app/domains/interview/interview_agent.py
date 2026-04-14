import re
import json

interview_sessions = {}

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
