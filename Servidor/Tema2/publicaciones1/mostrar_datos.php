<?php
require_once 'conexion.php';

// Consulta a la base de datos
$query = "SELECT * FROM tabla";
$resultado = $db_server->query($query);

if (!$resultado) {
    die("Error en la consulta: " . $db_server->error);
}

// Mostrar resultados
while ($row = $resultado->fetch_assoc()) {
    echo '<h3>Autor: ' . htmlspecialchars($row['autor']) . '</h3>';
    echo 'Título: ' . htmlspecialchars($row['titulo']) . '<br>';
    echo 'Categoría: ' . htmlspecialchars($row['categoria']) . '<br>';
    echo 'Año: ' . htmlspecialchars($row['año']) . '<br>';
    echo 'ISBN: ' . htmlspecialchars($row['isbn']) . '<hr>';
}

// Cerrar conexión
$db_server->close();
?>
