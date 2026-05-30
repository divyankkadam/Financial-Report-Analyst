# backend/nodes/crag_node.py

from backend.services.llm_service import get_llm
import logging
import json
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from backend.app.config import settings
from backend.pipeline.state import GraphState

logger = logging.getLogger(__name__)

RELEVANCE_PROMPT = ChatPromptTemplate.from_template("""
You are a strict financial document relevance judge.

Given the USER QUESTION and a DOCUMENT CHUNK from a financial report,
score how relevant the chunk is for answering the question.

Respond with ONLY a JSON object — no explanation, no markdown:
{{
  "score": <float between 0.0 and 1.0>,
  "reason": "<one sentence>",
  "contains_numbers": <true|false>,
  "financial_entity": "<e.g. revenue, risk, margin, or none>"
}}

Scoring guide:
  0.9 – 1.0 : Directly answers the question with specific data/metrics
  0.7 – 0.9 : Highly relevant, contains related financial information
  0.4 – 0.7 : Partially relevant, tangentially related
  0.0 – 0.4 : Irrelevant or off-topic

USER QUESTION:
{question}

DOCUMENT CHUNK:
{chunk}
""")

KEEP_THRESHOLD     = 0.4
SUFFICIENT_QUALITY = 0.6
PARTIAL_QUALITY    = 0.35


class CRAGNode:

    def __init__(self):
        self._llm = get_llm(temperature=0.0)
        self._scorer = RELEVANCE_PROMPT | self._llm | StrOutputParser()

    def __call__(self, state: GraphState) -> dict:
        query     = state.get("query", "")
        retrieved = state.get("retrieved_docs", [])

        if not retrieved:
            msg = "[crag] No docs to evaluate — marking insufficient"
            return {"filtered_docs": [], "retrieval_score": 0.0,
                    "answer_quality": "retry", "log": [msg]}

        scored = []
        for doc in retrieved:
            score, meta = self._score_chunk(query, doc)
            scored.append((doc, score, meta))
            doc.metadata["crag_score"]       = round(score, 4)
            doc.metadata["crag_reason"]      = meta.get("reason", "")
            doc.metadata["crag_has_numbers"] = meta.get("contains_numbers", False)
            doc.metadata["crag_entity"]      = meta.get("financial_entity", "none")

        kept = [(d, s, m) for d, s, m in scored if s >= KEEP_THRESHOLD]

        filtered_docs = [doc for doc, _, _ in kept]

        if not filtered_docs and scored:
            # LLM scoring failed but we have chunks - use them anyway
            filtered_docs = [doc for doc, _, _ in scored]
            avg_score = round(
                sum(doc.metadata.get("retrieval_score", 0.5)
                    for doc in filtered_docs) / len(filtered_docs), 3
            )
            verdict = "sufficient"
            logger.warning("[crag] Using all chunks with fallback scores")
        else:
            discarded = len(scored) - len(kept)
            avg_score = round(sum(s for _, s, _ in kept) / len(kept), 3) if kept else 0.0
            verdict   = self._quality_verdict(avg_score, len(kept))

        msg = (
            f"[crag] kept={len(filtered_docs)}/{len(scored)}, "
            f"avg_score={avg_score:.3f}, verdict='{verdict}'"
        )
        logger.info(msg)

        return {
            "filtered_docs":   filtered_docs,
            "retrieval_score": avg_score,
            "answer_quality":  verdict,
            "log":             [msg],
        }

    def _score_chunk(self, question: str, doc: Document):
        try:
            raw    = self._scorer.invoke({"question": question,
                                          "chunk": doc.page_content[:1500]})
            parsed = self._parse_json(raw)
            score  = max(0.0, min(1.0, float(parsed.get("score", 0.5))))
            return score, parsed
        except Exception as e:
            logger.warning(f"Chunk scoring failed: {e}")
            fallback = doc.metadata.get("retrieval_score", 0.5)
            return fallback, {"reason": "scoring error", "contains_numbers": False}

    @staticmethod
    def _parse_json(raw: str) -> dict:
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw.strip())

    @staticmethod
    def _quality_verdict(avg_score: float, n_kept: int) -> str:
        if n_kept == 0:
            return "retry"
        if avg_score >= SUFFICIENT_QUALITY:
            return "sufficient"
        if avg_score >= PARTIAL_QUALITY:
            return "partial"
        return "retry"


_crag = CRAGNode()

def crag_node(state: GraphState) -> dict:
    return _crag(state)