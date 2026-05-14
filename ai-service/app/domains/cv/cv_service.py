import base64
import json
import os
import logging
from app.providers.llm import call_llm
from app.domains.cv.cv_schema import CVItem
from app.domains.cv.cv_parser import extract_gdrive_text, extract_pdf_text, parse_json
from app.domains.cv.cv_prompt import CV_SYSTEM_TEMPLATE

logger = logging.getLogger(__name__)

# Load committee requirements globally
REQ_FILE_PATH = os.path.join(os.path.dirname(__file__), '../../core/committee_requirements.json')
try:
    with open(REQ_FILE_PATH, 'r', encoding='utf-8') as f:
        COMMITTEE_REQS = json.load(f)
except Exception as e:
    print(f"Warning: Could not load committee_requirements.json: {e}")
    COMMITTEE_REQS = None

def process_single_cv_sync(req: CVItem) -> dict:
    if req.link:
        try:
            cv_text = extract_gdrive_text(req.link)
        except Exception as e:
            logger.error(f"Failed to fetch CV from Google Drive link for ID {req.id}: {str(e)}")
            return {"id": req.id, "error": f"Failed to fetch from Google Drive link. Ensure it is public. Error: {str(e)}"}
    elif req.type == "pdf" and req.data:
        cv_text = extract_pdf_text(base64.b64decode(req.data))
    elif req.type == "gdrive" and req.data:
        try:
            cv_text = extract_gdrive_text(req.data)
        except Exception as e:
            logger.error(f"Failed to fetch CV from Google Drive data for ID {req.id}: {str(e)}")
            return {"id": req.id, "error": f"Failed to fetch from Google Drive. Ensure the link is public (Anyone with the link can view). Error: {str(e)}"}
    elif req.data:
        cv_text = req.data
    else:
        logger.warning(f"No data or link provided for CV ID {req.id}.")
        return {"id": req.id, "error": "No data or link provided."}

    if not cv_text.strip():
        logger.error(f"Could not extract text from CV file for ID {req.id}. Text is empty.")
        return {"id": req.id, "error": "Could not extract text from file."}
    
    logger.info(f"Successfully read CV for ID: {req.id}. Extracted {len(cv_text)} characters.")
    
    try:
        prompt = None
        # Try to match the committee to the requirements JSON
        if COMMITTEE_REQS and req.committee_name:
            c_name = req.committee_name.lower().strip()
            for k, v in COMMITTEE_REQS.get("committees", {}).items():
                if v.get("name", "").lower() == c_name or k.lower() == c_name:
                    eval_criteria = json.dumps(v.get("evaluation_criteria", {}), indent=2)
                    disqualifiers = json.dumps(v.get("disqualifiers", []), indent=2)
                    ptemplate = COMMITTEE_REQS.get("scoring_instructions", {}).get("prompt_template", "")
                    if ptemplate:
                        prompt = ptemplate.format(
                            committee_name=v.get("name", req.committee_name),
                            evaluation_criteria=eval_criteria,
                            disqualifiers=disqualifiers
                        )
                        prompt += "\n\nReply ONLY with valid JSON. Do not include markdown blocks."
                    break
        
        # Fallback to the generic template if no match or missing JSON
        if not prompt:
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
