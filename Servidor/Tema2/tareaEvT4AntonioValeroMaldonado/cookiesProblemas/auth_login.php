<?php
/**
 * Ejercicio 3: Autenticación básica con cookies - Página de Login
 * Sistema simple de autenticación que guarda el nombre del usuario en una cookie.
 */

// Si ya está autenticado, redirigir al área privada
if (isset($_COOKIE['usuario_autenticado'])) {
    header("Location: area_privada.php");
    exit();
}

$error = '';

// Procesar el login
if (isset($_POST['username']) && isset($_POST['password'])) {
    $username = trim($_POST['username']);
    $password = $_POST['password'];
    
    // Usuarios de ejemplo (en un sistema real, estos estarían en una base de datos)
    $usuarios_validos = [
        'antonio' => '1234',
        'admin' => 'admin123',
        'usuario' => 'pass123'
    ];
    
    // Verificar credenciales
    if (isset($usuarios_validos[$username]) && $usuarios_validos[$username] === $password) {
        // Login exitoso: guardar cookie por 1 hora
        setcookie('usuario_autenticado', $username, time() + 3600, "/");
        header("Location: area_privada.php");
        exit();
    } else {
        $error = 'Usuario o contraseña incorrectos';
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Autenticación con Cookies</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .login-container {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            max-width: 450px;
            width: 100%;
        }
        
        .login-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .login-icon {
            font-size: 60px;
            margin-bottom: 10px;
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #666;
            font-size: 14px;
        }
        
        .error {
            background: #ffebee;
            border-left: 4px solid #f44336;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            color: #c62828;
            font-weight: 600;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 600;
        }
        
        input[type="text"],
        input[type="password"] {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        input:focus {
            outline: none;
            border-color: #667eea;
        }
        
        button {
            width: 100%;
            padding: 14px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        button:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }
        
        .demo-users {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
            font-size: 13px;
        }
        
        .demo-users h3 {
            color: #555;
            margin-bottom: 15px;
            font-size: 14px;
        }
        
        .demo-user {
            background: white;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            border: 1px solid #ddd;
        }
        
        .demo-user:last-child {
            margin-bottom: 0;
        }
        
        .demo-user span {
            color: #666;
        }
        
        .demo-user strong {
            color: #333;
        }
        
        .info {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
            font-size: 13px;
            color: #1565c0;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-header">
            <div class="login-icon">🔐</div>
            <h1>Iniciar Sesión</h1>
            <p class="subtitle">Ejercicio 3 - Autenticación con Cookies</p>
        </div>
        
        <?php if ($error): ?>
            <div class="error">
                ❌ <?php echo $error; ?>
            </div>
        <?php endif; ?>
        
        <form method="POST">
            <div class="form-group">
                <label for="username">Usuario:</label>
                <input 
                    type="text" 
                    id="username" 
                    name="username" 
                    placeholder="Ingresa tu usuario"
                    required
                    autofocus
                    value="<?php echo isset($_POST['username']) ? htmlspecialchars($_POST['username']) : ''; ?>"
                >
            </div>
            
            <div class="form-group">
                <label for="password">Contraseña:</label>
                <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    placeholder="Ingresa tu contraseña"
                    required
                >
            </div>
            
            <button type="submit">Iniciar Sesión</button>
        </form>
        
        <div class="demo-users">
            <h3>👤 Usuarios de prueba:</h3>
            <div class="demo-user">
                <span>Usuario: <strong>antonio</strong></span>
                <span>Pass: <strong>1234</strong></span>
            </div>
            <div class="demo-user">
                <span>Usuario: <strong>admin</strong></span>
                <span>Pass: <strong>admin123</strong></span>
            </div>
            <div class="demo-user">
                <span>Usuario: <strong>usuario</strong></span>
                <span>Pass: <strong>pass123</strong></span>
            </div>
        </div>
        
        <div class="info">
            <strong>ℹ️ Información:</strong><br>
            Al iniciar sesión, tu nombre de usuario se guardará en una cookie 
            durante 1 hora. No necesitarás volver a ingresar tus credenciales.
        </div>
    </div>
</body>
</html>
