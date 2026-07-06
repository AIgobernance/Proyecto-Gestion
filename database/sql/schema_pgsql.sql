-- Schema for PostgreSQL - Proyecto-Gestion
-- This file is adapted from the SQL Server version to be fully compatible with PostgreSQL/Neon.

-- Table: usuario
CREATE TABLE IF NOT EXISTS "usuario" (
    "Id" SERIAL PRIMARY KEY,
    "Nombre_Usuario" VARCHAR(150) NOT NULL,
    "Empresa" VARCHAR(200) NULL,
    "NIT" VARCHAR(50) NULL,
    "Tipo_Documento" VARCHAR(20) NULL,
    "Numero_Documento" VARCHAR(50) NULL,
    "Sector" VARCHAR(100) NULL,
    "Pais" VARCHAR(100) NULL,
    "Correo" VARCHAR(255) NOT NULL UNIQUE,
    "Telefono" VARCHAR(30) NULL,
    "Contrasena" VARCHAR(255) NOT NULL,
    "Rol" VARCHAR(20) NOT NULL DEFAULT 'usuario' CHECK ("Rol" IN ('usuario', 'admin')),
    "Activate" VARCHAR(5) NOT NULL DEFAULT 'False' CHECK ("Activate" IN ('True', 'False')),
    "FechaCrea" TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    "Fecha_Actualizacion" TIMESTAMP NULL,
    "Fecha_Ultima_Conexion" TIMESTAMP NULL,
    "Foto_Perfil" VARCHAR(500) NULL
);

-- Table: Evaluacion
CREATE TABLE IF NOT EXISTS "Evaluacion" (
    "Id_Evaluacion" SERIAL PRIMARY KEY,
    "Id_Usuario" INT NOT NULL REFERENCES "usuario" ("Id") ON DELETE CASCADE,
    "Fecha" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Tiempo" DECIMAL(10,2) NULL,
    "Puntuacion" DECIMAL(10,2) NULL,
    "Nombre" VARCHAR(200) NULL,
    "Marco" VARCHAR(150) NULL,
    "Framework" VARCHAR(150) NULL,
    "Estado" VARCHAR(50) NULL DEFAULT 'En proceso',
    "PDF_Path" VARCHAR(500) NULL
);

CREATE INDEX IF NOT EXISTS "IX_Evaluacion_Id_Usuario" ON "Evaluacion" ("Id_Usuario");
CREATE INDEX IF NOT EXISTS "IX_Evaluacion_Fecha" ON "Evaluacion" ("Fecha" DESC);

-- Table: Respuestas
CREATE TABLE IF NOT EXISTS "Respuestas" (
    "Id_Respuesta" SERIAL PRIMARY KEY,
    "Id_Evaluacion" INT NOT NULL REFERENCES "Evaluacion" ("Id_Evaluacion") ON DELETE CASCADE,
    "Id_Pregunta" INT NOT NULL,
    "Respuesta_Usuario" TEXT NOT NULL,
    "Fecha_Creacion" TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    "Fecha_Actualizacion" TIMESTAMP NULL,
    UNIQUE ("Id_Evaluacion", "Id_Pregunta")
);

CREATE INDEX IF NOT EXISTS "IX_Respuestas_Id_Evaluacion" ON "Respuestas" ("Id_Evaluacion");

-- Table: Resultados
CREATE TABLE IF NOT EXISTS "Resultados" (
    "Id_Resultado" SERIAL PRIMARY KEY,
    "Id_Evaluacion" INT NOT NULL UNIQUE REFERENCES "Evaluacion" ("Id_Evaluacion") ON DELETE CASCADE,
    "Resultado" TEXT NULL,
    "Puntuacion" DECIMAL(10,2) NULL,
    "PDF_Path" VARCHAR(500) NULL,
    "Fecha_Creacion" TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: Documentos_Adjuntos
CREATE TABLE IF NOT EXISTS "Documentos_Adjuntos" (
    "Id_Documento" SERIAL PRIMARY KEY,
    "Id_Evaluacion" INT NOT NULL REFERENCES "Evaluacion" ("Id_Evaluacion") ON DELETE CASCADE,
    "Nombre_Archivo" VARCHAR(500) NOT NULL,
    "Tipo" VARCHAR(20) NOT NULL DEFAULT 'pdf',
    "Fecha_Creacion" TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "IX_Documentos_Adjuntos_Id_Evaluacion" ON "Documentos_Adjuntos" ("Id_Evaluacion");
