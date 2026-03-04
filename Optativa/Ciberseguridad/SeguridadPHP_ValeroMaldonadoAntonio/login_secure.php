<?php
declare(strict_types=1);
session_start();

$dsn = "mysql:host=localhost;dbname=practicas;charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, 'root', '', $options);
} catch (PDOException $e) {
    // Mensaje genérico para no filtrar información sensible
    exit('Error al conectar con el servicio.');
}

// Parámetros de control de intentos
const MAX_ATTEMPTS = 5;        // intentos permitidos antes del bloqueo temporal
const LOCKOUT_SECONDS = 900;   // 15 minutos de bloqueo
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

// Registro sencillo de intentos (archivo)
function log_attempt(string $username, string $ip, bool $success): void {
    $line = sprintf("%s | %s | %s | %s\n", date('Y-m-d H:i:s'), $ip, $username, $success ? 'OK' : 'FAIL');
    @file_put_contents(__DIR__ . '/login_attempts.log', $line, FILE_APPEND | LOCK_EX);
}

// Control básico por sesión (contador y tiempo)
if (!isset($_SESSION['login_attempts'])) {
    $_SESSION['login_attempts'] = 0;
    $_SESSION['first_attempt_time'] = time();
}

// Si pasó el tiempo de lockout, reiniciar contador
if (time() - ($_SESSION['first_attempt_time'] ?? 0) > LOCKOUT_SECONDS) {
    $_SESSION['login_attempts'] = 0;
    $_SESSION['first_attempt_time'] = time();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Comprobar bloqueo por intentos
    if ($_SESSION['login_attempts'] >= MAX_ATTEMPTS) {
        $wait = LOCKOUT_SECONDS - (time() - ($_SESSION['first_attempt_time'] ?? 0));
        if ($wait > 0) {
            echo '<p>Demasiados intentos. Intente de nuevo más tarde.</p>';
            exit;
        } else {
            $_SESSION['login_attempts'] = 0;
            $_SESSION['first_attempt_time'] = time();
        }
    }

    try {
        // Prepared statement: BUSCAR USUARIO SOLO POR username
        $sql = 'SELECT id, username, password_hash, role FROM users WHERE username = :username LIMIT 1';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':username' => $username]);
        $user = $stmt->fetch();

        $authenticated = false;
        if ($user) {
            // password_verify compara la contraseña ingresada con el hash almacenado
            if (password_verify($password, $user['password_hash'])) {
                // Si hace falta, re-hashear con el algoritmo por defecto
                if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
                    $newHash = password_hash($password, PASSWORD_DEFAULT);
                    $update = $pdo->prepare('UPDATE users SET password_hash = :ph WHERE id = :id');
                    $update->execute([':ph' => $newHash, ':id' => $user['id']]);
                }
                $authenticated = true;
            }
        }

        if ($authenticated) {
            // Éxito: regenerar id de sesión y establecer datos mínimos de sesión
            session_regenerate_id(true);
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];

            log_attempt($username, $ip, true);
            echo '<p>¡Login correcto! Bienvenido ' . htmlspecialchars($user['username'], ENT_QUOTES, 'UTF-8') . '</p>';
            exit;
        } else {
            // Fallo: incrementar contador y registrar intento
            $_SESSION['login_attempts']++;
            log_attempt($username, $ip, false);
            echo '<p>Usuario o contraseña incorrectos</p>'; // mensaje genérico
            exit;
        }

    } catch (PDOException $e) {
        // No mostrar detalles técnicos al usuario
        error_log('Login error: ' . $e->getMessage());
        echo '<p>Error en el servicio. Intente de nuevo más tarde.</p>';
        exit;
    }
}
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Login seguro</title>
</head>
<body>
    <h1>Login (seguro)</h1>
    <form method="post" action="">
        <label>Usuario: <input type="text" name="username" required></label><br><br>
        <label>Contraseña: <input type="password" name="password" required></label><br><br>
        <button type="submit">Entrar</button>
    </form>
</body>
</html>
