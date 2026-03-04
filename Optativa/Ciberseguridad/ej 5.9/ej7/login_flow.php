<?php
// login_flow.php
require 'session_start_config.php';

// ejemplo: validar credenciales (sólo pseudocódigo)
// $user = find_user_by_email($_POST['email']);
// if (!$user || !password_verify($_POST['password'], $user['password_hash'])) { ... }

if ($credentials_ok) {
    // regenerar id de sesión: evita session fixation
    session_regenerate_id(true); // true = elimina la sesión antigua del storage

    // establecer variables de sesión seguras
    $_SESSION['user_id'] = $userId;
    $_SESSION['role'] = $userRole;
    $_SESSION['login_time'] = time();

    // opcional: establecer timeout de inactividad (ej. 30 min)
    $_SESSION['last_activity'] = time();

    // redirigir a área privada
    header('Location: /dashboard.php');
    exit;
} else {
    // manejar fallo de login
    echo 'Credenciales incorrectas';
}
