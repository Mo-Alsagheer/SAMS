import asyncio
from fastapi import APIRouter
from app.domains.cv.cv_schema import CVRequest, CVItem, BatchCVRequest
from app.domains.cv.cv_service import process_single_cv_sync

router = APIRouter()

@router.post("/evaluate")
async def evaluate_cv(req: CVRequest):
    item = CVItem(
        id="single", 
        type=req.type, 
        data=req.data, 
        link=req.link,
        committee_name=req.committee_name,
        committee_focus=req.committee_focus
    )
    res = await asyncio.to_thread(process_single_cv_sync, item)
    res.pop("id", None)
    return res

@router.post("/evaluate/batch")
async def evaluate_cv_batch(req: BatchCVRequest):
    results = []
    for cv in req.cvs:
        res = await asyncio.to_thread(process_single_cv_sync, cv)
        results.append(res)
        # Add a 2-second delay between requests to respect free-tier API rate limits (30 RPM)
        await asyncio.sleep(2)
    return {"results": results}
