import structlog
import json
from datetime import datetime
from typing import Any, Dict

logger = structlog.get_logger("security")

def log_security_event(event_type: str, status: str, details: Dict[str, Any], request=None):
    """
    Log security events in a structured JSON format for Layer 9 compliance.
    """
    event = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": event_type,
        "status": status,
        "details": details,
    }
    
    if request:
        event["client_ip"] = request.client.host
        event["user_agent"] = request.headers.get("User-Agent")
        event["path"] = request.url.path
        
    logger.info("security_event", **event)
