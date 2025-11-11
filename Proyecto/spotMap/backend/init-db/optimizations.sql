-- ============================================================================
-- Optimizaciones de Base de Datos - SpotMap
-- Archivo: backend/init-db/optimizations.sql
-- Descripción: Índices, constraints, triggers para mejorar performance
-- ============================================================================

USE spotmap;

-- ============================================================================
-- 1. ÍNDICES
-- ============================================================================

-- Índice en latitud y longitud (búsquedas geoespaciales)
CREATE INDEX idx_lat_lng ON spots(lat, lng);

-- Índice en categoría (filtros)
CREATE INDEX idx_category ON spots(category);

-- Índice en created_at (ordenamiento)
CREATE INDEX idx_created_at ON spots(created_at DESC);

-- Índice compuesto para búsquedas con paginación
CREATE INDEX idx_created_at_id ON spots(created_at DESC, id);

-- ============================================================================
-- 2. CONSTRAINTS
-- ============================================================================

-- Constraint de rango para latitud (-90 a 90)
ALTER TABLE spots 
ADD CONSTRAINT chk_latitude 
CHECK (lat >= -90 AND lat <= 90);

-- Constraint de rango para longitud (-180 a 180)
ALTER TABLE spots 
ADD CONSTRAINT chk_longitude 
CHECK (lng >= -180 AND lng <= 180);

-- Constraint de unicidad para coordenadas (evitar duplicados)
CREATE UNIQUE INDEX unique_coordinates ON spots(lat, lng);

-- Constraint de longitud mínima para título
ALTER TABLE spots 
ADD CONSTRAINT chk_title_length 
CHECK (CHAR_LENGTH(title) >= 1 AND CHAR_LENGTH(title) <= 255);

-- ============================================================================
-- 3. TRIGGERS
-- ============================================================================

-- Trigger: Actualizar updated_at automáticamente
DELIMITER //

CREATE TRIGGER trg_spots_updated_at 
BEFORE UPDATE ON spots 
FOR EACH ROW 
BEGIN
    SET NEW.updated_at = NOW();
END //

DELIMITER ;

-- ============================================================================
-- 4. VISTAS (Para queries comunes)
-- ============================================================================

-- Vista: Spots cercanos a una ubicación (para búsquedas espaciales)
CREATE VIEW v_spots_nearby AS
SELECT 
    id,
    title,
    description,
    lat,
    lng,
    category,
    image_path,
    -- Cálculo de distancia usando fórmula Haversine (aproximado)
    ROUND(111.111 * SQRT(
        POWER(lat - 40.4637, 2) + 
        POWER((lng + 3.7492) * COS(RADIANS(40.4637)), 2)
    ), 2) as distance_km,
    created_at,
    updated_at
FROM spots
WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY created_at DESC;

-- Vista: Estadísticas de spots
CREATE VIEW v_spots_stats AS
SELECT 
    COUNT(*) as total_spots,
    COUNT(DISTINCT category) as unique_categories,
    COUNT(CASE WHEN image_path IS NOT NULL THEN 1 END) as spots_with_images,
    DATE(MIN(created_at)) as first_spot_date,
    DATE(MAX(created_at)) as last_spot_date
FROM spots;

-- Vista: Spots por categoría
CREATE VIEW v_spots_by_category AS
SELECT 
    category,
    COUNT(*) as count,
    GROUP_CONCAT(title SEPARATOR ', ') as spot_titles
FROM spots
WHERE category IS NOT NULL
GROUP BY category
ORDER BY count DESC;

-- ============================================================================
-- 5. PROCEDIMIENTOS ALMACENADOS
-- ============================================================================

-- Procedimiento: Obtener spots por rango de distancia
DELIMITER //

CREATE PROCEDURE sp_get_nearby_spots(
    IN p_lat DECIMAL(10, 6),
    IN p_lng DECIMAL(10, 6),
    IN p_distance_km INT,
    IN p_limit INT
)
BEGIN
    SELECT 
        id,
        title,
        description,
        lat,
        lng,
        category,
        image_path,
        ROUND(111.111 * SQRT(
            POWER(lat - p_lat, 2) + 
            POWER((lng - p_lng) * COS(RADIANS(p_lat)), 2)
        ), 2) as distance_km,
        created_at,
        updated_at
    FROM spots
    WHERE 
        111.111 * SQRT(
            POWER(lat - p_lat, 2) + 
            POWER((lng - p_lng) * COS(RADIANS(p_lat)), 2)
        ) <= p_distance_km
    ORDER BY distance_km ASC
    LIMIT p_limit;
END //

DELIMITER ;

-- Procedimiento: Limpiar spots antiguos
DELIMITER //

CREATE PROCEDURE sp_cleanup_old_spots(
    IN p_days INT
)
BEGIN
    DELETE FROM spots 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL p_days DAY);
END //

DELIMITER ;

-- ============================================================================
-- 6. ANÁLISIS Y VERIFICACIÓN
-- ============================================================================

-- Mostrar información de índices
-- SHOW INDEX FROM spots;

-- Mostrar información de triggers
-- SHOW TRIGGERS;

-- Mostrar información de constraints
-- SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE 
-- FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
-- WHERE TABLE_NAME = 'spots';

-- ============================================================================
-- 7. NOTAS DE PERFORMANCE
-- ============================================================================

/*
RECOMENDACIONES:

1. ÍNDICES:
   - idx_lat_lng: Para búsquedas cercanas por coordenadas
   - idx_category: Para filtros por categoría
   - idx_created_at: Para ordenamiento por fecha
   - unique_coordinates: Evita duplicados de ubicación

2. QUERIES OPTIMIZADAS:
   
   a) Buscar spots cercanos:
      SELECT * FROM v_spots_nearby WHERE distance_km <= 10;
   
   b) Obtener spots por categoría:
      SELECT * FROM spots WHERE category = 'parque' 
      ORDER BY created_at DESC LIMIT 20;
   
   c) Búsqueda con paginación:
      SELECT * FROM spots 
      ORDER BY created_at DESC 
      LIMIT 50 OFFSET 0;

3. MONITOREO:
   - EXPLAIN ANALYZE en queries lentas
   - Revisar size de índices: SELECT * FROM information_schema.STATISTICS;
   - Ejecutar ANALYZE TABLE spots; periódicamente

4. MANTENIMIENTO:
   - OPTIMIZE TABLE spots; cada 3 meses
   - Revisar fragmentación de tabla
   - Backup de BD regularmente

5. ESCALABILIDAD FUTURA:
   - Considerar particionamiento por fecha (PARTITION BY YEAR(created_at))
   - Replicación para multiple readers
   - Caché (Redis) para queries frecuentes
*/
