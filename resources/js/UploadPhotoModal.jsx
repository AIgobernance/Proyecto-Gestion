import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { Input } from "../ui/input";
import axios from "axios";
import { Upload, X } from "lucide-react";

export function UploadPhotoModal({ open, onOpenChange, userId, onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validar tipo de archivo
      if (!selectedFile.type.startsWith('image/')) {
        setError("Por favor seleccione una imagen");
        return;
      }
      
      // Validar tamaño (máximo 2MB)
      if (selectedFile.size > 2 * 1024 * 1024) {
        setError("La imagen no debe superar los 2MB");
        return;
      }

      setFile(selectedFile);
      setError("");

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor seleccione una imagen");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = document.head?.querySelector('meta[name="csrf-token"]');
      if (token) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
      }

      const formData = new FormData();
      formData.append('foto', file);

      const axiosClient = window.axios || axios;
      const response = await axiosClient.post(`/admin/users/${userId}/upload-photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        if (onSuccess) {
          onSuccess(response.data.foto);
        }
        handleClose();
      }
    } catch (error) {
      console.error('Error al subir foto:', error);
      if (error.response && error.response.data) {
        const responseData = error.response.data;
        if (responseData.errors) {
          const errorMessages = Object.values(responseData.errors).flat();
          setError(errorMessages.join(', ') || responseData.message || "Error al subir la foto");
        } else {
          setError(responseData.message || "Error al subir la foto");
        }
      } else {
        setError("Error de conexión. Verifica tu conexión a internet.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[500px] p-0">
        <DialogTitle className="sr-only">Subir foto de perfil</DialogTitle>
        <DialogDescription className="sr-only">Seleccione una imagen para el perfil del usuario</DialogDescription>

        <div style={{padding:24}}>
          <h2 style={{margin:0,marginBottom:20,color:"#173b8f",fontWeight:900,fontSize:20}}>
            Subir foto de perfil
          </h2>

          {preview && (
            <div style={{marginBottom:20,textAlign:"center"}}>
              <img 
                src={preview} 
                alt="Preview" 
                style={{
                  width:150,
                  height:150,
                  borderRadius:"50%",
                  objectFit:"cover",
                  border:"3px solid #4d82bc",
                  margin:"0 auto"
                }}
              />
            </div>
          )}

          <div style={{marginBottom:20}}>
            <label 
              htmlFor="photo-upload"
              style={{
                display:"flex",
                flexDirection:"column",
                alignItems:"center",
                justifyContent:"center",
                padding:40,
                border:"2px dashed #4d82bc",
                borderRadius:12,
                cursor:"pointer",
                background:preview ? "#f6f9ff" : "#fff",
                transition:"all 0.2s"
              }}
            >
              <Upload className="w-8 h-8" style={{color:"#4d82bc",marginBottom:10}} />
              <span style={{color:"#173b8f",fontWeight:700}}>
                {file ? "Cambiar imagen" : "Seleccionar imagen"}
              </span>
              <span style={{color:"#64748b",fontSize:12,marginTop:4}}>
                JPG, PNG o GIF (máx. 2MB)
              </span>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{display:"none"}}
              />
            </label>
          </div>

          {error && (
            <div style={{
              padding:12,
              marginBottom:12,
              background:"#ffefef",
              border:"1px solid #a11a1a",
              borderRadius:8,
              color:"#a11a1a"
            }}>
              {error}
            </div>
          )}

          <div style={{display:"flex",justifyContent:"flex-end",gap:10}}>
            <button
              onClick={handleClose}
              style={{
                background:"#fff",
                border:"1px solid #cfd7e6",
                color:"#0f172a",
                borderRadius:999,
                padding:"10px 18px",
                fontWeight:800,
                cursor:"pointer"
              }}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              style={{
                background:loading || !file ? "#ccc" : "linear-gradient(90deg,#4d82bc,#5a8fc9)",
                color:"#fff",
                border:"none",
                borderRadius:999,
                padding:"10px 18px",
                fontWeight:800,
                cursor:loading || !file ? "not-allowed" : "pointer",
                display:"inline-flex",
                alignItems:"center",
                gap:8
              }}
            >
              {loading ? "Subiendo..." : "Subir"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

