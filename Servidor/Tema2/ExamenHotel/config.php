<?php
// config.php
$servidor = "localhost";
$usuario = "root";
$contrasena = ""; 
$basedatos = "hotel"; 

// Crear conexión
$conexion = mysqli_connect($servidor, $usuario, $contrasena, $basedatos);

// Comprobar conexión
if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}
?>