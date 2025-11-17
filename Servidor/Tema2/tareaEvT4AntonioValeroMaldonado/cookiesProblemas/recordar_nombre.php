<?php
/**
 * Ejercicio 1: Recordar nombre del usuario con cookies
 * El usuario ingresa su nombre y se guarda en una cookie.
 * Al recargar la página, el nombre aparece automáticamente.
 */

// Procesar el formulario cuando se envía
if (isset($_POST['nombre'])) {
    $nombre = htmlspecialchars($_POST['nombre']);
    // Guardar cookie por 30 días
    setcookie('nombre_usuario', $nombre, time() + (86400 * 30), "/");
    // Recargar la página para que se aplique la cookie
    header("Location: " . $_SERVER['PHP_SELF']);
    exit();
}

// Eliminar cookie si se solicita
if (isset($_GET['eliminar'])) {
    setcookie('nombre_usuario', '', time() - 3600, "/");
    header("Location: " . $_SERVER['PHP_SELF']);
    exit();
}

// Obtener el nombre de la cookie si existe
$nombreGuardado = isset($_COOKIE['nombre_usuario']) ? $_COOKIE['nombre_usuario'] : '';
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recordar Nombre - Cookies</title>
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
        
        .container {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            max-width: 500px;
            width: 100%;
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
            text-align: center;
        }
        
        .subtitle {
            color: #666;
            text-align: center;
            margin-bottom: 30px;
            font-size: 14px;
        }
        
        .bienvenida {
            background: #e8f5e9;
            border-left: 4px solid #4caf50;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        
        .bienvenida h2 {
            color: #2e7d32;
            margin-bottom: 10px;
        }
        
        .bienvenida p {
            color: #558b2f;
            margin-bottom: 15px;
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
        
        input[type="text"] {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        input[type="text"]:focus {
            outline: none;
            border-color: #667eea;
        }
        
        button {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            margin-bottom: 10px;
        }
        
        .btn-guardar {
            background: #667eea;
            color: white;
        }
        
        .btn-guardar:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }
        
        .btn-eliminar {
            background: #f44336;
            color: white;
        }
        
        .btn-eliminar:hover {
            background: #da190b;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(244, 67, 54, 0.3);
        }
        
        .info {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
            font-size: 14px;
            color: #1565c0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🍪 Recordar Nombre de Usuario</h1>
        <p class="subtitle">Ejercicio 1 - Cookies en PHP</p>
        
        <?php if ($nombreGuardado): ?>
            <div class="bienvenida">
                <h2>¡Bienvenido de nuevo, <?php echo $nombreGuardado; ?>!</h2>
                <p>Tu nombre está guardado en una cookie.</p>
                <a href="?eliminar=1">
                    <button class="btn-eliminar">Olvidar mi nombre</button>
                </a>
            </div>
        <?php else: ?>
            <form method="POST">
                <div class="form-group">
                    <label for="nombre">Ingresa tu nombre:</label>
                    <input 
                        type="text" 
                        id="nombre" 
                        name="nombre" 
                        placeholder="Ej: Antonio"
                        required
                        autofocus
                    >
                </div>
                <button type="submit" class="btn-guardar">Guardar mi nombre</button>
            </form>
        <?php endif; ?>
        
        <div class="info">
            <strong>ℹ️ Información:</strong><br>
            Esta página usa cookies para recordar tu nombre. La cookie expira en 30 días.
            Al recargar la página, tu nombre aparecerá automáticamente.
        </div>
    </div>
</body>
</html>
