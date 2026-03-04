<?php
// Ejercicio 3: Area privada

// Verificar si esta logueado
if (!isset($_COOKIE['usuario_autenticado'])) {
    header("Location: auth_login.php");
    exit();
}

$user = $_COOKIE['usuario_autenticado'];

// Cerrar sesion
if (isset($_GET['salir'])) {
    setcookie('usuario_autenticado', '', time() - 3600, "/");
    header("Location: auth_login.php");
    exit();
}
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Area Privada</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            padding: 50px;
        }
        .contenido {
            background: white;
            padding: 40px;
            border-radius: 8px;
            max-width: 600px;
            margin: 0 auto;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h2 {
            color: #333;
            text-align: center;
        }
        .bienvenida {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            text-align: center;
        }
        .info {
            color: #666;
            margin: 20px 0;
        }
        .salir {
            display: block;
            width: 200px;
            margin: 20px auto;
            padding: 10px;
            background-color: #dc3545;
            color: white;
            text-align: center;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="contenido">
        <h2>Area Privada</h2>
        
        <div class="bienvenida">
            <h3>Bienvenido, <?php echo htmlspecialchars($user); ?>!</h3>
            <p>Has accedido correctamente al area privada</p>
        </div>
        
        <div class="info">
            <p><strong>Usuario:</strong> <?php echo htmlspecialchars($user); ?></p>
            <p><strong>Estado:</strong> Autenticado</p>
            <p><strong>Sesion:</strong> 1 hora</p>
            <p><strong>Fecha:</strong> <?php echo date('d/m/Y H:i:s'); ?></p>
        </div>
        
        <a href="?salir=1" class="salir">Cerrar Sesion</a>
    </div>
</body>
</html>
