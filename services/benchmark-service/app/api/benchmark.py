import os
import json
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import PlainTextResponse
from app.core.runner import BenchmarkRunner
from app.core.exporter import to_csv

router = APIRouter(prefix="/benchmark", tags=["Benchmark"])
runner = BenchmarkRunner()

@router.post("/run")
async def trigger_benchmark(background_tasks: BackgroundTasks):
    background_tasks.add_task(runner.run_full_suite)
    return {"status": "Benchmark started in background"}

@router.get("/results")
async def get_results():
    data = await runner.redis.get("bench:latest")
    if not data:
        raise HTTPException(status_code=404, detail="No benchmark results available. Run suite first.")
    return json.loads(data)

@router.get("/export")
async def export_results(format: str = "json"):
    data = await runner.redis.get("bench:latest")
    if not data:
        raise HTTPException(status_code=404, detail="No benchmark results available.")
    
    results = json.loads(data)
    
    if format == "csv":
        csv_str = to_csv(results)
        return PlainTextResponse(content=csv_str, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=benchmark.csv"})
    
    return {"data": results}
