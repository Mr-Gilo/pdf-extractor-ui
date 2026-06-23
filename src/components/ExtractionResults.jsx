import { useState } from "react";
import "./ExtractionResults.css";

const RISK_COLOURS = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
  critical: "#7c3aed",
};

export default function ExtractionResults({ results, onReset }) {
  const [showJson, setShowJson] = useState(false);
  const extraction = results.extraction || {};

  const handleDownload = () => {
    const blob = new Blob(
      [JSON.stringify(extraction, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = results.filename?.replace(".pdf", "_extracted.json") ||
                 "extracted.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="results-container">

      {/* Header bar */}
      <div className="results-header">
        <div className="results-meta">
          <span className="results-filename">📄 {results.filename}</span>
          <span className="results-stats">
            {results.pages_processed} page{results.pages_processed !== 1 ? "s" : ""} ·{" "}
            {results.character_count?.toLocaleString()} characters
          </span>
        </div>
        <div className="results-actions">
          <button className="btn btn-secondary" onClick={() => setShowJson(!showJson)}>
            {showJson ? "Hide" : "View"} JSON
          </button>
          <button className="btn btn-secondary" onClick={handleDownload}>
            ⬇ Download JSON
          </button>
          <button className="btn btn-primary" onClick={onReset}>
            + New Document
          </button>
        </div>
      </div>

      {/* Document type and summary */}
      <div className="result-card summary-card">
        <div className="card-row">
          <div className="card-field">
            <label>Document Type</label>
            <p className="doc-type">
              {extraction.document_type || "Unknown"}
            </p>
          </div>
        </div>
        {extraction.summary && (
          <div className="summary-text">
            <label>Summary</label>
            <p>{extraction.summary}</p>
          </div>
        )}
      </div>

      {/* Parties */}
      {extraction.parties?.length > 0 && (
        <div className="result-card">
          <h3 className="card-title">
            <span>👤</span> Parties Identified
            <span className="badge">{extraction.parties.length}</span>
          </h3>
          <div className="entity-list">
            {extraction.parties.map((p, i) => (
              <div key={i} className="entity-item">
                <span className="entity-name">{p.text}</span>
                {p.context && (
                  <span className="entity-context">{p.context}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dates and Amounts side by side */}
      <div className="result-row">
        {extraction.dates?.length > 0 && (
          <div className="result-card flex-card">
            <h3 className="card-title">
              <span>📅</span> Dates
              <span className="badge">{extraction.dates.length}</span>
            </h3>
            <div className="entity-list">
              {extraction.dates.map((d, i) => (
                <div key={i} className="entity-item">
                  <span className="entity-name date-value">{d.text}</span>
                  {d.context && (
                    <span className="entity-context">{d.context}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {extraction.monetary_amounts?.length > 0 && (
          <div className="result-card flex-card">
            <h3 className="card-title">
              <span>💰</span> Monetary Amounts
              <span className="badge">{extraction.monetary_amounts.length}</span>
            </h3>
            <div className="entity-list">
              {extraction.monetary_amounts.map((m, i) => (
                <div key={i} className="entity-item">
                  <span className="entity-name amount-value">{m.text}</span>
                  {m.context && (
                    <span className="entity-context">{m.context}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Key Facts */}
      {extraction.key_facts?.length > 0 && (
        <div className="result-card">
          <h3 className="card-title">
            <span>🔍</span> Key Facts
          </h3>
          <ul className="facts-list">
            {extraction.key_facts.map((fact, i) => (
              <li key={i}>{fact}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Raw JSON */}
      {showJson && (
        <div className="result-card json-card">
          <h3 className="card-title">
            <span>{ }</span> Raw JSON Output
          </h3>
          <pre className="json-output">
            {JSON.stringify(extraction, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}