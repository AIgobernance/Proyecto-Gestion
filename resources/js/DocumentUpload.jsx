import React, { useState, useRef } from "react";
import axios from "axios";
import { Upload, X, FileText, AlertCircle, CheckCircle2 } from "lucide-react";

export function DocumentUpload({ 
  onUpload, 
  uploadedFile, 
  maxSizeMB = 2, 
  maxFiles = 3,
  currentFileIndex = 0,
  disabled = false,
  evaluationId = null // ID de la evaluación actual
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError(null);

    // Validar tipo de archivo
    if (selectedFile.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF');
      return;
    }

    // Validar tamaño (2MB = 2 * 1024 * 1024 bytes)
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      setError(`El archivo no puede pesar más de ${maxSizeMB}MB`);
      return;
    }

    setFile(selectedFile);
    setPreview(selectedFile.name);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('documento', file);
      formData.append('indice', currentFileIndex);
      
      // Incluir id_evaluacion si está disponible
      if (evaluationId) {
        formData.append('id_evaluacion', evaluationId);
      }

      const token = document.head?.querySelector('meta[name="csrf-token"]');
      if (token) {
        formData.append('_token', token.content);
      }

      const axiosClient = window.axios || axios;
      if (token) {
        axiosClient.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
      }

      const response = await axiosClient.post('/api/evaluation/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.success) {
        setFile(null);
        setPreview(null);
        onUpload?.(response.data.data);
      } else {
        throw new Error(response.data?.error || 'Error al subir el documento');
      }
    } catch (err) {
      console.error('Error al subir documento:', err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Error al subir el documento. Por favor, intenta nuevamente.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <style>{`
        .doc-upload-container {
          margin-top: 20px;
          padding: 16px;
          background: linear-gradient(90deg, #f8faff, #f0f4ff);
          border: 2px dashed #cbd5e1;
          border-radius: 16px;
          transition: all 0.2s ease;
        }
        .doc-upload-container:hover {
          border-color: #4d82bc;
          background: linear-gradient(90deg, #f0f4ff, #e8f0ff);
        }
        .doc-upload-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .doc-upload-title {
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }
        .doc-upload-subtitle {
          font-size: 13px;
          color: #64748b;
          margin: 0 0 12px 0;
        }
        .doc-upload-area {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .doc-upload-input-wrapper {
          position: relative;
        }
        .doc-upload-input {
          display: none;
        }
        .doc-upload-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: linear-gradient(90deg, #4d82bc, #5a8fc9);
          color: #fff;
          border: none;
          border-radius: 999px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(77, 130, 188, 0.3);
          transition: all 0.15s ease;
        }
        .doc-upload-button:hover:not(:disabled) {
          filter: brightness(1.05);
          box-shadow: 0 6px 16px rgba(77, 130, 188, 0.4);
        }
        .doc-upload-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .doc-preview {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          color: #0f172a;
        }
        .doc-preview-name {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .doc-upload-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .doc-upload-remove {
          padding: 6px;
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #991b1b;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }
        .doc-upload-remove:hover {
          background: #fecaca;
        }
        .doc-upload-error {
          padding: 10px 12px;
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          color: #991b1b;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .doc-upload-success {
          padding: 10px 12px;
          background: #dcfce7;
          border: 1px solid #bbf7d0;
          border-radius: 12px;
          color: #166534;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .doc-upload-info {
          font-size: 12px;
          color: #64748b;
          margin-top: 8px;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

      <div className="doc-upload-container">
        <div className="doc-upload-header">
          <FileText className="w-5 h-5" style={{ color: "#4d82bc" }} />
          <h4 className="doc-upload-title">
            Documento {currentFileIndex + 1} de {maxFiles} (Opcional)
          </h4>
        </div>
        <p className="doc-upload-subtitle">
          Puedes subir un documento PDF que respalde tus respuestas (máximo {maxSizeMB}MB)
        </p>

        <div className="doc-upload-area">
          {uploadedFile ? (
            <div className="doc-upload-success">
              <CheckCircle2 className="w-4 h-4" />
              <span>Documento subido: {uploadedFile.nombre || 'documento.pdf'}</span>
            </div>
          ) : file ? (
            <>
              <div className="doc-preview">
                <div className="doc-preview-name">
                  <FileText className="w-4 h-4" style={{ color: "#4d82bc" }} />
                  <span>{preview}</span>
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <div className="doc-upload-actions">
                  <button
                    type="button"
                    className="doc-upload-button"
                    onClick={handleUpload}
                    disabled={isUploading || disabled}
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin" style={{ width: 14, height: 14, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%" }} />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Subir
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="doc-upload-remove"
                    onClick={handleRemove}
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="doc-upload-input-wrapper">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="doc-upload-input"
                id={`doc-upload-${currentFileIndex}`}
                onChange={handleFileSelect}
                disabled={disabled || isUploading}
              />
              <label
                htmlFor={`doc-upload-${currentFileIndex}`}
                className="doc-upload-button"
                style={{ cursor: disabled || isUploading ? 'not-allowed' : 'pointer' }}
              >
                <Upload className="w-4 h-4" />
                Seleccionar PDF
              </label>
            </div>
          )}

          {error && (
            <div className="doc-upload-error">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="doc-upload-info">
            <strong>Requisitos:</strong> Solo PDF, máximo {maxSizeMB}MB por archivo
          </div>
        </div>
      </div>
    </>
  );
}

