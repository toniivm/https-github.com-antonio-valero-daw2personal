<?php

declare(strict_types=1);

// Archivo de configuración simple que retorna un PDO listo.
// Puedes crear un ".env.php" junto a este archivo que retorne
// un array como: ['DB_DSN' => 'mysql:host=localhost;dbname=test;charset=utf8mb4', 'DB_USER' => 'root', 'DB_PASS' => '']
// para sobreescribir estos valores por defecto.

$defaultDsn  = 'mysql:host=localhost;dbname=test;charset=utf8mb4';
$defaultUser = 'root';
$defaultPass = '';

$dsn  = $defaultDsn;
$user = $defaultUser;
$pass = $defaultPass;

$envPath = __DIR__ . DIRECTORY_SEPARATOR . '.env.php';
if (file_exists($envPath)) {
    $env = include $envPath; // se espera que retorne un array
    if (is_array($env)) {
        $dsn  = $env['DB_DSN']  ?? $dsn;
        $user = $env['DB_USER'] ?? $user;
        $pass = $env['DB_PASS'] ?? $pass;
    }
}

$pdo = new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

return $pdo;
