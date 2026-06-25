import os
import json
from celery import Celery
import redis
from app.core.shors.algorithm import ShorsAlgorithm
from app.core.grovers.algorithm import GroversAlgorithm
from dataclasses import asdict

redis_url = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/1")
celery_app = Celery("simulation_tasks", broker=redis_url, backend=redis_url)

r = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/1"))

@celery_app.task(name="run_shors_simulation", bind=True)
def run_shors_simulation(self, key_size: int, include_noise: bool, shots: int, ibm_token: str = None):
    job_id = self.request.id
    try:
        r.setex(f"sim:job:{job_id}", 3600, json.dumps({"status": "RUNNING"}))
        algo = ShorsAlgorithm(key_size, include_noise, shots, ibm_token)
        result = algo.run()
        data = {
            "status": "COMPLETED",
            "result": asdict(result)
        }
        r.setex(f"sim:job:{job_id}", 3600, json.dumps(data))
    except Exception as e:
        r.setex(f"sim:job:{job_id}", 3600, json.dumps({"status": "FAILED", "error": str(e)}))

@celery_app.task(name="run_grovers_simulation", bind=True)
def run_grovers_simulation(self, key_size: int, include_noise: bool, ibm_token: str = None):
    job_id = self.request.id
    try:
        r.setex(f"sim:job:{job_id}", 3600, json.dumps({"status": "RUNNING"}))
        algo = GroversAlgorithm(key_size, include_noise, ibm_token)
        result = algo.run()
        data = {
            "status": "COMPLETED",
            "result": asdict(result)
        }
        r.setex(f"sim:job:{job_id}", 3600, json.dumps(data))
    except Exception as e:
        r.setex(f"sim:job:{job_id}", 3600, json.dumps({"status": "FAILED", "error": str(e)}))
