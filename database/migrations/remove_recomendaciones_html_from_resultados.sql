-- Script SQL para eliminar columnas Recomendaciones y HTML de la tabla Resultados
-- Ejecuta este script en SQL Server Management Studio

USE [db_ac0a9d_governanzaia]
GO

-- Verificar y eliminar columna HTML si existe
IF EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Resultados' 
    AND COLUMN_NAME = 'HTML'
)
BEGIN
    ALTER TABLE [dbo].[Resultados]
    DROP COLUMN [HTML];
    
    PRINT 'Columna HTML eliminada exitosamente de la tabla Resultados';
END
ELSE
BEGIN
    PRINT 'La columna HTML no existe en la tabla Resultados';
END
GO

-- Verificar y eliminar columna Recomendaciones si existe
IF EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Resultados' 
    AND COLUMN_NAME = 'Recomendaciones'
)
BEGIN
    ALTER TABLE [dbo].[Resultados]
    DROP COLUMN [Recomendaciones];
    
    PRINT 'Columna Recomendaciones eliminada exitosamente de la tabla Resultados';
END
ELSE
BEGIN
    PRINT 'La columna Recomendaciones no existe en la tabla Resultados';
END
GO

-- Verificar estructura final de la tabla
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Resultados'
ORDER BY ORDINAL_POSITION;
GO

