<?php
$nombre = $_GET['nombre'];
$apellido1 = $_GET['apellido1'];    
$nombrecompleto = $nombre . " " . $apellido1;
echo "Hola $nombrecompleto, bienvenido a PHP";?>