import logging
import shutil
from functools import lru_cache
from pathlib import Path

from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

from backend.app.config import settings
from backend.services.embedding_service import get_embedding_service

logger = logging.getLogger(__name__)


class VectorStoreService:
    def __init__(self):
        self._base_path  = Path(settings.vectorstore_path)
        self._base_path.mkdir(parents=True, exist_ok=True)
        self._embeddings = get_embedding_service().model
        self._cache: dict = {}

    def add_documents(self, doc_id: str, documents: list) -> int:
        if not documents:
            logger.warning("add_documents called with empty list — skipping")
            return 0

        index_path = self._index_path(doc_id)

        if self._index_exists(doc_id):
            store = self._load_index(doc_id)
            store.add_documents(documents)
        else:
            logger.info(f"Creating new index for doc_id='{doc_id[:8]}…' with {len(documents)} chunks")
            store = FAISS.from_documents(documents=documents, embedding=self._embeddings)

        store.save_local(str(index_path))
        self._cache[doc_id] = store
        total = store.index.ntotal
        logger.info(f"Index '{doc_id[:8]}…' now contains {total} vectors")
        return total

    def search(self, doc_id: str, query: str, k: int = 6,
               score_threshold: float = 0.0) -> list:
        if not self._index_exists(doc_id):
            logger.warning(f"search: no index found for doc_id='{doc_id[:8]}…'")
            return []

        store   = self._load_index(doc_id)
        results = store.similarity_search_with_score(query=query, k=k)
        filtered = [(doc, score) for doc, score in results if score >= score_threshold]
        filtered.sort(key=lambda x: x[1], reverse=True)

        logger.info(f"search: doc='{doc_id[:8]}…' → {len(filtered)}/{k} results")
        return filtered

    def search_documents(self, doc_id: str, query: str, k: int = 6) -> list:
        return [doc for doc, _ in self.search(doc_id, query, k)]

    def delete(self, doc_id: str) -> bool:
        path = self._index_path(doc_id)
        if path.exists():
            shutil.rmtree(path)
            self._cache.pop(doc_id, None)
            logger.info(f"Deleted index for doc_id='{doc_id[:8]}…'")
            return True
        return False

    def list_indexes(self) -> list:
        return [
            p.name for p in self._base_path.iterdir()
            if p.is_dir() and (p / "index.faiss").exists()
        ]

    def get_index_stats(self, doc_id: str) -> dict:
        if not self._index_exists(doc_id):
            return {"exists": False}
        store = self._load_index(doc_id)
        return {
            "exists":        True,
            "doc_id":        doc_id,
            "total_vectors": store.index.ntotal,
            "index_path":    str(self._index_path(doc_id)),
        }

    def _index_path(self, doc_id: str) -> Path:
        return self._base_path / doc_id

    def _index_exists(self, doc_id: str) -> bool:
        return (self._index_path(doc_id) / "index.faiss").exists()

    def _load_index(self, doc_id: str) -> FAISS:
        if doc_id in self._cache:
            return self._cache[doc_id]
        index_path = self._index_path(doc_id)
        logger.info(f"Loading index from disk: {index_path}")
        store = FAISS.load_local(
            folder_path=str(index_path),
            embeddings=self._embeddings,
            allow_dangerous_deserialization=True,
        )
        self._cache[doc_id] = store
        return store


@lru_cache(maxsize=1)
def get_vectorstore_service() -> VectorStoreService:
    return VectorStoreService()
