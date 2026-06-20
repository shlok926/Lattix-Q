from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import websockets
import asyncio
import json
from app.config import settings

router = APIRouter()

@router.websocket("/ws/visualizer")
async def visualizer_proxy_websocket(websocket: WebSocket):
    await websocket.accept()
    
    # Connect to the upstream Attack Service WebSocket
    # Replace http:// with ws://
    upstream_url = settings.QUANTUM_ATTACK_SERVICE_URL.replace("http://", "ws://")
    upstream_url = f"{upstream_url}/visualizer/ws"
    
    try:
        async with websockets.connect(upstream_url) as upstream_ws:
            while True:
                # Receive from upstream
                data = await upstream_ws.recv()
                # Send to client
                await websocket.send_text(data)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"Gateway WS Error: {e}")
    finally:
        await websocket.close()
