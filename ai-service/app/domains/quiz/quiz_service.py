import re
import json

sessions = {}

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
