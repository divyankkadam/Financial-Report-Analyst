import React, { useState } from "react";

function SourceCard({ source, index }) {
  const [expanded, setExpanded] = useState(false);
  const score = source.crag_score ? Math.round(source.crag_score * 100) : null;
  const color = score >= 80 ? "success" : score >= 60 ? "warning" : "secondary";

  return (
    <div className="card mb-2 border-0 shadow-sm">
      <div
        className="card-header bg-white d-flex align-items-center justify-content-between py-2 px-3"
        style={{ cursor: "pointer" }}
        onClick={() => setExpanded(e => !e)}
      >
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-secondary bg-opacity-15 text-secondary">
            #{index + 1}
          </span>
          <span className="fw-semibold small text-truncate" style={{ maxWidth: 180 }}>
            {source.section || "Unknown section"}
          </span>
          {source.page && (
            <span className="text-muted small">p. {source.page}</span>
          )}
        </div>
        <div className="d-flex align-items-center gap-2">
          {score !== null && (
            <span className={`badge bg-${color} bg-opacity-15 text-${color} border border-${color}`}>
              {score}%
            </span>
          )}
          <i className={`bi bi-chevron-${expanded ? "up" : "down"} text-muted`} />
        </div>
      </div>

      {expanded && (
        <div className="card-body py-2 px-3">
          <p className="small text-muted font-monospace mb-0"
             style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            {source.snippet}
          </p>
        </div>
      )}
    </div>
  );
}

export default function ReportViewer({ sources, docMeta }) {
  if (!sources?.length) return null;

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white d-flex align-items-center gap-2">
        <i className="bi bi-journal-text text-primary" />
        <span className="fw-semibold">
          Source Chunks
          <span className="badge bg-primary bg-opacity-15 text-primary ms-2">
            {sources.length}
          </span>
        </span>
      </div>
      <div className="card-body p-3" style={{ maxHeight: 420, overflowY: "auto" }}>
        {docMeta && (
          <div className="alert alert-light py-2 mb-3 small">
            <i className="bi bi-file-earmark-text me-1" />
            <strong>{docMeta.title || docMeta.file_name}</strong>
            {docMeta.author && <span className="text-muted ms-2">· {docMeta.author}</span>}
            {docMeta.pages  && <span className="text-muted ms-2">· {docMeta.pages} pages</span>}
          </div>
        )}
        {sources.map((src, i) => (
          <SourceCard key={i} source={src} index={i} />
        ))}
      </div>
    </div>
  );
}
