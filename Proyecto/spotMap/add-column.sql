-- Script SQL para agregar columna image_path_2
-- Ejecuta esto en phpMyAdmin o en la consola MySQL

USE spotmap;

-- Verificar si la columna existe
SELECT COUNT(*) as existe 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'spotmap' 
  AND TABLE_NAME = 'spots' 
  AND COLUMN_NAME = 'image_path_2';

-- Si el resultado es 0, ejecuta esto:
ALTER TABLE spots ADD COLUMN image_path_2 TEXT AFTER image_path;

-- Verificar estructura final
DESCRIBE spots;
