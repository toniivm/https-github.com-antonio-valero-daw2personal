<?php
require_once 'login.php';
// Conexión a la base de datos utilizando mysqli
$db_server = new mysqli($db_hostname, $db_username, $db_password,
$db_database);
// Verifica si la conexión fue exitosa
if ($db_server->connect_error) {
	die("Error de conexión: " . $db_server->connect_error);
}
// Consulta para describir la estructura de la tabla "pokemon"
$query = "DESCRIBE pokemon";
$result = $db_server->query($query);
// Verifica si la consulta fue exitosa
if (!$result) {
	die("Error al ejecutar la consulta: " . $db_server->error);
}
// Imprimir los resultados en una tabla HTML
echo "<table border='1' cellpadding='5' cellspacing='0'>";
echo "<tr><th>Columna</th><th>Tipo</th><th>Nulo</th><th>Clave</th></tr>";
// Procesar los resultados
while ($row = $result->fetch_assoc()) {
	echo "<tr>";
	echo "<td>" . htmlspecialchars($row['Field']) . "</td>";
	echo "<td>" . htmlspecialchars($row['Type']) . "</td>";
	echo "<td>" . htmlspecialchars($row['Null']) . "</td>";
	echo "<td>" . htmlspecialchars($row['Null']) . "</td>";
	echo "</tr>";
}
echo "</table>";
// Liberar los recursos y cerrar la conexión
$result->free();
$db_server->close();
?>