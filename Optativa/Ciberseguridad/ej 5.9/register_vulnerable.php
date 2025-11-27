<?php
// config / conexión PDO (ejemplo)
$dsn = 'mysql:host=localhost;dbname=testdb;charset=utf8mb4';
$user = 'root';
$pass = '...';
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_EMULATE_PREPARES => false,
];
$pdo = new PDO($dsn, $user, $pass, $options);

// Obtener entradas
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';

// Normalizar email
$email = mb_strtolower($email, 'UTF-8');

// Validación email
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    exit('Email inválido');
}
// Longitud razonable (por ejemplo 254 es el máximo teórico para un email)
if (mb_strlen($email) > 254) {
    http_response_code(400);
    exit('Email demasiado largo');
}

// Validación teléfono (E.164: +{country}{number}, entre 2 y 15 dígitos tras el prefijo)
// Permitir vacío si el teléfono es opcional
if ($phone !== '') {
    // quitar espacios y guiones comunes
    $phoneNormalized = preg_replace('/[ \-().]/', '', $phone);
    if (!preg_match('/^\+?[1-9]\d{1,14}$/', $phoneNormalized)) {
        http_response_code(400);
        exit('Teléfono inválido. Use formato internacional (E.164), p. ej. +34123456789');
    }
    $phone = $phoneNormalized;
}

// Almacenar usando prepared statements
$sql = "INSERT INTO users (email, phone, created_at) VALUES (:email, :phone, NOW())";
$stmt = $pdo->prepare($sql);
$stmt->execute([
    ':email' => $email,
    ':phone' => $phone !== '' ? $phone : null,
]);

// Mostrar respuesta segura
echo 'Email registrado: ' . htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
if ($phone !== '') {
    echo '<br>Teléfono registrado: ' . htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
}
?>
