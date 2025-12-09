<?php

// MEJORA 1: Validación de fechas con formato YYYY-MM-DD

function validarFecha($fecha) {
    if (empty($fecha)) return true; // Filtro opcional
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
        // Verificar que es una fecha válida
        $d = explode('-', $fecha);
        if (checkdate($d[1], $d[2], $d[0])) {
            return true;
        }
    }
    return false;
}

function buscarClientesConValidacion(array $filtros, PDO $pdo) {
    if ($pdo->getAttribute(PDO::ATTR_ERRMODE) !== PDO::ERRMODE_EXCEPTION) {
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    // Validar fechas si están presentes
    if (!empty($filtros['fecha_desde']) && !validarFecha($filtros['fecha_desde'])) {
        throw new InvalidArgumentException('fecha_desde debe estar en formato YYYY-MM-DD');
    }
    if (!empty($filtros['fecha_hasta']) && !validarFecha($filtros['fecha_hasta'])) {
        throw new InvalidArgumentException('fecha_hasta debe estar en formato YYYY-MM-DD');
    }

    // Validar rango: desde no puede ser mayor que hasta
    if (!empty($filtros['fecha_desde']) && !empty($filtros['fecha_hasta'])) {
        if ($filtros['fecha_desde'] > $filtros['fecha_hasta']) {
            throw new InvalidArgumentException('fecha_desde no puede ser mayor que fecha_hasta');
        }
    }

    // Validar facturación: min no puede ser mayor que max
    if (isset($filtros['facturacion_min']) && isset($filtros['facturacion_max'])) {
        if ((float)$filtros['facturacion_min'] > (float)$filtros['facturacion_max']) {
            throw new InvalidArgumentException('facturacion_min no puede ser mayor que facturacion_max');
        }
    }

    // Resto igual al ejercicio 2 original...
    $sql = 'SELECT id, nombre, ciudad, fecha_registro, facturacion_anual, activo FROM clientes WHERE 1=1';
    $params = [];

    if (!empty($filtros['nombre'])) {
        $sql .= ' AND nombre LIKE :nombre ESCAPE "\\"';
        $params[':nombre'] = '%' . like_escape((string)$filtros['nombre']) . '%';
    }

    // ... resto de filtros

    $sql .= ' ORDER BY facturacion_anual DESC';
    $stmt = $pdo->prepare($sql);
    foreach ($params as $k => $v) {
        $stmt->bindValue($k, is_int($v) ? $v : (string)$v, is_int($v) ? PDO::PARAM_INT : PDO::PARAM_STR);
    }
    $stmt->execute();

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function like_escape(string $input): string {
    return str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $input);
}
