import { useState } from "react";
import FileUpload from "./components/FileUpload";
import ExtractionResults from "./components/ExtractionResults";
import StatusBar from "./components/StatusBar";
import "./App.css";

const API_URL = "http://localhost:8000";

function App() {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [apiHealth, setApiHealth] = useState(null);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_URL}/health`);
      const data = await res.json();
      setApiHealth(data);
    } catch {
      setApiHealth(null);
    }
  };

  const handleFileUpload = async (file) => {
    setStatus("loading");
    setResults(null);
    setError(null);

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

  const handleReset = () => {
    setStatus("idle");
    setResults(null);
    setError(null);
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
                <p>Local AI-powered document analysis — no data leaves your machine</p>
              </div>
            </div>
          </div>
          <StatusBar apiUrl={API_URL} onHealthCheck={checkHealth} health={apiHealth} />
        </div>
      </header>

      <main className="app-main">
        {status !== "success" && (
          <FileUpload
            onUpload={handleFileUpload}
            isLoading={status === "loading"}
          />
        )}

        {status === "loading" && (
          <div className="loading-state">
            <div className="spinner" />
            <p>Extracting information with local AI model...</p>
            <p className="loading-sub">This may take 15–30 seconds</p>
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

        {status === "success" && results && (
          <ExtractionResults results={results} onReset={handleReset} />
        )}
      </main>

      <footer className="app-footer">
        <p>
          Powered by{" "}
          <strong>Ollama (llama3.2)</strong> ·{" "}
          <strong>FastAPI</strong> ·{" "}
          <strong>PyMuPDF</strong> · All processing local
        </p>
        
        <a
          href="https://github.com/Mr-Gilo/pdf-extractor"
          target="_blank"
          rel="noreferrer"
        >
          github.com/Mr-Gilo/pdf-extractor
        </a>
      </footer>
    </div>
  );
}

export default App;