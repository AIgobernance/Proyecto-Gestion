-- Script SQL para agregar columna PDF_Path a la tabla Resultados
-- Ejecuta este script en SQL Server Management Studio

USE [db_ac0a9d_governanzaia]
GO

-- Verificar si la columna PDF_Path existe, si no existe, crearla
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Resultados' 
    AND COLUMN_NAME = 'PDF_Path'
)
BEGIN
    ALTER TABLE [dbo].[Resultados]
    ADD [PDF_Path] NVARCHAR(500) NULL;
    
    PRINT 'Columna PDF_Path agregada exitosamente a la tabla Resultados';
END
ELSE
BEGIN
    PRINT 'La columna PDF_Path ya existe en la tabla Resultados';
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

