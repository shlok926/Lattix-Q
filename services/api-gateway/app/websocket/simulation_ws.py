from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import httpx
import asyncio
from app.config import settings

ws_router = APIRouter()

@ws_router.websocket("/ws/simulation/{job_id}")
async def simulation_websocket(websocket: WebSocket, job_id: str):
    await websocket.accept()
    try:
        async with httpx.AsyncClient() as client:
            while True:
                resp = await client.get(f"{settings.QUANTUM_ATTACK_SERVICE_URL}/simulate/status/{job_id}")
                if resp.status_code == 200:
                    data = resp.json()
                    await websocket.send_json(data)
                    if data.get("status") in ["COMPLETED", "FAILED"]:
                        break
                await asyncio.sleep(2)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_json({"error": str(e)})
    finally:
        await websocket.close()
