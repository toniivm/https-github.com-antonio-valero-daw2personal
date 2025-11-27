<?php

// Ejercicio 2 — Búsqueda con filtros opcionales (CRM)
// - SQL dinámica solo con filtros presentes
// - Marcadores nombrados + LIKE seguro
// - Orden por facturación DESC y fetchAll(ASSOC)

// Escapa % y _ para LIKE usando ESCAPE '\\'
function like_escape(string $input): string
{
    $input = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $input);
    return $input;
}

function buscarClientes(array $filtros, PDO $pdo): array
{
    if ($pdo->getAttribute(PDO::ATTR_ERRMODE) !== PDO::ERRMODE_EXCEPTION) {
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    $sql = 'SELECT id, nombre, ciudad, fecha_registro, facturacion_anual, activo FROM clientes WHERE 1=1';
    $params = [];

    if (!empty($filtros['nombre'])) {
        $sql .= ' AND nombre LIKE :nombre ESCAPE "\\"';
        $params[':nombre'] = '%' . like_escape((string)$filtros['nombre']) . '%';
    }

    if (array_key_exists('ciudad', $filtros) && $filtros['ciudad'] !== null && $filtros['ciudad'] !== '') {
        $sql .= ' AND ciudad = :ciudad';
        $params[':ciudad'] = (string)$filtros['ciudad'];
    }

    if (!empty($filtros['fecha_desde'])) {
        $sql .= ' AND fecha_registro >= :fecha_desde';
        $params[':fecha_desde'] = (string)$filtros['fecha_desde'];
    }
    if (!empty($filtros['fecha_hasta'])) {
        $sql .= ' AND fecha_registro <= :fecha_hasta';
        $params[':fecha_hasta'] = (string)$filtros['fecha_hasta'];
    }

    if (isset($filtros['facturacion_min']) && $filtros['facturacion_min'] !== null && $filtros['facturacion_min'] !== '') {
        $sql .= ' AND facturacion_anual >= :fact_min';
        $params[':fact_min'] = (float)$filtros['facturacion_min'];
    }
    if (isset($filtros['facturacion_max']) && $filtros['facturacion_max'] !== null && $filtros['facturacion_max'] !== '') {
        $sql .= ' AND facturacion_anual <= :fact_max';
        $params[':fact_max'] = (float)$filtros['facturacion_max'];
    }

    if (array_key_exists('activo', $filtros) && $filtros['activo'] !== null && $filtros['activo'] !== '') {
        $sql .= ' AND activo = :activo';
        $params[':activo'] = (int)$filtros['activo'];
    }

    $sql .= ' ORDER BY facturacion_anual DESC';

    $stmt = $pdo->prepare($sql);
    foreach ($params as $k => $v) {
        if (is_int($v)) {
            $stmt->bindValue($k, $v, PDO::PARAM_INT);
        } else {
            $stmt->bindValue($k, (string)$v, PDO::PARAM_STR);
        }
    }
    $stmt->execute();

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Ejemplo mínimo de uso (comentado):
// $pdo = new PDO('mysql:host=localhost;dbname=test;charset=utf8mb4', 'user', 'pass');
// $filtros = [
//   'nombre' => 'Mar',
//   'ciudad' => null,
//   'fecha_desde' => '2023-01-01',
//   'fecha_hasta' => '2023-12-31',
//   'facturacion_min' => 10000,
//   'activo' => 1,
// ];
// $res = buscarClientes($filtros, $pdo);
// print_r($res);
