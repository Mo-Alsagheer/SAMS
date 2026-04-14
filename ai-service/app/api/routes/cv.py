import asyncio
from fastapi import APIRouter
from app.domains.cv.cv_schema import CVRequest, CVItem, BatchCVRequest
from app.domains.cv.cv_service import process_single_cv_sync

router = APIRouter()

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
