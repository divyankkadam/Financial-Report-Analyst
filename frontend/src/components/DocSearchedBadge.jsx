// frontend/src/components/DocSearchedBadge.jsx  ← NEW FILE

import React, { useState } from "react";

export default function DocSearchedBadge({ docsSearched, routingReason }) {
  const [open, setOpen] = useState(false);
  if (!docsSearched?.length) return null;

  return (
    <div className="mt-2">
      <div className="d-flex align-items-center gap-2 flex-wrap">
        <span className="badge bg-info bg-opacity-15 text-info
          border border-info px-2 py-1"
          style={{ fontSize: 11 }}>
          <i className="bi bi-cpu me-1" />
          Auto-searched {docsSearched.length} doc{docsSearched.length > 1 ? "s" : ""}
        </span>

        {docsSearched.map((doc, i) => (
          <span key={i}
            className="badge bg-light text-secondary border px-2 py-1"
            style={{ fontSize: 11 }}>
            <i className="bi bi-file-earmark-pdf text-danger me-1" />
            {doc.file_name?.slice(0, 25)}
            {doc.file_name?.length > 25 ? "…" : ""}
          </span>
        ))}

        {routingReason && (
          <button
            className="btn btn-sm btn-link text-muted p-0"
            style={{ fontSize: 11 }}
            onClick={() => setOpen(o => !o)}
          >
            {open ? "hide reason" : "why?"}
          </button>
        )}
      </div>

      {open && routingReason && (
        <div className="alert alert-light py-1 px-2 mt-1 mb-0"
             style={{ fontSize: 11 }}>
          <i className="bi bi-info-circle me-1 text-info" />
          {routingReason}
        </div>
      )}
    </div>
  );
}