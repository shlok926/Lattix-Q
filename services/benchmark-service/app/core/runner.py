import asyncio
import os
import json
import redis.asyncio as redis
from dataclasses import asdict
from .models import AlgoBenchmark

class BenchmarkRunner:
    def __init__(self):
        self.redis = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/2"))

    async def run_full_suite(self):
        from app.benchmarks.rsa_bench import run_rsa_benchmark
        from app.benchmarks.ecc_bench import run_ecc_benchmark
        from app.benchmarks.aes_bench import run_aes_benchmark
        from app.benchmarks.kyber_bench import run_kyber_benchmark
        from app.benchmarks.dilithium_bench import run_dilithium_benchmark
        from app.benchmarks.falcon_bench import run_falcon_benchmark
        from app.benchmarks.sphincs_bench import run_sphincs_benchmark
        
        loop = asyncio.get_running_loop()
        
        tasks = [
            loop.run_in_executor(None, run_rsa_benchmark, 2048, 50),
            loop.run_in_executor(None, run_ecc_benchmark, 256, 50),
            loop.run_in_executor(None, run_aes_benchmark, 256, 100),
            loop.run_in_executor(None, run_kyber_benchmark, 768, 50),
            loop.run_in_executor(None, run_dilithium_benchmark, 3, 50),
            loop.run_in_executor(None, run_falcon_benchmark, 512, 50),
            loop.run_in_executor(None, run_sphincs_benchmark, "sha2_128f", 10),
        ]
        
        results = await asyncio.gather(*tasks)
        
        results_dicts = [asdict(r) for r in results]
        await self.redis.setex("bench:latest", 900, json.dumps(results_dicts))
        
        return results_dicts
