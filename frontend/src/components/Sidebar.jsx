// frontend/src/components/Sidebar.jsx

import React, { useState, useEffect } from "react";
import { getEvalStats, getRecentRuns } from "../services/api";

export default function Sidebar({ selectedDoc, sessionId }) {
  const [stats,   setStats]   = useState(null);
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedDoc?.doc_id) { setStats(null); setRecent([]); return; }
    setLoading(true);
    Promise.all([
      getEvalStats(selectedDoc.doc_id),
      getRecentRuns(5, selectedDoc.doc_id),
    ])
      .then(([s, r]) => { setStats(s); setRecent(r.records || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedDoc]);

  return (
    <div className="d-flex flex-column gap-3">

      {/* Selected doc info */}
      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <i className="bi bi-file-earmark-bar-graph text-danger me-2" />
          <span className="fw-semibold small">Active Document</span>
        </div>
        <div className="card-body py-2 px-3">
          {selectedDoc ? (
            <>
              <p className="fw-semibold mb-1 text-truncate small"
                 title={selectedDoc.file_name}>
                {selectedDoc.file_name}
              </p>
              <p className="text-muted mb-1" style={{ fontSize: 11 }}>
                {selectedDoc.total_pages} pages
              </p>
              {selectedDoc.metadata?.title && (
                <p className="text-muted mb-1" style={{ fontSize: 11 }}>
                  {selectedDoc.metadata.title}
                </p>
              )}
              <code className="text-muted" style={{ fontSize: 10 }}>
                {selectedDoc.doc_id?.slice(0, 12)}…
              </code>
            </>
          ) : (
            <p className="text-muted small mb-0">
              <i className="bi bi-arrow-left me-1" />
              Select a document to begin
            </p>
          )}
        </div>
      </div>

      {/* Eval stats */}
      {stats && stats.total_queries > 0 && (
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <i className="bi bi-speedometer2 text-primary me-2" />
            <span className="fw-semibold small">
              Stats for "{selectedDoc?.file_name?.slice(0, 20)}…"
            </span>
          </div>
          <div className="card-body py-2 px-3">
            {[
              ["Queries",        stats.total_queries],
              ["Avg confidence", `${Math.round((stats.avg_confidence || 0) * 100)}%`],
              ["Avg latency",    `${stats.avg_latency_ms || 0}ms`],
              ["Avg retries",    stats.avg_retries ?? 0],
            ].map(([label, val]) => (
              <div key={label}
                className="d-flex justify-content-between py-1 border-bottom border-light">
                <span className="text-muted" style={{ fontSize: 12 }}>{label}</span>
                <span className="fw-semibold" style={{ fontSize: 12 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent queries for this doc */}
      {recent.length > 0 && (
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <i className="bi bi-clock-history text-secondary me-2" />
            <span className="fw-semibold small">Recent Queries</span>
          </div>
          <div className="card-body py-2 px-3"
               style={{ maxHeight: 220, overflowY: "auto" }}>
            {recent.slice().reverse().map((r, i) => (
              <div key={i} className="py-2 border-bottom border-light">
                <p className="mb-1 small text-truncate" title={r.query}>
                  {r.query}
                </p>
                <div className="d-flex gap-2">
                  <span className="badge bg-light text-secondary border"
                        style={{ fontSize: 10 }}>
                    {Math.round((r.confidence || 0) * 100)}% conf
                  </span>
                  <span className="badge bg-light text-secondary border"
                        style={{ fontSize: 10 }}>
                    {r.latency_ms || 0}ms
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-2">
          <span className="spinner-border spinner-border-sm text-secondary" />
        </div>
      )}
    </div>
  );
}