<?php
// Ejercicio 1: Recordar nombre del usuario

// Si se envia el formulario
if (isset($_POST['nombre'])) {
    $nom = htmlspecialchars($_POST['nombre']);
    setcookie('nombre_usuario', $nom, time() + 2592000, "/");
    header("Location: " . $_SERVER['PHP_SELF']);
    exit();
}

// Borrar cookie
if (isset($_GET['borrar'])) {
    setcookie('nombre_usuario', '', time() - 3600, "/");
    header("Location: " . $_SERVER['PHP_SELF']);
    exit();
}

// Ver si hay cookie guardada
$nombre = '';
if(isset($_COOKIE['nombre_usuario'])) {
    $nombre = $_COOKIE['nombre_usuario'];
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Recordar Nombre</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            padding: 50px;
        }
        .contenedor {
            background: white;
            padding: 30px;
            border-radius: 10px;
            max-width: 400px;
            margin: 0 auto;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h2 {
            color: #333;
            text-align: center;
        }
        label {
            display: block;
            margin: 15px 0 5px;
            color: #666;
        }
        input[type="text"] {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-sizing: border-box;
        }
        button {
            width: 100%;
            padding: 10px;
            margin-top: 10px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        }
        .guardar {
            background-color: #4CAF50;
            color: white;
        }
        .borrar {
            background-color: #f44336;
            color: white;
        }
        .mensaje {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="contenedor">
        <h2>Recordar Nombre de Usuario</h2>
        
        <?php if ($nombre != ''): ?>
            <div class="mensaje">
                <p>Hola de nuevo, <strong><?php echo $nombre; ?></strong></p>
                <p>Tu nombre esta guardado en una cookie</p>
            </div>
            <a href="?borrar=1">
                <button class="borrar">Borrar nombre</button>
            </a>
        <?php else: ?>
            <form method="POST">
                <label>Escribe tu nombre:</label>
                <input type="text" name="nombre" required>
                <button type="submit" class="guardar">Guardar</button>
            </form>
        <?php endif; ?>
        
        <p style="color: #999; font-size: 12px; margin-top: 20px;">
            La cookie se guarda durante 30 dias
        </p>
    </div>
</body>
</html>
