import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center px-4">
        <div
          className="d-inline-flex align-items-center justify-content-center
            rounded-4 bg-primary text-white mb-4"
          style={{ width: 72, height: 72 }}
        >
          <i className="bi bi-bar-chart-line-fill fs-2" />
        </div>
        <h1 className="fw-bold mb-2">Financial Report Analyst</h1>
        <p className="text-muted mb-4 fs-5">
          Upload financial reports and get intelligent analysis powered by
          RAG · CRAG · Self-RAG
        </p>
        <button
          className="btn btn-primary btn-lg px-5"
          onClick={() => navigate("/analyst")}
        >
          Get Started <i className="bi bi-arrow-right ms-2" />
        </button>
        <div className="row mt-5 g-3 text-start" style={{ maxWidth: 720, margin: "2rem auto 0" }}>
          {[
            { icon: "bi-search",        title: "Smart Retrieval",    desc: "Multi-query RAG with automatic query expansion" },
            { icon: "bi-funnel",        title: "CRAG Filtering",     desc: "LLM-based relevance scoring filters noise" },
            { icon: "bi-arrow-repeat",  title: "Self-RAG Validation",desc: "Auto-evaluates and refines answers" },
            { icon: "bi-graph-up",      title: "Financial Analysis", desc: "Trends, risks, margins, growth drivers" },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="col-md-6">
              <div className="card border-0 shadow-sm h-100 p-3">
                <i className={`bi ${icon} fs-4 text-primary mb-2`} />
                <h6 className="fw-semibold mb-1">{title}</h6>
                <p className="text-muted small mb-0">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
