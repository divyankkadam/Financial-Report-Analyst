# backend/pipeline/state.py

from typing import TypedDict, Annotated, Optional
from operator import add


class GraphState(TypedDict):
    # Input
    query:            str
    doc_id:           str           # primary selected doc
    file_path:        str

    # ── NEW: multi-doc routing ────────────────────────────────────────────────
    all_doc_ids:      list          # all candidate doc_ids after routing
    routed_docs:      list          # list of doc dicts selected by router
    routing_reason:   str           # why these docs were selected

    # Document processing
    parsed_text:      str
    doc_metadata:     dict
    chunks:           list
    embeddings_done:  bool

    # Retrieval
    retrieved_docs:   list
    filtered_docs:    list
    retrieval_score:  float

    # Reasoning
    sub_questions:    list
    draft_answer:     str
    final_answer:     str

    # Self-RAG evaluation
    answer_quality:   str
    retry_count:      int
    confidence:       float

    # Logging & evaluation
    log:              Annotated[list, add]
    eval_metrics:     dict