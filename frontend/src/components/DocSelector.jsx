// frontend/src/components/DocSelector.jsx

import React, { useState } from "react";
import { deleteDocument } from "../services/api";

export default function DocSelector({
  documents,
  selectedDocId,
  onSelect,
  onDeleted,
  readOnly = false,
}) {
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (e, docId) => {
    e.stopPropagation();

    if (!window.confirm("Remove this document?")) return;

    setDeleting(docId);

    try {
      await deleteDocument(docId);
      onDeleted(docId);
    } catch (err) {
      alert("Failed to delete document.");
    } finally {
      setDeleting(null);
    }
  };

  const handleReindex = async (e, docId) => {
    e.stopPropagation();

    try {
      await fetch(`/api/documents/${docId}/reindex`, {
        method: "POST",
      });

      window.location.reload();
    } catch (err) {
      alert("Failed to re-index document.");
    }
  };

  if (documents.length === 0) {
    return (
      <div className="card shadow-sm">
        <div className="card-body text-center py-4">
          <i className="bi bi-folder2-open fs-2 text-secondary opacity-25" />

          <p className="text-muted small mt-2 mb-0">
            No documents uploaded yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-folder2-open text-primary" />

          <span className="fw-semibold small">
            Documents
          </span>

          <span className="badge bg-primary bg-opacity-15 text-primary">
            {documents.length}
          </span>
        </div>

        <span className="text-muted" style={{ fontSize: 11 }}>
          {readOnly
            ? "Available for auto-routing"
            : "Click to select"}
        </span>
      </div>

      <div
        className="card-body p-2"
        style={{ maxHeight: 340, overflowY: "auto" }}
      >
        {documents.map((doc) => {
          const isSelected = doc.doc_id === selectedDocId;

          return (
            <div
              key={doc.doc_id}
              className={`rounded-3 p-2 mb-1 d-flex align-items-start
                justify-content-between gap-2
                ${
                  !readOnly && isSelected
                    ? "bg-primary bg-opacity-10 border border-primary"
                    : "bg-light border border-transparent"
                }`}
              style={{
                cursor: readOnly ? "default" : "pointer",
              }}
              onClick={() =>
                !readOnly && onSelect(doc)
              }
            >
              {/* Left: icon + info */}
              <div className="d-flex align-items-start gap-2 flex-grow-1 overflow-hidden">
                <i
                  className={`bi bi-file-earmark-pdf-fill mt-1 flex-shrink-0
                    ${
                      !readOnly && isSelected
                        ? "text-primary"
                        : "text-danger"
                    }`}
                />

                <div className="overflow-hidden">
                  <p
                    className={`mb-0 fw-semibold text-truncate
                      ${
                        !readOnly && isSelected
                          ? "text-primary"
                          : ""
                      }`}
                    style={{ fontSize: 12 }}
                    title={doc.file_name}
                  >
                    {doc.file_name}
                  </p>

                  <p
                    className="text-muted mb-0"
                    style={{ fontSize: 10 }}
                  >
                    {doc.total_pages} pages
                    {doc.metadata?.title &&
                      ` · ${doc.metadata.title.slice(0, 30)}`}
                  </p>

                  <code
                    className="text-muted"
                    style={{ fontSize: 9 }}
                  >
                    {doc.doc_id?.slice(0, 10)}…
                  </code>
                </div>
              </div>

              {/* Right side */}
              <div className="d-flex flex-column align-items-end gap-1 flex-shrink-0">

                {/* Read-only routing indicator */}
                {readOnly && (
                  <span
                    className="badge bg-success bg-opacity-10 text-success"
                    style={{ fontSize: 9 }}
                  >
                    <i className="bi bi-cpu me-1" />
                    indexed
                  </span>
                )}

                {/* Active badge */}
                {!readOnly && isSelected && (
                  <span
                    className="badge bg-primary"
                    style={{ fontSize: 9 }}
                  >
                    Active
                  </span>
                )}

                {/* Re-index button */}
                {!doc.indexed && (
                  <button
                    className="btn btn-sm btn-warning py-0 px-1"
                    style={{ fontSize: 10 }}
                    onClick={(e) =>
                      handleReindex(e, doc.doc_id)
                    }
                    title="Re-index this document"
                  >
                    <i className="bi bi-arrow-clockwise me-1" />
                    Re-index
                  </button>
                )}

                {/* Delete button */}
                <button
                  className="btn btn-sm p-0 text-danger"
                  style={{ fontSize: 12, lineHeight: 1 }}
                  onClick={(e) =>
                    handleDelete(e, doc.doc_id)
                  }
                  disabled={deleting === doc.doc_id}
                  title="Remove document"
                >
                  {deleting === doc.doc_id ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <i className="bi bi-trash3" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}