# backend/app/config.py

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── HuggingFace ────────────────────────────────────────────────────────────
    hf_token:           str   = ""
    hf_llm_model:       str   = "meta-llama/Llama-3.1-8B-Instruct"
    hf_embedding_model: str   = "sentence-transformers/all-MiniLM-L6-v2"

    # ── Provider selection ─────────────────────────────────────────────────────
    llm_provider:       str   = "huggingface"   # "huggingface" | "gemini"
    embedding_provider: str   = "huggingface"

    # ── Gemini (backup) ────────────────────────────────────────────────────────
    google_api_key:          str   = ""
    gemini_model:            str   = "gemini-2.0-flash"
    gemini_embedding_model:  str   = "text-embedding-004"

    # ── Vector store ───────────────────────────────────────────────────────────
    vectorstore_provider:    str   = "faiss"
    vectorstore_path:        str   = "data/vectorstore"

    # ── Chunking ───────────────────────────────────────────────────────────────
    chunk_size:              int   = 800
    chunk_overlap:           int   = 150

    # ── Self-RAG ───────────────────────────────────────────────────────────────
    max_retries:            int   = 1
    confidence_threshold:     float = 0.5

    # ── Upload ─────────────────────────────────────────────────────────────────
    upload_dir:              str   = "data/uploads"
    max_upload_mb:           int   = 50

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()

settings = get_settings()