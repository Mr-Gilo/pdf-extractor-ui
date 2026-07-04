import { useState } from "react";
import FileUpload from "./components/FileUpload";
import ExtractionResults from "./components/ExtractionResults";
import StatusBar from "./components/StatusBar";
import "./App.css";

const API_URL = "http://localhost:8000";

function App() {
  const [status, setStatus] = useState("idle");
  const [results, setResults] = useState(null);   // single result or batch results
  const [isBatch, setIsBatch] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (file) => {
    setStatus("loading");
    setResults(null);
    setError(null);
    setIsBatch(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/extract`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Extraction failed");
      }
      const data = await res.json();
      setResults(data);
      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  const handleBatchUpload = async (files) => {
    setStatus("loading");
    setResults(null);
    setError(null);
    setIsBatch(true);

    const formData = new FormData();
    files.forEach(file => formData.append("files", file));

    try {
      const res = await fetch(`${API_URL}/extract-batch`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Batch extraction failed");
      }
      const data = await res.json();
      setResults(data);
      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setResults(null);
    setError(null);
    setIsBatch(false);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <span className="logo-icon">📄</span>
              <div>
                <h1>PDF Information Extractor</h1>
                <p>Local AI-powered document analysis — single and batch processing</p>
              </div>
            </div>
          </div>
          <StatusBar apiUrl={API_URL} />
        </div>
      </header>

      <main className="app-main">
        {status !== "success" && (
          <FileUpload
            onUpload={handleFileUpload}
            onBatchUpload={handleBatchUpload}
            isLoading={status === "loading"}
          />
        )}

        {status === "loading" && (
          <div className="loading-state">
            <div className="spinner" />
            <p>
              {isBatch
                ? "Processing documents sequentially with local AI model..."
                : "Extracting information with local AI model..."}
            </p>
            <p className="loading-sub">
              {isBatch
                ? "Batch processing may take several minutes"
                : "This may take 15 to 30 seconds"}
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="error-state">
            <span className="error-icon">⚠️</span>
            <p className="error-title">Extraction Failed</p>
            <p className="error-msg">{error}</p>
            <button className="btn btn-primary" onClick={handleReset}>
              Try Again
            </button>
          </div>
        )}

        {status === "success" && results && !isBatch && (
          <ExtractionResults results={results} onReset={handleReset} />
        )}

        {status === "success" && results && isBatch && (
          <BatchResults results={results} onReset={handleReset} />
        )}
      </main>

      <footer className="app-footer">
        <p>
          Powered by{" "}
          <strong>Ollama (llama3.2)</strong> ·{" "}
          <strong>FastAPI</strong> ·{" "}
          <strong>PyMuPDF</strong> · All processing local
        </p>
        <a href="https://github.com/Mr-Gilo/pdf-extractor" target="_blank" rel="noreferrer">
          github.com/Mr-Gilo/pdf-extractor
        </a>
      </footer>
    </div>
  );
}

// Inline batch results component
function BatchResultCard({ item, index }) {
  const [expanded, setExpanded] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const methodBadge = {
    native:  { label: "Native",  color: "#059669", bg: "#f0fdf4" },
    ocr:     { label: "OCR",     color: "#d97706", bg: "#fffbeb" },
    mixed:   { label: "Mixed",   color: "#0369a1", bg: "#eff6ff" },
  }[item.extraction_method] || { label: "Unknown", color: "#64748b", bg: "#f8fafc" };

  const downloadJson = () => {
    const blob = new Blob(
      [JSON.stringify(item.extraction, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.filename.replace(".pdf", "_extracted.json");
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!item.success) {
    return (
      <div className="brc brc-failed">
        <div className="brc-header">
          <span className="brc-status-icon">❌</span>
          <div className="brc-title-group">
            <span className="brc-filename">{item.filename}</span>
            <span className="brc-error-label">Extraction failed</span>
          </div>
        </div>
        <div className="brc-error-body">
          <span className="brc-error-tag">Error</span>
          <span className="brc-error-text">{item.error}</span>
        </div>
      </div>
    );
  }

  const extraction = item.extraction || {};
  const parties = extraction.parties || [];
  const dates = extraction.dates || [];
  const amounts = extraction.monetary_amounts || [];
  const facts = extraction.key_facts || [];

  return (
    <div className={`brc ${expanded ? "brc-open" : ""}`}>
      {/* Always-visible header row */}
      <div className="brc-header" onClick={() => setExpanded(!expanded)}>
        <span className="brc-status-icon">✅</span>

        <div className="brc-title-group">
          <span className="brc-filename">{item.filename}</span>
          <span className="brc-doc-type">{extraction.document_type || "Document"}</span>
        </div>

        <div className="brc-meta-pills">
          <span className="brc-pill">{item.pages_processed}p</span>
          <span className="brc-pill">{(item.character_count || 0).toLocaleString()} ch</span>
          <span className="brc-pill" style={{ background: methodBadge.bg, color: methodBadge.color }}>
            {methodBadge.label}
          </span>
        </div>

        <button className="brc-toggle" aria-label="toggle">
          {expanded ? "▲" : "▼"}
        </button>
      </div>

      {/* Summary line always visible */}
      {!expanded && extraction.summary && (
        <p className="brc-summary-preview">{extraction.summary}</p>
      )}

      {/* Expanded detail */}
      {expanded && (
        <div className="brc-body">
          {extraction.summary && (
            <div className="brc-section brc-summary-full">
              <p>{extraction.summary}</p>
            </div>
          )}

          <div className="brc-grid">
            {/* Parties */}
            <div className="brc-section">
              <h4 className="brc-section-title">👤 Parties</h4>
              {parties.length > 0 ? (
                <ul className="brc-list">
                  {parties.map((p, i) => (
                    <li key={i}>
                      <strong>{p.text}</strong>
                      {p.context && <span className="brc-ctx">{p.context}</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="brc-empty">None identified</p>
              )}
            </div>

            {/* Dates */}
            <div className="brc-section">
              <h4 className="brc-section-title">📅 Dates</h4>
              {dates.length > 0 ? (
                <ul className="brc-list">
                  {dates.map((d, i) => (
                    <li key={i}>
                      <strong className="brc-date">{d.text}</strong>
                      {d.context && <span className="brc-ctx">{d.context}</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="brc-empty">None identified</p>
              )}
            </div>

            {/* Monetary amounts */}
            <div className="brc-section">
              <h4 className="brc-section-title">💰 Amounts</h4>
              {amounts.length > 0 ? (
                <ul className="brc-list">
                  {amounts.map((a, i) => (
                    <li key={i}>
                      <strong className="brc-amount">{a.text}</strong>
                      {a.context && <span className="brc-ctx">{a.context}</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="brc-empty">None identified</p>
              )}
            </div>

            {/* Key facts */}
            <div className="brc-section brc-section-wide">
              <h4 className="brc-section-title">🔍 Key Facts</h4>
              {facts.length > 0 ? (
                <ul className="brc-list brc-facts">
                  {facts.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              ) : (
                <p className="brc-empty">None identified</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="brc-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setShowJson(!showJson)}
            >
              {showJson ? "Hide JSON" : "View JSON"}
            </button>
            <button className="btn btn-secondary" onClick={downloadJson}>
              ⬇ Download JSON
            </button>
          </div>

          {showJson && (
            <pre className="brc-json">{JSON.stringify(extraction, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
}

function BatchResults({ results, onReset }) {
  const { total_files, successful, failed, results: items } = results;

  const downloadAll = () => {
    const combined = {};
    items.filter(r => r.success).forEach(r => {
      combined[r.filename] = r.extraction;
    });
    const blob = new Blob(
      [JSON.stringify(combined, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "batch_extraction_results.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="results-container">
      {/* Header */}
      <div className="results-header">
        <div className="results-meta">
          <span className="results-filename">
            Batch complete: {successful}/{total_files} successful
            {failed > 0 && `, ${failed} failed`}
          </span>
          <span className="results-stats">
            Click any card to expand full extraction detail
          </span>
        </div>
        <div className="results-actions">
          {successful > 0 && (
            <button className="btn btn-secondary" onClick={downloadAll}>
              ⬇ Download All JSON
            </button>
          )}
          <button className="btn btn-primary" onClick={onReset}>
            + New Batch
          </button>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="batch-summary-row">
        <div className="batch-stat">
          <span className="batch-stat-num">{total_files}</span>
          <span className="batch-stat-label">Total Files</span>
        </div>
        <div className="batch-stat success">
          <span className="batch-stat-num">{successful}</span>
          <span className="batch-stat-label">Successful</span>
        </div>
        <div className="batch-stat fail">
          <span className="batch-stat-num">{failed}</span>
          <span className="batch-stat-label">Failed</span>
        </div>
      </div>

      {/* Per-document cards */}
      {items.map((item, i) => (
        <BatchResultCard key={i} item={item} index={i} />
      ))}
    </div>
  );
}

export default App;