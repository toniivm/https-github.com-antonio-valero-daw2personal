<?php
// logout.php
require 'session_start_config.php';

// limpiar variables de sesión
$_SESSION = [];

// eliminar cookie de sesión (usando parámetros actuales)
$params = session_get_cookie_params();
setcookie(
  session_name(),
  '',
  time() - 42000,
  $params['path'],
  $params['domain'],
  $params['secure'],
  $params['httponly']
);

// destruir sesión en server
session_destroy();

echo 'Sesión cerrada';
