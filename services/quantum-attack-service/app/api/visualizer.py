import asyncio
import random
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from datetime import datetime

router = APIRouter(prefix="/visualizer", tags=["Visualizer"])

# Mock locations for attacks
LOCATIONS = [
    {"city": "San Francisco", "lat": 37.7749, "lng": -122.4194},
    {"city": "London", "lat": 51.5074, "lng": -0.1278},
    {"city": "Tokyo", "lat": 35.6762, "lng": 139.6503},
    {"city": "Frankfurt", "lat": 50.1109, "lng": 8.6821},
    {"city": "Sydney", "lat": -33.8688, "lng": 151.2093},
    {"city": "Mumbai", "lat": 19.0760, "lng": 72.8777},
    {"city": "Sao Paulo", "lat": -23.5505, "lng": -46.6333},
]

ATTACK_TYPES = [
    "Shor's Algorithm Attempt",
    "Grover's Search Bruteforce",
    "Quantum Man-in-the-Middle",
    "PQC Downgrade Attack",
    "Lattice-based Signature Forgery",
]

TARGETS = ["RSA-2048", "ECC-256", "TLS 1.2 Handshake", "Blockchain Wallet", "VPN Gateway"]

@router.websocket("/ws")
async def websocket_visualizer(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Generate a random attack event
            source = random.choice(LOCATIONS)
            target = random.choice(LOCATIONS)
            while target == source:
                target = random.choice(LOCATIONS)
                
            event = {
                "id": f"evt_{random.randint(1000, 9999)}",
                "timestamp": datetime.utcnow().isoformat(),
                "type": random.choice(ATTACK_TYPES),
                "target": random.choice(TARGETS),
                "severity": random.choice(["Critical", "High", "Medium"]),
                "source": source,
                "destination": target,
                "threat_level": random.randint(40, 95)
            }
            
            await websocket.send_text(json.dumps(event))
            # Wait for some time before next attack
            await asyncio.sleep(random.uniform(2.0, 5.0))
            
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WS Error: {e}")
