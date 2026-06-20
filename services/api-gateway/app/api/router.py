from fastapi import APIRouter
from app.api.v1 import simulation, classical, pqc, benchmark, report, ai, auth, analyst

v1_router = APIRouter(prefix="/v1")

v1_router.include_router(simulation.router)
v1_router.include_router(classical.router)
v1_router.include_router(pqc.router)
v1_router.include_router(benchmark.router)
v1_router.include_router(report.router)
v1_router.include_router(ai.router)
v1_router.include_router(auth.router)
v1_router.include_router(analyst.router)
