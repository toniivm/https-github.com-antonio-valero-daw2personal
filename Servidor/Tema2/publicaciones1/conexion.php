<?php
require_once 'login.php';

// Conexión a MySQL
$db_server = new mysqli($db_hostname, $db_username, $db_password, $db_database);

// Verificar conexión
if ($db_server->connect_error) {
    die("No se puede conectar a MySQL: " . $db_server->connect_error);
}
?>
