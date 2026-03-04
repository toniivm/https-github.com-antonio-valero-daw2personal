-- Base de datos para ejercicios PDO
-- Importar este archivo en phpMyAdmin

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS empresa_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE empresa_db;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de cuentas (para transacciones)
CREATE TABLE IF NOT EXISTS cuentas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titular VARCHAR(100) NOT NULL,
    saldo DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    fecha_apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar datos de prueba
-- Usuarios de ejemplo
INSERT INTO usuarios (nombre, email) VALUES 
('Juan Pérez', 'juan@example.com'),
('María García', 'maria@example.com'),
('Carlos López', 'carlos@example.com');

-- Productos de ejemplo
INSERT INTO productos (nombre, precio, stock) VALUES 
('Laptop HP', 599.99, 15),
('Mouse Logitech', 25.50, 50),
('Teclado Mecánico', 89.99, 30),
('Monitor Samsung', 199.99, 20),
('Webcam HD', 45.00, 25),
('Auriculares Sony', 79.99, 40);

-- Cuentas de ejemplo con saldo
INSERT INTO cuentas (titular, saldo) VALUES 
('Antonio Valero', 1000.00),
('Laura Martínez', 500.00),
('Pedro Sánchez', 750.00);
