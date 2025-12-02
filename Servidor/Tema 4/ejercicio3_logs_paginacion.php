<?php

// Ejercicio 3 — Paginación de Logs (Panel administrativo)
// Requisitos:
// - LIMIT y OFFSET con bindValue + PARAM_INT
// - Calcular total de páginas con COUNT(*)
// - Devolver array con totalRegistros, totalPaginas, paginaActual, datos
// - Evitar fetchAll si $porPagina es grande (usar fetch iterativo)

function obtenerLogsPaginados($pagina, $porPagina, PDO $pdo)
{
    // Asegurar modo excepción en PDO
    if ($pdo->getAttribute(PDO::ATTR_ERRMODE) !== PDO::ERRMODE_EXCEPTION) {
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    $pagina = max(1, (int)$pagina);
    $porPagina = max(1, (int)$porPagina);

    // Contar total de registros
    $total = (int)$pdo->query('SELECT COUNT(*) FROM logs')->fetchColumn();
    $totalPaginas = (int)ceil($total / $porPagina);

    // Calcular offset
    $offset = ($pagina - 1) * $porPagina;

    // Consulta con LIMIT y OFFSET
    $sql = 'SELECT id, usuario, accion, fecha FROM logs ORDER BY fecha DESC LIMIT :limit OFFSET :offset';
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':limit', $porPagina, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    // Fetch iterativo para evitar problemas con páginas muy grandes
    $datos = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $datos[] = $row;
    }

    return [
        'totalRegistros' => $total,
        'totalPaginas' => $totalPaginas,
        'paginaActual' => $pagina,
        'datos' => $datos
    ];
}

// Ejemplo de uso como API JSON (comentado):
// header('Content-Type: application/json');
// $pdo = new PDO('mysql:host=localhost;dbname=test;charset=utf8mb4', 'root', '');
// $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
// $pagina = isset($_GET['page']) ? (int)$_GET['page'] : 1;
// $porPagina = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 20;
// $resultado = obtenerLogsPaginados($pagina, $porPagina, $pdo);
// echo json_encode($resultado, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
