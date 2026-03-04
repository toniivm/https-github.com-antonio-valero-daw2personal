<?php
require_once 'login.php';
// Conexión a la base de datos utilizando mysqli
$db_server = new mysqli($db_hostname, $db_username, $db_password, $db_database);
// Verificar si la conexión fue exitosa
if ($db_server->connect_error) {
    die("No puede conectar con MySQL: " . $db_server->connect_error);
}
// Consulta para seleccionar todos los registros de la tabla "pokemon"
$query = "SELECT * FROM pokemon";
$result = $db_server->query($query);
// Verificar si la consulta fue exitosa
if (!$result) {
    die("Fallo en acceso a la base de datos: " . $db_server->error);
}
// Obtener el número de filas
$rows = $result->num_rows;
// Imprimir los resultados en una tabla HTML
echo "<table border='1'>";
echo "<tr><th>Id</th><th>Tipo</th><th>Familia</th><th>Nombre</th></tr>";
for ($j = 0; $j < $rows; ++$j) {
    $row = $result->fetch_row(); // Obtener la fila como un array
    echo "<tr>";
    for ($k = 0; $k < 4; ++$k) {
        echo "<td>" . htmlspecialchars($row[$k]) . "</td>"; // Escapar caracteres especiales
    }
    echo "</tr>";
}
echo "</table>";
// Liberar los recursos y cerrar la conexión
$result->free();
$db_server->close();
?>
