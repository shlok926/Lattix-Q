import random
from datetime import datetime

class ThreatIntelligence:
    EVENTS = [
        "State-sponsored actor attempting Shor's algorithm on RSA-2048 backbone.",
        "Quantum computing power spike detected in Eastern Europe cluster.",
        "NIST announced emergency deprecation of legacy ECC curves.",
        "Banking sector reports increased entropy in classical handshakes.",
        "Quantum-resistant tunnel established for critical infrastructure.",
        "New Grover's algorithm variant reduces AES-128 security by 50%.",
        "Harvest-Now-Decrypt-Later (HNDL) activity detected on satellite links."
    ]

    SEVERITIES = ["Low", "Medium", "High", "Critical"]

    def generate_event(self):
        return {
            "timestamp": datetime.now().isoformat(),
            "event": random.choice(self.EVENTS),
            "severity": random.choice(self.SEVERITIES),
            "impact_radius": random.randint(10, 1000),
            "location": random.choice(["Global", "USA", "EU", "APAC", "Cloud Nodes"])
        }
