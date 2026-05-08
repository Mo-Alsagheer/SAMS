import base64
from app.providers.llm import call_llm
from app.domains.cv.cv_schema import CVItem
from app.domains.cv.cv_parser import extract_gdrive_text, extract_pdf_text, parse_json
from app.domains.cv.cv_prompt import CV_SYSTEM_TEMPLATE


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
        prompt = CV_SYSTEM_TEMPLATE.format(
            committee_name=req.committee_name,
            committee_focus=req.committee_focus
        )
        raw, used = call_llm(
            [{"role": "user", "content": f"Student CV:\n\n{cv_text[:3000]}"}],
            prompt
        )
        result = parse_json(raw)
        if result is None:
            return {"id": req.id, "error": "Could not parse AI response. Raw: " + raw[:200]}
        result["backend"] = used
        result["id"] = req.id
        return result
    except Exception as e:
        return {"id": req.id, "error": str(e)}
