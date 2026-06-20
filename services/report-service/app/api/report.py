from fastapi import APIRouter
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.core.generator import ReportGenerator
from app.core.pdf_export import generate_pdf_report

router = APIRouter(prefix="/report", tags=["Report"])
generator = ReportGenerator()


class AIEnrichment(BaseModel):
    readiness_score: int = 100
    findings: List[Dict[str, Any]] = []
    roadmap: Dict[str, Any] = {}


class ReportRequest(BaseModel):
    system_info: Dict[str, Any]
    sim_data: List[Dict[str, Any]] = []
    bench_data: List[Dict[str, Any]] = []
    ai_enrichment: Optional[AIEnrichment] = None


@router.post("/generate/json")
def generate_json(req: ReportRequest):
    ai = req.ai_enrichment.model_dump() if req.ai_enrichment else {}
    return generator.generate_comprehensive_report(
        req.system_info, req.sim_data, req.bench_data, ai
    )


@router.post("/generate/pdf")
def generate_pdf(req: ReportRequest):
    ai = req.ai_enrichment.model_dump() if req.ai_enrichment else {}
    report_dict = generator.generate_comprehensive_report(
        req.system_info, req.sim_data, req.bench_data, ai
    )
    pdf_bytes = generate_pdf_report(report_dict)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=QuantumShield_Audit_Report.pdf"}
    )
