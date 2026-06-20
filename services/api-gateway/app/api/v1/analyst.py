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
    client = httpx.AsyncClient(timeout=180)
    
    try:
        req = client.build_request(
            "POST", f"{ANALYST_SVC}/analyst/stream",
            content=body, headers={"Content-Type": "application/json"}
        )
        resp = await client.send(req, stream=True)
        
        if resp.status_code != 200:
            content = await resp.aread()
            await client.aclose()
            detail = "Upstream service error"
            try:
                import json
                err_json = json.loads(content)
                if isinstance(err_json, dict) and "detail" in err_json:
                    detail = err_json["detail"]
            except Exception:
                pass
            from fastapi import HTTPException
            raise HTTPException(status_code=resp.status_code, detail=detail)
            
        async def stream_generator():
            try:
                async for chunk in resp.aiter_bytes():
                    yield chunk
            finally:
                await resp.aclose()
                await client.aclose()
                
        return StreamingResponse(
            stream_generator(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"},
        )
    except Exception as e:
        await client.aclose()
        if isinstance(e, HTTPException):
            raise e
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/session/{session_id}")
async def clear_session(session_id: str):
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.delete(f"{ANALYST_SVC}/analyst/session/{session_id}")
        return resp.json()