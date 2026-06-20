from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"

class ChatMessage(BaseModel):
    role: MessageRole
    content: str

class ChatRequest(BaseModel):
    session_id: str = Field(..., description="Session UUID from /new-session")
    message: str = Field(..., min_length=1, max_length=2000)
    include_simulation_context: bool = True
    include_report_context: bool = True

class ChatResponse(BaseModel):
    session_id: str
    intent: str
    risk_level: str
    confidence: str
    affects_algorithms: List[str]
    next_steps: List[str]
    content: str
    input_tokens: int
    output_tokens: int

class StreamStartEvent(BaseModel):
    type: str = "start"
    session_id: str
    intent: str

class StreamDoneEvent(BaseModel):
    type: str = "done"
    risk_level: str = "UNKNOWN"
    confidence: str = "MEDIUM"
    affects_algorithms: List[str] = []
    next_steps: List[str] = []
