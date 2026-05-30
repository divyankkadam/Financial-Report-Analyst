import React, { useState } from "react";

function ScoreBar({ label, value }) {
  const pct   = Math.round((value || 0) * 100);
  const color = pct >= 80 ? "success" : pct >= 60 ? "warning" : "danger";
  return (
    <div className="mb-2">
      <div className="d-flex justify-content-between mb-1">
        <small className="text-capitalize text-muted">{label}</small>
        <small className="fw-semibold">{pct}%</small>
      </div>
      <div className="progress" style={{ height: 5 }}>
        <div className={`progress-bar bg-${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function EvalBadge({ confidence, metrics, retryCount }) {
  const [open, setOpen] = useState(false);
  if (confidence === undefined || confidence === null) return null;

  const pct   = Math.round(confidence * 100);
  const color = pct >= 80 ? "success" : pct >= 60 ? "warning" : "danger";

  return (
    <div className="mt-3">
      <div className="d-flex align-items-center gap-2 flex-wrap">
        <span className={`badge bg-${color} bg-opacity-15 text-${color}
          border border-${color} px-3 py-2 fs-6`}>
          <i className="bi bi-graph-up me-1" />
          Confidence: {pct}%
        </span>

        {retryCount > 0 && (
          <span className="badge bg-warning bg-opacity-15 text-warning border border-warning px-2 py-2">
            <i className="bi bi-arrow-repeat me-1" />
            {retryCount} {retryCount === 1 ? "retry" : "retries"}
          </span>
        )}

        {metrics && Object.keys(metrics).length > 0 && (
          <button
            className="btn btn-sm btn-outline-secondary py-1"
            onClick={() => setOpen(o => !o)}
          >
            <i className={`bi bi-chevron-${open ? "up" : "down"} me-1`} />
            Eval breakdown
          </button>
        )}
      </div>

      {open && metrics && (
        <div className="card mt-2 border-0 bg-light">
          <div className="card-body py-3 px-3">
            <p className="small fw-semibold text-muted mb-3 text-uppercase"
               style={{ letterSpacing: "0.05em" }}>
              Self-RAG evaluation scores
            </p>
            <ScoreBar label="Relevance"    value={metrics.relevance}    />
            <ScoreBar label="Groundedness" value={metrics.groundedness} />
            <ScoreBar label="Completeness" value={metrics.completeness} />
            <ScoreBar label="Confidence"   value={metrics.confidence}   />
            {metrics.improvement && metrics.improvement !== "none" && (
              <div className="alert alert-info py-2 mt-2 mb-0 small">
                <i className="bi bi-lightbulb me-1" />
                {metrics.improvement}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
