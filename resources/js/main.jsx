import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app.jsx"; // ⬅️ tu componente de rutas
import "../css/app.css";
const el = document.getElementById("root"); // ⬅️ coincide con tu Blade
if (el) {
  createRoot(el).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  console.error("No se encontró #root para montar React");
}
