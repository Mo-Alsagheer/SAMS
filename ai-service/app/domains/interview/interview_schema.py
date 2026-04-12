from pydantic import BaseModel

class InterviewRequest(BaseModel):
    sid: str
    club: str = ""
    action: str = "chat"
    message: str = ""
