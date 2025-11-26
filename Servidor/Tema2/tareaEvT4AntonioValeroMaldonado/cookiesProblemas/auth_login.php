<?php
// Ejercicio 3: Login con cookies

// Si ya hay cookie, ir al area privada
if (isset($_COOKIE['usuario_autenticado'])) {
    header("Location: area_privada.php");
    exit();
}

$error = '';

// Validar login
if (isset($_POST['user']) && isset($_POST['pass'])) {
    $u = trim($_POST['user']);
    $p = $_POST['pass'];
    
    // Usuarios validos
    $users = array(
        'antonio' => '1234',
        'admin' => 'admin123',
        'usuario' => 'pass123'
    );
    
    // Comprobar
    if (isset($users[$u]) && $users[$u] == $p) {
        setcookie('usuario_autenticado', $u, time() + 3600, "/");
        header("Location: area_privada.php");
        exit();
    } else {
        $error = 'Usuario o contraseña incorrectos';
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Login</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #e9ecef;
            padding: 50px;
        }
        .login {
            background: white;
            padding: 30px;
            border-radius: 8px;
            max-width: 350px;
            margin: 0 auto;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h2 {
            color: #333;
            text-align: center;
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin: 10px 0 5px;
            color: #666;
        }
        input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        }
        button {
            width: 100%;
            padding: 12px;
            margin-top: 15px;
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .error {
            background-color: #f8d7da;
            color: #721c24;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 15px;
        }
        .info {
            background-color: #d1ecf1;
            color: #0c5460;
            padding: 10px;
            border-radius: 4px;
            margin-top: 15px;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="login">
        <h2>Iniciar Sesion</h2>
        
        <?php if ($error != ''): ?>
            <div class="error"><?php echo $error; ?></div>
        <?php endif; ?>
        
        <form method="POST">
            <label>Usuario:</label>
            <input type="text" name="user" required>
            
            <label>Contraseña:</label>
            <input type="password" name="pass" required>
            
            <button type="submit">Entrar</button>
        </form>
        
        <div class="info">
            <strong>Usuarios de prueba:</strong><br>
            antonio/1234<br>
            admin/admin123<br>
            usuario/pass123
        </div>
    </div>
</body>
</html>
