<?php
/**
 * Ejercicio 3: Autenticación básica con cookies - Área Privada
 * Página protegida que solo pueden ver usuarios autenticados.
 */

// Verificar si el usuario está autenticado
if (!isset($_COOKIE['usuario_autenticado'])) {
    header("Location: auth_login.php");
    exit();
}

$usuario = $_COOKIE['usuario_autenticado'];

// Procesar logout
if (isset($_GET['logout'])) {
    setcookie('usuario_autenticado', '', time() - 3600, "/");
    header("Location: auth_login.php");
    exit();
}

// Calcular tiempo restante de la sesión
$tiempo_expiracion = time() + 3600; // La cookie dura 1 hora desde el último acceso
$tiempo_restante_minutos = 60; // Aproximado, en una implementación real calcularías esto
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Área Privada - Autenticación con Cookies</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
        }
        
        .header {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
        }
        
        .user-info {
            flex: 1;
        }
        
        .user-icon {
            font-size: 50px;
            margin-bottom: 10px;
        }
        
        h1 {
            color: #333;
            margin-bottom: 5px;
        }
        
        .username {
            color: #11998e;
            font-size: 24px;
            font-weight: 600;
        }
        
        .session-info {
            color: #666;
            font-size: 14px;
            margin-top: 10px;
        }
        
        .logout-btn {
            padding: 12px 30px;
            background: #f44336;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s;
        }
        
        .logout-btn:hover {
            background: #da190b;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(244, 67, 54, 0.3);
        }
        
        .content-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .card {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        
        .card-icon {
            font-size: 50px;
            margin-bottom: 15px;
        }
        
        .card h2 {
            color: #333;
            margin-bottom: 10px;
            font-size: 20px;
        }
        
        .card p {
            color: #666;
            line-height: 1.6;
        }
        
        .info-box {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }
        
        .info-box h2 {
            color: #333;
            margin-bottom: 20px;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 15px;
            background: #f5f5f5;
            border-radius: 8px;
            margin-bottom: 10px;
        }
        
        .info-item:last-child {
            margin-bottom: 0;
        }
        
        .info-label {
            color: #666;
            font-weight: 600;
        }
        
        .info-value {
            color: #333;
        }
        
        .success-badge {
            display: inline-block;
            padding: 5px 15px;
            background: #4caf50;
            color: white;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="user-info">
                <div class="user-icon">👤</div>
                <h1>¡Bienvenido/a!</h1>
                <div class="username"><?php echo htmlspecialchars($usuario); ?></div>
                <div class="session-info">
                    <span class="success-badge">✓ Sesión Activa</span>
                </div>
            </div>
            <a href="?logout=1" class="logout-btn">🚪 Cerrar Sesión</a>
        </div>
        
        <div class="content-grid">
            <div class="card">
                <div class="card-icon">📊</div>
                <h2>Panel de Control</h2>
                <p>Accede a todas las funcionalidades de tu cuenta desde aquí.</p>
            </div>
            
            <div class="card">
                <div class="card-icon">⚙️</div>
                <h2>Configuración</h2>
                <p>Personaliza tu experiencia y ajusta tus preferencias.</p>
            </div>
            
            <div class="card">
                <div class="card-icon">📧</div>
                <h2>Mensajes</h2>
                <p>Revisa tus notificaciones y mensajes recibidos.</p>
            </div>
        </div>
        
        <div class="info-box">
            <h2>🔐 Información de la Sesión</h2>
            <div class="info-item">
                <span class="info-label">Usuario:</span>
                <span class="info-value"><?php echo htmlspecialchars($usuario); ?></span>
            </div>
            <div class="info-item">
                <span class="info-label">Estado:</span>
                <span class="info-value">Autenticado ✓</span>
            </div>
            <div class="info-item">
                <span class="info-label">Método de autenticación:</span>
                <span class="info-value">Cookie persistente</span>
            </div>
            <div class="info-item">
                <span class="info-label">Duración de la sesión:</span>
                <span class="info-value">1 hora</span>
            </div>
            <div class="info-item">
                <span class="info-label">Fecha/Hora:</span>
                <span class="info-value"><?php echo date('d/m/Y H:i:s'); ?></span>
            </div>
            
            <div class="warning">
                <strong>⚠️ Nota de seguridad:</strong><br>
                Esta es una implementación básica para fines educativos. En un sistema real,
                se deben implementar medidas de seguridad adicionales como:
                <ul style="margin-top: 10px; margin-left: 20px;">
                    <li>Contraseñas hasheadas en base de datos</li>
                    <li>Tokens CSRF</li>
                    <li>Cookies con flags HttpOnly y Secure</li>
                    <li>Sesiones PHP en lugar de solo cookies</li>
                </ul>
            </div>
        </div>
    </div>
</body>
</html>
