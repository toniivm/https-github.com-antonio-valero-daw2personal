<?php
// session_start_config.php
// Debe incluirse en la parte superior de todas las páginas, antes de cualquier salida.

ini_set('session.use_strict_mode', 1); // evita que PHP acepte IDs de sesión no existentes
ini_set('session.cookie_httponly', 1); // por si acaso (refuerzo)
ini_set('session.use_only_cookies', 1); // evita usar SID en URL

$cookieParams = session_get_cookie_params();
$secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'); // true si HTTPS activo

session_set_cookie_params([
  'lifetime' => $cookieParams['lifetime'],
  'path'     => $cookieParams['path'],
  'domain'   => $cookieParams['domain'],
  'secure'   => $secure,
  'httponly' => true,
  'samesite' => 'Lax' // o 'Strict' si no necesitas cross-site navegations
]);

session_start();
