from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.cv import router as cv_router
from app.api.routes.interview import router as interview_router
from app.providers.llm import setup_backend

app = FastAPI(title="SAMS AI Services")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cv_router)
app.include_router(interview_router)

@app.on_event("startup")
async def startup_event():
    setup_backend()

@app.get("/health")
async def health():
    return {"ok": True, "service": "ats", "version": "0.1"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
