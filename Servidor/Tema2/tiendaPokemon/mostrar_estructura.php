<?php
require_once 'login.php';
$db_server = new mysqli($db_hostname, $db_username, $db_password, $db_database);

$query = "SELECT * FROM pokemon";
$result = $db_server->query($query);

echo "<h3>Listado de Pokémon</h3>";
if ($result->num_rows === 0) {
    echo "⚠️ No hay datos en la tabla.";
} else {
    echo "<table border='1'><tr><th>ID</th><th>Tipo</th><th>Familia</th><th>Nombre</th></tr>";
    while ($row = $result->fetch_row()) {
        echo "<tr>";
        foreach ($row as $dato) {
            echo "<td>" . htmlspecialchars($dato) . "</td>";
        }
        echo "</tr>";
    }
    echo "</table>";
}

$result->free();
$db_server->close();
?>
