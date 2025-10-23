<?php
require_once 'config.php';

// Activar informe de errores de MySQLi (solo en desarrollo)
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    // Conexión a la base de datos
    $db = new mysqli($servidor, $usuario, $contrasena, $basedatos);
    $db->set_charset('utf8mb4');

    // --- BORRADO ---
    if (
        isset($_POST['delete']) &&
        $_POST['delete'] === 'yes' &&
        !empty($_POST['isbn'])
    ) {
        $isbn = trim($_POST['isbn']);

        $stmt = $db->prepare("DELETE FROM libros WHERE isbn = ?");
        if (!$stmt) {
            throw new Exception('Error preparando DELETE: ' . $db->error);
        }

        $stmt->bind_param('s', $isbn);
        $stmt->execute();
        $stmt->close();
    }

    // --- INSERCIÓN ---
    $autor = isset($_POST['autor']) ? trim($_POST['autor']) : '';
    $titulo = isset($_POST['titulo']) ? trim($_POST['titulo']) : '';
    $genero = isset($_POST['genero']) ? trim($_POST['genero']) : '';
    $ano = isset($_POST['anio_publicacion']) ? trim($_POST['anio_publicacion']) : '';
    $isbn = isset($_POST['isbn']) ? trim($_POST['isbn']) : '';

    if ($autor && $titulo && $genero && $ano && $isbn) {
        $ano_int = (int)$ano;
        if ($ano_int <= 0) {
            throw new Exception('Año inválido.');
        }

        $stmt = $db->prepare("
            INSERT INTO libros (autor, titulo, genero, anio_publicacion, isbn)
            VALUES (?, ?, ?, ?, ?)
        ");
        if (!$stmt) {
            throw new Exception('Error preparando INSERT: ' . $db->error);
        }

        $stmt->bind_param('sssis', $autor, $titulo, $genero, $ano_int, $isbn);
        $stmt->execute();
        $stmt->close();
    }

    // --- FORMULARIO HTML ---
    echo <<<HTML
    <!doctype html>
    <html lang="es">
    <head>
        <meta charset="utf-8">
        <title>Gestión de libros</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f9f9f9; }
            h2 { color: #333; }
            form { margin-bottom: 20px; }
            input[type="text"], input[type="number"] {
                padding: 5px; width: 250px; margin: 5px 0;
            }
            input[type="submit"] {
                padding: 6px 12px;
                background: #4CAF50;
                color: white;
                border: none;
                cursor: pointer;
                border-radius: 4px;
            }
            input[type="submit"]:hover {
                background: #45a049;
            }
            hr { border: 1px solid #ccc; }
            .registro { background: white; padding: 10px; border-radius: 5px; margin-bottom: 10px; }
        </style>
    </head>
    <body>
        <h2>Añadir libro</h2>
        <form action="sqltest.php" method="post">
            <label>Autor:</label><br>
            <input type="text" name="autor" required><br>
            <label>Título:</label><br>
            <input type="text" name="titulo" required><br>
            <label>Género:</label><br>
            <input type="text" name="genero" required><br>
            <label>Año:</label><br>
            <input type="number" name="anio_publicacion" required><br>
            <label>ISBN:</label><br>
            <input type="text" name="isbn" required><br><br>
            <input type="submit" value="Añadir libro">
        </form>
        <hr>
        <h2>Listado de libros</h2>
    HTML;

    // --- CONSULTA Y LISTADO ---
    $resultado = $db->query("SELECT autor, titulo, genero, anio_publicacion, isbn FROM libros ORDER BY anio_publicacion DESC");

    while ($row = $resultado->fetch_assoc()) {
        $autor_html = htmlspecialchars($row['autor'], ENT_QUOTES, 'UTF-8');
        $titulo_html = htmlspecialchars($row['titulo'], ENT_QUOTES, 'UTF-8');
        $genero_html = htmlspecialchars($row['genero'], ENT_QUOTES, 'UTF-8');
        $ano_html = htmlspecialchars($row['anio_publicacion'], ENT_QUOTES, 'UTF-8');
        $isbn_html = htmlspecialchars($row['isbn'], ENT_QUOTES, 'UTF-8');

        echo <<<HTML
        <div class="registro">
            <strong>Título:</strong> {$titulo_html}<br>
            <strong>Autor:</strong> {$autor_html}<br>
            <strong>Género:</strong> {$genero_html}<br>
            <strong>Año:</strong> {$ano_html}<br>
            <strong>ISBN:</strong> {$isbn_html}<br>
            <form action="sqltest.php" method="post" onsubmit="return confirm('¿Eliminar este registro?');">
                <input type="hidden" name="delete" value="yes">
                <input type="hidden" name="isbn" value="{$isbn_html}">
                <input type="submit" value="Eliminar registro" style="background:#d9534f;">
            </form>
        </div>
        HTML;
    }

    $resultado->free();
    $db->close();

    echo "</body></html>";

} catch (Exception $e) {
    // Error amigable
    echo "Error: " . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8');
    if (isset($db) && $db instanceof mysqli && $db->ping()) {
        $db->close();
    }
}
?>
