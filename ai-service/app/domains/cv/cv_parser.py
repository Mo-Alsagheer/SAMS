import re
import json
import io

def extract_pdf_text(data: bytes) -> str:
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(data))
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text.strip() if text.strip() else "[Could not extract text from PDF]"
    except Exception as e:
        return f"[Error extracting PDF text: {str(e)}]"

def extract_docx_text(data: bytes) -> str:
    try:
        from docx import Document
        doc = Document(io.BytesIO(data))
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text.strip() if text.strip() else "[Could not extract text from DOCX]"
    except Exception as e:
        return f"[Error extracting DOCX text: {str(e)}]"

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
        file_bytes = response.read()
        
    if file_bytes.startswith(b'%PDF'):
        return extract_pdf_text(file_bytes)
    elif file_bytes.startswith(b'PK\x03\x04'):
        return extract_docx_text(file_bytes)
    else:
        try:
            decoded_text = file_bytes.decode('utf-8')
            if "<html" in decoded_text.lower() and "sign in" in decoded_text.lower():
                return "[Error: Google Drive link is private or requires sign-in. Please ensure the link is set to 'Anyone with the link can view'.]"
            return decoded_text
        except:
            return "[Unsupported file format or unreadable text]"
