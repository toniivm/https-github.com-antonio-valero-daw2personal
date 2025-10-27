<?php
require_once 'login.php';
$db_server = new mysqli($db_hostname, $db_username, $db_password, $db_database);

$query = "DESCRIBE pokemon";
$result = $db_server->query($query);

echo "<h3>Estructura de la tabla 'pokemon'</h3>";
echo "<table border='1'><tr><th>Columna</th><th>Tipo</th><th>Nulo</th><th>Clave</th></tr>";

while ($row = $result->fetch_assoc()) {
    echo "<tr>";
    echo "<td>" . htmlspecialchars($row['Field']) . "</td>";
    echo "<td>" . htmlspecialchars($row['Type']) . "</td>";
    echo "<td>" . htmlspecialchars($row['Null']) . "</td>";
    echo "<td>" . htmlspecialchars($row['Key']) . "</td>";
    echo "</tr>";
}

echo "</table>";
$result->free();
$db_server->close();
?>
