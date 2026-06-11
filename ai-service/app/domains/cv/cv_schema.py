from pydantic import BaseModel
from typing import Optional, Union

class CVItem(BaseModel):
    id: Union[str, int]
    type: str = "text"
    data: Optional[str] = None
    link: Optional[str] = None
    committee_name: str = "General"
    committee_focus: str = "General community operations"

class CVRequest(BaseModel):
    type: str = "text" # "text", "pdf", or "gdrive"
    data: Optional[str] = None
    link: Optional[str] = None
    committee_name: str = "General"
    committee_focus: str = "General community operations"

class BatchCVRequest(BaseModel):
    cvs: list[CVItem]
