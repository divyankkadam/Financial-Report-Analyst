# backend/pipeline/graph.py

import logging
from langgraph.graph import StateGraph, END
from backend.pipeline.state import GraphState
from backend.app.config import settings

from backend.nodes.loader_node     import loader_node
from backend.nodes.chunker_node    import chunker_node
from backend.nodes.doc_router_node import doc_router_node    # ← NEW
from backend.nodes.retriever_node  import retriever_node
from backend.nodes.crag_node       import crag_node
from backend.nodes.reasoning_node  import reasoning_node
from backend.nodes.selfrag_node    import selfrag_node
from backend.nodes.answer_node     import answer_node

logger = logging.getLogger(__name__)


def route_after_crag(state: GraphState) -> str:
    verdict     = state.get("answer_quality", "retry")
    retry_count = state.get("retry_count", 0)
    if verdict == "retry" and retry_count < settings.max_retries:
        return "retriever_node"
    return "reasoning_node"


def route_after_selfrag(state: GraphState) -> str:
    verdict     = state.get("answer_quality", "retry")
    retry_count = state.get("retry_count", 0)
    if retry_count >= settings.max_retries:
        return "final_answer_node"
    if verdict == "good":
        return "final_answer_node"
    if verdict == "refine":
        return "reasoning_node"
    return "retriever_node"


def build_ingest_graph():
    """Ingest only: loader → chunker → END."""
    b = StateGraph(GraphState)
    b.add_node("loader_node",  loader_node)
    b.add_node("chunker_node", chunker_node)
    b.set_entry_point("loader_node")
    b.add_edge("loader_node",  "chunker_node")
    b.add_edge("chunker_node", END)
    return b.compile()


def build_query_graph():
    """
    Query graph: doc_router → retriever → crag →
                 reasoning → selfrag → answer
    """
    b = StateGraph(GraphState)

    b.add_node("doc_router_node",   doc_router_node)     # ← NEW first node
    b.add_node("retriever_node",    retriever_node)
    b.add_node("crag_node",         crag_node)
    b.add_node("reasoning_node",    reasoning_node)
    b.add_node("selfrag_node",      selfrag_node)
    b.add_node("final_answer_node", answer_node)

    # Entry: auto-route to best doc first
    b.set_entry_point("doc_router_node")                  # ← changed

    b.add_edge("doc_router_node",  "retriever_node")      # ← NEW edge
    b.add_edge("retriever_node",   "crag_node")
    b.add_edge("reasoning_node",   "selfrag_node")

    b.add_conditional_edges(
        "crag_node", route_after_crag,
        {"retriever_node": "retriever_node",
         "reasoning_node": "reasoning_node"},
    )
    b.add_conditional_edges(
        "selfrag_node", route_after_selfrag,
        {"final_answer_node": "final_answer_node",
         "reasoning_node":    "reasoning_node",
         "retriever_node":    "retriever_node"},
    )
    b.add_edge("final_answer_node", END)
    return b.compile()