import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import "./FileUpload.css";

export default function FileUpload({ onUpload, onBatchUpload, isLoading }) {
  const [files, setFiles] = useState([]);
  const [mode, setMode] = useState("single"); // "single" or "batch"

  const onDrop = useCallback((acceptedFiles) => {
    if (mode === "single") {
      setFiles(acceptedFiles.slice(0, 1));
    } else {
      setFiles(prev => {
        const combined = [...prev, ...acceptedFiles];
        return combined.slice(0, 20);
      });
    }
  }, [mode]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: mode === "single" ? 1 : 20,
    disabled: isLoading,
    multiple: mode === "batch",
  });

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (files.length === 0) return;
    if (mode === "single") {
      onUpload(files[0]);
    } else {
      onBatchUpload(files);
    }
  };

  const handleClear = () => setFiles([]);

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="upload-container">
      {/* Mode toggle */}
      <div className="mode-toggle">
        <button
          className={`mode-btn ${mode === "single" ? "active" : ""}`}
          onClick={() => { setMode("single"); setFiles([]); }}
          disabled={isLoading}
        >
          Single Document
        </button>
        <button
          className={`mode-btn ${mode === "batch" ? "active" : ""}`}
          onClick={() => { setMode("batch"); setFiles([]); }}
          disabled={isLoading}
        >
          Batch Processing
        </button>
      </div>

      {mode === "batch" && (
        <p className="batch-hint">
          Upload up to 20 PDFs at once. Files are processed sequentially.
        </p>
      )}

      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? "drag-active" : ""} ${
          files.length > 0 ? "has-file" : ""
        } ${isLoading ? "disabled" : ""}`}
      >
        <input {...getInputProps()} />

        {files.length === 0 ? (
          <div className="drop-prompt">
            <div className="drop-icon">📂</div>
            <p className="drop-title">
              {isDragActive
                ? "Drop your PDF(s) here"
                : mode === "single"
                ? "Drag and drop a PDF"
                : "Drag and drop up to 20 PDFs"}
            </p>
            <p className="drop-sub">or click to browse</p>
            <p className="drop-hint">
              {mode === "batch"
                ? `${files.length}/20 files selected`
                : "Supports text-based and scanned PDF files"}
            </p>
          </div>
        ) : mode === "single" ? (
          <div className="file-preview">
            <span className="file-icon">📄</span>
            <div className="file-info">
              <p className="file-name">{files[0].name}</p>
              <p className="file-size">{formatSize(files[0].size)}</p>
            </div>
            <button
              className="clear-btn"
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="batch-drop-active">
            <p className="drop-sub">{files.length} file(s) selected — drop more to add</p>
          </div>
        )}
      </div>

      {/* Batch file list */}
      {mode === "batch" && files.length > 0 && (
        <div className="batch-file-list">
          <div className="batch-list-header">
            <span>{files.length} file(s) · {formatSize(totalSize)} total</span>
            <button className="clear-all-btn" onClick={handleClear} disabled={isLoading}>
              Clear all
            </button>
          </div>
          {files.map((file, i) => (
            <div key={i} className="batch-file-item">
              <span className="batch-file-icon">📄</span>
              <span className="batch-file-name">{file.name}</span>
              <span className="batch-file-size">{formatSize(file.size)}</span>
              <button
                className="remove-btn"
                onClick={() => removeFile(i)}
                disabled={isLoading}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && !isLoading && (
        <button className="btn btn-primary extract-btn" onClick={handleSubmit}>
          <span>🤖</span>{" "}
          {mode === "single"
            ? "Extract Information"
            : `Extract ${files.length} Document${files.length !== 1 ? "s" : ""}`}
        </button>
      )}

      {isLoading && (
        <button className="btn btn-primary extract-btn" disabled>
          <span className="btn-spinner" /> Processing...
        </button>
      )}
    </div>
  );
}