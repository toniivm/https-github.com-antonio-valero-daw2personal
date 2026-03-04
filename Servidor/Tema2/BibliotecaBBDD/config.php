<?php
// config.php
// Archivo de configuración de la conexión a la base de datos
// [NUEVO CONCEPTO] mysqli procedural (forma básica)
// Datos de conexión (personalizar según XAMPP/WAMP)
$servidor = "localhost"; // servidor MySQL
$usuario = "root"; // usuario (en XAMPP normalmente 'root')
$contrasena = ""; // contraseña (XAMPP suele ser vacía)
$basedatos = "biblioteca"; // base de datos creada antes
// Crear conexión
$conexion = mysqli_connect($servidor, $usuario, $contrasena, $basedatos);
// Comprobar conexión
if (!$conexion) {
 // Si la conexión falla mostramos mensaje (en producción no mostrar detalles)
 die("Error de conexión: " . mysqli_connect_error());
}
// Si llegamos aquí, la conexión fue correcta
?>