import re
from dataclasses import dataclass, field
from typing import List

@dataclass
class NextStep:
    text: str

@dataclass
class ParsedAnalystResponse:
    risk_level: str = "UNKNOWN"
    confidence: str = "MEDIUM"
    affects_algorithms: List[str] = field(default_factory=list)
    next_steps: List[NextStep] = field(default_factory=list)
    markdown_content: str = ""
    raw_response: str = ""
    input_tokens: int = 0
    output_tokens: int = 0
    parse_successful: bool = True

class ResponseParser:
    VALID_RISK_LEVELS = {"CRITICAL", "HIGH", "MEDIUM", "LOW", "SAFE", "UNKNOWN"}
    VALID_CONFIDENCE = {"HIGH", "MEDIUM", "LOW"}

    def parse(self, raw_response: str) -> ParsedAnalystResponse:
        result = ParsedAnalystResponse(raw_response=raw_response)
        result.risk_level = self._extract_tag(raw_response, "risk_level", "UNKNOWN").upper()
        if result.risk_level not in self.VALID_RISK_LEVELS:
            result.risk_level = "UNKNOWN"
        result.confidence = self._extract_tag(raw_response, "confidence", "MEDIUM").upper()
        if result.confidence not in self.VALID_CONFIDENCE:
            result.confidence = "MEDIUM"
        algos_raw = self._extract_tag(raw_response, "affects_algorithms", "")
        result.affects_algorithms = [
            a.strip() for a in algos_raw.split(",") if a.strip() and a.strip() != "NONE"
        ]
        result.next_steps = self._extract_steps(raw_response)
        result.markdown_content = self._strip_xml_tags(raw_response).strip()
        return result

    def _extract_tag(self, text: str, tag: str, default: str) -> str:
        pattern = rf"<{tag}>(.*?)</{tag}>"
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        return match.group(1).strip() if match else default

    def _extract_steps(self, text: str) -> List[NextStep]:
        steps_block = re.search(r"<next_steps>(.*?)</next_steps>", text, re.DOTALL | re.IGNORECASE)
        if not steps_block:
            return []
        step_matches = re.findall(r"<step>(.*?)</step>", steps_block.group(1), re.DOTALL)
        return [NextStep(text=s.strip()) for s in step_matches if s.strip()]

    def _strip_xml_tags(self, text: str) -> str:
        text = re.sub(r"<next_steps>.*?</next_steps>", "", text, flags=re.DOTALL)
        text = re.sub(
            r"<(risk_level|confidence|affects_algorithms)>.*?</(risk_level|confidence|affects_algorithms)>",
            "", text, flags=re.IGNORECASE | re.DOTALL,
        )
        return re.sub(r"\n{3,}", "\n\n", text)
