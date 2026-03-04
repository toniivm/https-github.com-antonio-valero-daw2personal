<?php

// MEJORA 2: Añadir paginación a la búsqueda

function buscarClientesConPaginacion(array $filtros, PDO $pdo) {
    if ($pdo->getAttribute(PDO::ATTR_ERRMODE) !== PDO::ERRMODE_EXCEPTION) {
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    // Parámetros de paginación
    $pagina = isset($filtros['pagina']) ? max(1, (int)$filtros['pagina']) : 1;
    $porPagina = isset($filtros['por_pagina']) ? max(1, (int)$filtros['por_pagina']) : 20;

    // Base del SQL
    $sql = 'SELECT id, nombre, ciudad, fecha_registro, facturacion_anual, activo FROM clientes WHERE 1=1';
    $params = [];

    // Aplicar filtros (igual que antes)
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

    // 1. Contar total de registros
    $sqlCount = preg_replace('/SELECT .* FROM/', 'SELECT COUNT(*) FROM', $sql);
    $stmtCount = $pdo->prepare($sqlCount);
    foreach ($params as $k => $v) {
        $stmtCount->bindValue($k, $v, is_int($v) ? PDO::PARAM_INT : PDO::PARAM_STR);
    }
    $stmtCount->execute();
    $total = (int)$stmtCount->fetchColumn();

    // 2. Añadir ORDER BY y LIMIT/OFFSET
    $sql .= ' ORDER BY facturacion_anual DESC';
    $offset = ($pagina - 1) * $porPagina;
    $sql .= ' LIMIT :limit OFFSET :offset';
    $params[':limit'] = $porPagina;
    $params[':offset'] = $offset;

    // 3. Ejecutar query con paginación
    $stmt = $pdo->prepare($sql);
    foreach ($params as $k => $v) {
        if ($k === ':limit' || $k === ':offset') {
            $stmt->bindValue($k, $v, PDO::PARAM_INT);
        } else {
            $stmt->bindValue($k, $v, is_int($v) ? PDO::PARAM_INT : PDO::PARAM_STR);
        }
    }
    $stmt->execute();

    $datos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $totalPaginas = (int)ceil($total / $porPagina);

    // Devolver estructura con metadatos
    return [
        'paginacion' => [
            'pagina_actual' => $pagina,
            'total_paginas' => $totalPaginas,
            'por_pagina' => $porPagina,
            'total_registros' => $total,
            'desde_registro' => ($pagina - 1) * $porPagina + 1,
            'hasta_registro' => min($pagina * $porPagina, $total)
        ],
        'datos' => $datos
    ];
}

function like_escape(string $input): string {
    return str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $input);
}

// Ejemplo de uso:
/*
$pdo = new PDO('mysql:host=localhost;dbname=test;charset=utf8mb4', 'root', '');
$filtros = [
    'nombre' => 'Mar',
    'pagina' => 1,
    'por_pagina' => 10
];
$resultado = buscarClientesConPaginacion($filtros, $pdo);
echo json_encode($resultado, JSON_PRETTY_PRINT);

// Output:
{
  "paginacion": {
    "pagina_actual": 1,
    "total_paginas": 2,
    "por_pagina": 10,
    "total_registros": 15,
    "desde_registro": 1,
    "hasta_registro": 10
  },
  "datos": [...]
}
*/
