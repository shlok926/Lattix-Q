import httpx
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from app.config import settings

router = APIRouter(prefix="/analyst", tags=["AI Analyst"])
ANALYST_SVC = getattr(settings, 'ANALYST_SVC_URL', 'http://ai-analyst-service:8006')

@router.post("/new-session")
async def new_session():
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(f"{ANALYST_SVC}/analyst/new-session")
        return resp.json()

@router.post("/stream")
async def stream_proxy(request: Request):
    body = await request.body()
    async def stream_from_upstream():
        async with httpx.AsyncClient(timeout=180) as client:
            async with client.stream(
                "POST", f"{ANALYST_SVC}/analyst/stream",
                content=body, headers={"Content-Type": "application/json"},
            ) as upstream:
                async for chunk in upstream.aiter_bytes():
                    yield chunk
    return StreamingResponse(
        stream_from_upstream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"},
    )

@router.delete("/session/{session_id}")
async def clear_session(session_id: str):
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.delete(f"{ANALYST_SVC}/analyst/session/{session_id}")
        return resp.json()