CREATE DATABASE IF NOT EXISTS spotmap CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE spotmap;

CREATE TABLE IF NOT EXISTS spots (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  lat DOUBLE NOT NULL,
  lng DOUBLE NOT NULL,
  tags JSON NULL,
  category VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- índice geoespacial simple (lat/lng separados; para búsquedas por distancia en SQL puedes usar fórmulas Haversine)
CREATE INDEX idx_lat ON spots(lat);
CREATE INDEX idx_lng ON spots(lng);
