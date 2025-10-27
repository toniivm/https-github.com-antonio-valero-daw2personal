<?php
require_once 'login.php';
$db_server = new mysqli($db_hostname, $db_username, $db_password, $db_database);

if ($db_server->connect_error) {
    die("Error de conexión: " . $db_server->connect_error);
}

$query = "CREATE TABLE IF NOT EXISTS pokemon (
    id SMALLINT NOT NULL,
    tipo VARCHAR(32) NOT NULL,
    familia VARCHAR(32) NOT NULL,
    nombre VARCHAR(32) NOT NULL,
    PRIMARY KEY (id)
)";

if ($db_server->query($query) === TRUE) {
    echo "✅ Tabla 'pokemon' creada correctamente.";
} else {
    die("❌ Error al crear la tabla: " . $db_server->error);
}

$db_server->close();
?>
