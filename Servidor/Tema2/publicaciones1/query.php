<?php
// query.php
// Muestra el contenido de una tabla MySQL en una tabla HTML.
// Requiere que 'login.php' defina las variables:
//   $db_hostname, $db_username, $db_password, $db_database

require_once 'login.php';

// Conectar a la base de datos MySQL.
// mysqli_connect devuelve un objeto conexión o false si falla.
$db_server = mysqli_connect($db_hostname, $db_username, $db_password, $db_database);
if (!$db_server) {
    // Si falla la conexión, mostrar el error y detener el script.
    die("No se puede conectar con MySQL: " . mysqli_connect_error());
}

// Consulta SQL: cambiar "tabla" por el nombre real de la tabla que quieras mostrar.
$query = "SELECT * FROM tabla";
$resultado = mysqli_query($db_server, $query);
if (!$resultado) {
    // Si la consulta falla, mostrar el error de MySQL y detener.
    die("Error al acceder a la base de datos: " . mysqli_error($db_server));
}

// Cabecera de la tabla HTML
echo "<h2>Resultados de la tabla</h2>";
echo "<table border='1' cellpadding='8' cellspacing='0'>";
echo "<tr style='background-color:#ccc; font-weight:bold;'>";

// Obtener nombres de columnas automáticamente desde los metadatos del resultado.
// mysqli_fetch_fields devuelve un array de objetos; cada objeto tiene la propiedad 'name'.
$campos = mysqli_fetch_fields($resultado);
foreach ($campos as $campo) {
    // htmlspecialchars evita que se inyecte HTML/JS en los nombres de columna.
    echo "<th>" . htmlspecialchars($campo->name) . "</th>";
}
echo "</tr>";

// Mostrar cada fila como una fila <tr> con celdas <td>.
// mysqli_fetch_assoc devuelve un array asociativo (nombre_columna => valor).
while ($fila = mysqli_fetch_assoc($resultado)) {
    echo "<tr>";
    foreach ($fila as $valor) {
        // Escapar los valores con htmlspecialchars para prevenir XSS.
        echo "<td>" . htmlspecialchars((string)$valor) . "</td>";
    }
    echo "</tr>";
}

echo "</table>";

// Liberar recursos y cerrar la conexión.
mysqli_free_result($resultado);
mysqli_close($db_server);
?>
