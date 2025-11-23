-- Script SQL para agregar columna HTML a la tabla Resultados
-- Ejecuta este script en SQL Server Management Studio

USE [db_ac0a9d_governanzaia]
GO

-- Verificar si la columna HTML existe, si no existe, crearla
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Resultados' 
    AND COLUMN_NAME = 'HTML'
)
BEGIN
    ALTER TABLE [dbo].[Resultados]
    ADD [HTML] NVARCHAR(MAX) NULL;
    
    PRINT 'Columna HTML agregada exitosamente a la tabla Resultados';
END
ELSE
BEGIN
    PRINT 'La columna HTML ya existe en la tabla Resultados';
END
GO

-- Verificar si la columna Puntuacion existe en la tabla Resultados (opcional)
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Resultados' 
    AND COLUMN_NAME = 'Puntuacion'
)
BEGIN
    ALTER TABLE [dbo].[Resultados]
    ADD [Puntuacion] DECIMAL(5,2) NULL;
    
    PRINT 'Columna Puntuacion agregada exitosamente a la tabla Resultados';
END
ELSE
BEGIN
    PRINT 'La columna Puntuacion ya existe en la tabla Resultados';
END
GO

-- Verificar estructura final
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Resultados'
ORDER BY ORDINAL_POSITION;
GO

