from pydantic import BaseModel
from typing import Optional

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
