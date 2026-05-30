import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { listDocuments } from "../services/api";

import UploadPanel from "../components/UploadPanel";
import DocSelector from "../components/DocSelector";
import ChatPanel from "../components/ChatPanel";
import ReportViewer from "../components/ReportViewer";
import Sidebar from "../components/Sidebar";

export default function Analyst() {
  const [documents, setDocuments] = useState([]);
  const [sources, setSources] = useState([]);
  const [sessionId] = useState(() => uuidv4());
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    listDocuments()
      .then(data => setDocuments(data.documents || []))
      .catch(() => { })
      .finally(() => setLoadingDocs(false));
  }, []);

  const handleUploaded = (newDocs) => {
    setDocuments(prev => {
      const existingIds = new Set(prev.map(d => d.doc_id));
      return [...prev, ...newDocs.filter(d => !existingIds.has(d.doc_id))];
    });
  };

  const handleDeleted = (docId) => {
    setDocuments(prev => prev.filter(d => d.doc_id !== docId));
  };

  return (
    <div className="container-fluid py-3 px-4">

      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="d-flex align-items-center justify-content-center
          rounded-3 bg-primary text-white" style={{ width: 42, height: 42 }}>
          <i className="bi bi-bar-chart-line-fill" />
        </div>
        <div>
          <h4 className="mb-0 fw-bold">Financial Report Analyst</h4>
        </div>

      </div>



      <div className="row g-3">

        {/* Left: Upload + Doc list (read-only display) */}
        <div className="col-lg-3 d-flex flex-column gap-3">
          <UploadPanel onUploaded={handleUploaded} />

          {/* Show docs as read-only list (no selection needed) */}
          {loadingDocs ? (
            <div className="text-center py-3">
              <span className="spinner-border spinner-border-sm text-primary" />
            </div>
          ) : (
            <DocSelector
              documents={documents}
              selectedDocId={null}        // ← no selection
              onSelect={() => { }}         // ← no-op
              onDeleted={handleDeleted}
              readOnly={true}             // ← new prop
            />
          )}

          <ReportViewer sources={sources} />
        </div>

        {/* Center: Chat — no doc selection needed */}
        <div className="col-lg-6">
          <ChatPanel
            sessionId={sessionId}
            onAnswer={(payload) => setSources(payload.sources || [])}
            hasDocuments={documents.length > 0}   // ← changed prop
          />
        </div>

        {/* Right: Sidebar */}
        <div className="col-lg-3">
          <Sidebar documents={documents} sessionId={sessionId} />
        </div>

      </div>
    </div>
  );
}