<?php

$pdo = require __DIR__ . '/../config.php';
require __DIR__ . '/../ejercicio4_usuarios.php';

// Generar email único para la prueba
$email = 'prueba_' . uniqid() . '@ejemplo.com';
$password = 'MiPassword123!';

try {
    // Registrar usuario
    $userId = registrarUsuario($email, $password, $pdo);
    echo "Usuario registrado correctamente\n";
    echo "ID: $userId\n";
    echo "Email: $email\n\n";

    // Probar login correcto
    $loginCorrecto = loginUsuario($email, $password, $pdo);
    echo "Login con contraseña correcta: " . ($loginCorrecto ? "OK" : "FAIL") . "\n";

    // Probar login incorrecto
    $loginIncorrecto = loginUsuario($email, 'PasswordIncorrecta', $pdo);
    echo "Login con contraseña incorrecta: " . ($loginIncorrecto ? "OK" : "FAIL") . "\n";

} catch (Exception $e) {
    http_response_code(500);
    echo "Error: " . $e->getMessage();
}
