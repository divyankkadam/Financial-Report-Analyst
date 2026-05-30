import React, { useState, useRef, useEffect } from "react";
import { streamQuery } from "../services/api";
import EvalBadge from "./EvalBadge";
import ReactMarkdown from "react-markdown";
import DocSearchedBadge from "./DocSearchedBadge";

const SUGGESTED = [
  "What are the key revenue trends over the last 3 years?",
  "Summarize the main financial risks mentioned",
  "What are the major growth drivers?",
  "Compare profit margins across business segments",
  "Find any mention of declining performance",
];

function StatusBubble({ messages }) {
  if (!messages.length) return null;
  return (
    <div className="d-flex align-items-start gap-2 mb-3">
      <div className="spinner-border spinner-border-sm text-primary mt-1 flex-shrink-0" />
      <div className="text-muted small">{messages[messages.length - 1]}</div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";

  return (
    <div className={`d-flex mb-4 ${isUser ? "justify-content-end" : ""}`}>
      {!isUser && (
        <div
          className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-2 flex-shrink-0"
          style={{ width: 34, height: 34 }}
        >
          <i className="bi bi-robot text-white small" />
        </div>
      )}

      <div style={{ maxWidth: "82%" }}>
        <div
          className={`rounded-3 px-3 py-2 ${
            isUser ? "bg-primary text-white" : "bg-light border"
          }`}
        >
          {isUser ? (
            <p className="mb-0 small">{msg.content}</p>
          ) : (
            <div className="small" style={{ lineHeight: 1.7 }}>
              <ReactMarkdown>{msg.content || "…"}</ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && msg.payload && (
          <div className="mt-1 px-1">
            {/* Show which docs were auto-searched */}
            <DocSearchedBadge
              docsSearched={msg.payload.docs_searched}
              routingReason={msg.payload.routing_reason}
            />

            <EvalBadge
              confidence={msg.payload.confidence}
              metrics={msg.payload.metrics}
              retryCount={msg.payload.retry_count}
            />

            {msg.payload.sub_questions?.length > 0 && (
              <div className="mt-2">
                <p className="small text-muted mb-1 fw-semibold">
                  Sub-questions researched:
                </p>

                <ul className="small text-muted mb-0 ps-3">
                  {msg.payload.sub_questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Updated prop signature — removed docId/filePath
export default function ChatPanel({
  sessionId,
  onAnswer,
  hasDocuments,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [statusMsgs, setStatusMsgs] = useState([]);

  const bottomRef = useRef();
  const cancelRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, statusMsgs]);

  const sendQuery = (query) => {
    if (!query.trim() || streaming || !hasDocuments) return;

    setInput("");
    setStatusMsgs([]);

    const userMsg = { role: "user", content: query };
    const botMsg = { role: "assistant", content: "", payload: null };

    const botIndex = messages.length + 1;

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setStreaming(true);

    // Removed docId/filePath from streamQuery
    cancelRef.current = streamQuery({
      query,
      sessionId,

      onStatus: (msg) =>
        setStatusMsgs((prev) => [...prev, msg]),

      onAnswer: (payload) => {
        setStreaming(false);
        setStatusMsgs([]);

        setMessages((prev) =>
          prev.map((m, i) =>
            i === botIndex
              ? {
                  role: "assistant",
                  content: payload.answer,
                  payload,
                }
              : m
          )
        );

        onAnswer?.(payload);
      },

      onError: (err) => {
        setStreaming(false);
        setStatusMsgs([]);

        setMessages((prev) =>
          prev.map((m, i) =>
            i === botIndex
              ? {
                  role: "assistant",
                  content: `⚠ Error: ${err}`,
                  payload: null,
                }
              : m
          )
        );
      },
    });
  };

  return (
    <div
      className="card shadow-sm d-flex flex-column"
      style={{ height: "72vh" }}
    >
      <div className="card-header bg-white d-flex align-items-center gap-2">
        <i className="bi bi-chat-dots-fill text-primary" />

        <span className="fw-semibold">
          Financial Analyst
        </span>

        {!hasDocuments && (
          <span className="badge bg-warning text-dark ms-auto small">
            Upload documents to begin
          </span>
        )}
      </div>

      <div className="flex-grow-1 overflow-auto p-3">
        {messages.length === 0 && (
          <div className="text-center py-4">
            <i className="bi bi-bar-chart-line fs-1 text-secondary opacity-25" />

            <p className="text-muted mt-2 small">
              Upload a report and ask any financial question
            </p>

            {hasDocuments && (
              <div className="d-flex flex-wrap gap-2 justify-content-center mt-3">
                {SUGGESTED.map((s, i) => (
                  <button
                    key={i}
                    className="btn btn-sm btn-outline-secondary text-start"
                    style={{ maxWidth: 260, fontSize: 12 }}
                    onClick={() => sendQuery(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}

        {streaming && (
          <StatusBubble messages={statusMsgs} />
        )}

        <div ref={bottomRef} />
      </div>

      <div className="card-footer bg-white border-top p-3">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder={
              hasDocuments
                ? "Ask anything — system picks the right document"
                : "Upload documents first"
            }
            value={input}
            disabled={!hasDocuments || streaming}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && sendQuery(input)
            }
          />

          <button
            className="btn btn-primary px-3"
            disabled={
              !hasDocuments ||
              streaming ||
              !input.trim()
            }
            onClick={() => sendQuery(input)}
          >
            {streaming ? (
              <span className="spinner-border spinner-border-sm" />
            ) : (
              <i className="bi bi-send-fill" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}