<?php

// MEJORA 3: Permitir orden dinámico y seguro

function buscarClientesConOrdenDinamico(array $filtros, PDO $pdo) {
    if ($pdo->getAttribute(PDO::ATTR_ERRMODE) !== PDO::ERRMODE_EXCEPTION) {
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    // Parámetros de orden
    $orderBy = $filtros['order_by'] ?? 'facturacion_anual';
    $orderDir = strtoupper($filtros['order_dir'] ?? 'DESC');

    // WHITELIST: solo columnas permitidas (seguridad)
    $columnasValidas = ['id', 'nombre', 'ciudad', 'fecha_registro', 'facturacion_anual', 'activo'];
    if (!in_array($orderBy, $columnasValidas)) {
        throw new InvalidArgumentException("Columna '$orderBy' no válida. Válidas: " . implode(', ', $columnasValidas));
    }

    // WHITELIST: solo ASC/DESC
    if (!in_array($orderDir, ['ASC', 'DESC'])) {
        throw new InvalidArgumentException("Dirección '$orderDir' no válida. Usa: ASC o DESC");
    }

    // Base del SQL
    $sql = 'SELECT id, nombre, ciudad, fecha_registro, facturacion_anual, activo FROM clientes WHERE 1=1';
    $params = [];

    // Aplicar filtros
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

    // Orden DINÁMICO (después de validar)
    $sql .= " ORDER BY $orderBy $orderDir";

    $stmt = $pdo->prepare($sql);
    foreach ($params as $k => $v) {
        $stmt->bindValue($k, $v, is_int($v) ? PDO::PARAM_INT : PDO::PARAM_STR);
    }
    $stmt->execute();

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function like_escape(string $input): string {
    return str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $input);
}

// Ejemplos de uso:
/*
$pdo = new PDO('mysql:host=localhost;dbname=test;charset=utf8mb4', 'root', '');

// Ordenar por nombre (ASC)
$filtros = ['order_by' => 'nombre', 'order_dir' => 'ASC'];
$resultado = buscarClientesConOrdenDinamico($filtros, $pdo);

// Ordenar por fecha de registro (DESC) - más recientes primero
$filtros = ['order_by' => 'fecha_registro', 'order_dir' => 'DESC'];
$resultado = buscarClientesConOrdenDinamico($filtros, $pdo);

// Ordenar por facturación (ya es el default DESC)
$filtros = [];
$resultado = buscarClientesConOrdenDinamico($filtros, $pdo);

// ERROR: columna inválida
$filtros = ['order_by' => 'password'];
$resultado = buscarClientesConOrdenDinamico($filtros, $pdo);  // ❌ InvalidArgumentException

// ERROR: dirección inválida
$filtros = ['order_dir' => 'RANDOM'];
$resultado = buscarClientesConOrdenDinamico($filtros, $pdo);  // ❌ InvalidArgumentException
*/
