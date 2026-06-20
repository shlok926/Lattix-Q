from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.core.scanner import CodeScanner
from app.core.planner import MigrationPlanner
from app.core.refactorer import CodeRefactorer
from app.core.threat_intel import ThreatIntelligence
import asyncio

router = APIRouter()
scanner = CodeScanner()
planner = MigrationPlanner()
refactorer = CodeRefactorer()
threat_intel = ThreatIntelligence()

class ScanRequest(BaseModel):
    filename: str
    content: str

class RoadmapRequest(BaseModel):
    findings: List[dict]

class RefactorRequest(BaseModel):
    code: str
    findings: List[dict]

class BatchScanRequest(BaseModel):
    files: List[ScanRequest]

@router.post("/scan")
async def scan_codebase(request: ScanRequest):
    findings = scanner.scan_code(request.content)
    return {
        "filename": request.filename,
        "findings": findings,
        "score": max(0, 100 - len(findings) * 10)
    }

@router.post("/batch-scan")
async def batch_scan_codebase(request: BatchScanRequest):
    results = []
    total_findings = 0
    
    for f in request.files:
        findings = scanner.scan_code(f.content)
        results.append({
            "filename": f.filename,
            "findings": findings,
            "score": max(0, 100 - len(findings) * 10)
        })
        total_findings += len(findings)

    return {
        "summary": {
            "total_files": len(request.files),
            "total_vulnerabilities": total_findings,
            "average_readiness": sum(r["score"] for r in results) / len(results) if results else 100
        },
        "results": results
    }

@router.post("/roadmap")
async def generate_roadmap(request: RoadmapRequest):
    return planner.generate_roadmap(request.findings)

@router.post("/refactor")
async def refactor_code(request: RefactorRequest):
    return refactorer.refactor_code(request.code, request.findings)

@router.get("/threat-feed")
async def get_threat_feed():
    return [threat_intel.generate_event() for _ in range(15)]
