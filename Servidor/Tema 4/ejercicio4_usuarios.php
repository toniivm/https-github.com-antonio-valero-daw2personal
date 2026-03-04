<?php

// Ejercicio 4 — Gestión de Usuarios con Argon2ID (Login profesional)
// Requisitos:
// - Hash con PASSWORD_ARGON2ID
// - Verificación con password_verify
// - Comprobar si el email existe antes de registrar
// - Excepciones en caso de duplicado
// - Manejo con try/catch y logging de errores
// - FETCH_ASSOC

// Registra un nuevo usuario si el email no existe
// Devuelve el ID del usuario creado
function registrarUsuario($email, $password, PDO $pdo)
{
    $logFile = __DIR__ . DIRECTORY_SEPARATOR . 'errores.log';

    try {
        if ($pdo->getAttribute(PDO::ATTR_ERRMODE) !== PDO::ERRMODE_EXCEPTION) {
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        }

        // Verificar si ya existe el email
        $stmt = $pdo->prepare('SELECT id FROM usuarios WHERE email = :email LIMIT 1');
        $stmt->execute([':email' => $email]);
        $existe = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existe) {
            throw new RuntimeException('El email ya está registrado');
        }

        // Generar hash con Argon2ID
        $hash = password_hash($password, PASSWORD_ARGON2ID);
        if ($hash === false) {
            throw new RuntimeException('Error al generar hash de contraseña');
        }

        // Insertar usuario
        $ins = $pdo->prepare('INSERT INTO usuarios (email, passhash) VALUES (:email, :passhash)');
        $ins->execute([':email' => $email, ':passhash' => $hash]);

        return (int)$pdo->lastInsertId();

    } catch (Throwable $e) {
        $mensaje = sprintf('[%s] Error registrando usuario (%s): %s%s', date('Y-m-d H:i:s'), $email, $e->getMessage(), PHP_EOL);
        error_log($mensaje, 3, $logFile);
        throw $e;
    }
}

// Verifica credenciales de login
// Devuelve true si la contraseña coincide, false si no
function loginUsuario($email, $password, PDO $pdo)
{
    if ($pdo->getAttribute(PDO::ATTR_ERRMODE) !== PDO::ERRMODE_EXCEPTION) {
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    $stmt = $pdo->prepare('SELECT id, email, passhash FROM usuarios WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => $email]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        // No revelar si el email existe o no (seguridad)
        return false;
    }

    return password_verify($password, $usuario['passhash']);
}

// Ejemplo de uso (comentado):
// $pdo = new PDO('mysql:host=localhost;dbname=test;charset=utf8mb4', 'root', '');
// $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
// 
// try {
//     $userId = registrarUsuario('usuario@ejemplo.com', 'MiPassword123!', $pdo);
//     echo "Usuario registrado con ID: $userId\n";
//     
//     $loginOk = loginUsuario('usuario@ejemplo.com', 'MiPassword123!', $pdo);
//     echo $loginOk ? "Login correcto\n" : "Login incorrecto\n";
// } catch (Exception $e) {
//     echo "Error: " . $e->getMessage();
// }
