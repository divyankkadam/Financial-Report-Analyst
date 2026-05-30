from backend.services.embedding_service import get_embedding_service
from backend.services.vectorstore_service import get_vectorstore_service


def get_embeddings():
    return get_embedding_service().model


def get_vectorstore():
    return get_vectorstore_service()
