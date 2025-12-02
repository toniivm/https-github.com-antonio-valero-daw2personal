-- Datos de ejemplo mínimos para probar

-- Productos
INSERT INTO productos (nombre, stock, precio) VALUES
 ('Camiseta', 100, 19.90),
 ('Pantalón', 50, 39.90),
 ('Zapatos', 20, 59.90)
;

-- Clientes
INSERT INTO clientes (nombre, ciudad, fecha_registro, facturacion_anual, activo) VALUES
 ('María López', 'Madrid', '2023-02-10', 15000.00, 1),
 ('Marco Ruiz', 'Sevilla', '2023-06-21', 28000.00, 1),
 ('Ana Pérez', 'Valencia', '2022-11-03', 8000.00, 0)
;

-- Logs (para ejercicio 3)
INSERT INTO logs (usuario, accion) VALUES
 ('admin', 'Inicio de sesión'),
 ('admin', 'Creó producto nuevo'),
 ('usuario1', 'Modificó su perfil'),
 ('soporte', 'Cerró ticket #145'),
 ('ventas', 'Exportó informe mensual')
;