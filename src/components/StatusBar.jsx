import { useEffect, useState } from "react";
import "./StatusBar.css";

export default function StatusBar({ apiUrl }) {
  const [health, setHealth] = useState(null);
  const [checking, setChecking] = useState(false);

  const check = async () => {
    setChecking(true);
    try {
      const res = await fetch(`${apiUrl}/health`, { signal: AbortSignal.timeout(3000) });
      const data = await res.json();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const online = health?.status === "healthy";

  return (
    <div className="status-bar">
      <div className={`status-dot ${online ? "online" : "offline"}`} />
      <div className="status-info">
        {online ? (
          <>
            <span className="status-label online-text">API Online</span>
            <span className="status-detail">
              {health.model} · {health.deployment}
            </span>
          </>
        ) : (
          <>
            <span className="status-label offline-text">API Offline</span>
            <span className="status-detail">
              Start: cd backend && python main.py
            </span>
          </>
        )}
      </div>
      <button
        className="refresh-btn"
        onClick={check}
        disabled={checking}
        title="Refresh status"
      >
        {checking ? "⟳" : "↻"}
      </button>
    </div>
  );
}