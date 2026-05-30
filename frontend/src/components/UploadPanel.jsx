// frontend/src/components/UploadPanel.jsx

import React, { useState, useRef } from "react";
import { uploadMultiplePDFs } from "../services/api";

export default function UploadPanel({ onUploaded }) {
  const [dragging,  setDragging]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [queue,     setQueue]     = useState([]);   // files queued
  const [error,     setError]     = useState("");
  const inputRef = useRef();

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList).filter(f =>
      f.name.toLowerCase().endsWith(".pdf")
    );
    const invalid = Array.from(fileList).filter(f =>
      !f.name.toLowerCase().endsWith(".pdf")
    );

    if (invalid.length > 0) {
      setError(`Skipped ${invalid.length} non-PDF file(s).`);
    } else {
      setError("");
    }

    if (files.length === 0) return;

    setQueue(files.map(f => f.name));
    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadMultiplePDFs(files, setProgress);
      onUploaded(result.documents);

      if (result.errors?.length > 0) {
        setError(`${result.errors.length} file(s) failed to upload.`);
      }
    } catch (e) {
      setError(e.response?.data?.detail || "Upload failed.");
    } finally {
      setUploading(false);
      setQueue([]);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title mb-3">
          <i className="bi bi-file-earmark-pdf-fill text-danger me-2" />
          Upload Reports
          <span className="badge bg-primary bg-opacity-15 text-primary ms-2 small">
            Multi-PDF
          </span>
        </h5>

        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-3 p-3 text-center
            d-flex flex-column align-items-center justify-content-center
            ${dragging
              ? "bg-primary bg-opacity-10 border-primary"
              : "border-secondary"}`}
          style={{ cursor: "pointer", minHeight: 140 }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !uploading && inputRef.current.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            multiple                          // ← key change
            className="d-none"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {uploading ? (
            <>
              <div className="spinner-border spinner-border-sm text-primary mb-2" />
              <p className="text-muted small mb-2 fw-semibold">
                Uploading {queue.length} file{queue.length > 1 ? "s" : ""}…
              </p>
              {/* File list */}
              <div className="w-100 mb-2" style={{ maxHeight: 80, overflowY: "auto" }}>
                {queue.map((name, i) => (
                  <p key={i} className="text-muted mb-0" style={{ fontSize: 11 }}>
                    <i className="bi bi-file-earmark-pdf text-danger me-1" />
                    {name}
                  </p>
                ))}
              </div>
              <div className="w-100">
                <div className="progress" style={{ height: 5 }}>
                  <div
                    className="progress-bar progress-bar-animated bg-primary"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <small className="text-muted">{progress}%</small>
              </div>
            </>
          ) : (
            <>
              <i className="bi bi-cloud-arrow-up fs-2 text-secondary mb-1" />
              <p className="mb-0 fw-semibold small">Drop PDFs here</p>
              <p className="text-muted mb-0" style={{ fontSize: 11 }}>
                or click to browse · multiple files supported
              </p>
            </>
          )}
        </div>

        {error && (
          <div className="alert alert-warning mt-2 py-1 mb-0 small">
            <i className="bi bi-exclamation-triangle me-1" />{error}
          </div>
        )}
      </div>
    </div>
  );
}