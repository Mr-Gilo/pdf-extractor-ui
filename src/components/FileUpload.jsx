import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import "./FileUpload.css";

export default function FileUpload({ onUpload, isLoading }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: isLoading,
  });

  const handleSubmit = () => {
    if (selectedFile) onUpload(selectedFile);
  };

  const handleClear = () => setSelectedFile(null);

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="upload-container">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? "drag-active" : ""} ${
          selectedFile ? "has-file" : ""
        } ${isLoading ? "disabled" : ""}`}
      >
        <input {...getInputProps()} />

        {selectedFile ? (
          <div className="file-preview">
            <span className="file-icon">📄</span>
            <div className="file-info">
              <p className="file-name">{selectedFile.name}</p>
              <p className="file-size">{formatSize(selectedFile.size)}</p>
            </div>
            <button
              className="clear-btn"
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="drop-prompt">
            <div className="drop-icon">📂</div>
            <p className="drop-title">
              {isDragActive ? "Drop your PDF here" : "Drag and drop a PDF"}
            </p>
            <p className="drop-sub">or click to browse</p>
            <p className="drop-hint">Supports text-based PDF files up to 10MB</p>
          </div>
        )}
      </div>

      {selectedFile && !isLoading && (
        <button className="btn btn-primary extract-btn" onClick={handleSubmit}>
          <span>🤖</span> Extract Information
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