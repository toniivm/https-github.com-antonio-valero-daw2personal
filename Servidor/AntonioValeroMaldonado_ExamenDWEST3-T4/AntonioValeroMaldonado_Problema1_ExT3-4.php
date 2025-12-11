<?php
// Antonio Valero Maldonado - Problema 1 Examen T3-T4
// esto es un sistema de login con cookies

// veo si le dio click a salir
if (isset($_GET['salir'])) {
    if ($_GET['salir'] == 1) {
        // borro la cookie
        setcookie('usuario_auth', '', time() - 3600, '/');
        // vuelvo a cargar la pagin
        header('Location: ' . $_SERVER['PHP_SELF']);
        exit();
    }
}

// miro si hay alguien logueado
$user_logged = null;
if (isset($_COOKIE['usuario_auth'])) {
    $user_logged = $_COOKIE['usuario_auth'];
} else {
    $user_logged = null;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // obtengo los datos del formulario
    $user = '';
    $pass = '';

    if (isset($_POST['usuario'])) {
        $user = $_POST['usuario'];
    }

    if (isset($_POST['clave'])) {
        $pass = $_POST['clave'];
    }

    // verifico si el usuario y contraseña son correctos
    if ($user == 'operador') {
        if ($pass == 'seguro123') {
            // si son correctos creo la cookie
            // 7 dias = 7 * 24 * 60 * 60 segundos
            $tiempo = 7 * 24 * 60 * 60;
            $expira = time() + $tiempo;
            setcookie('usuario_auth', $user, $expira, '/');

            // redirijo
            header('Location: ' . $_SERVER['PHP_SELF']);
            exit();
        } else {
            $mensaje_error = 'Usuario o contraseña incorrectos';
        }
    } else {
        $mensaje_error = 'Usuario o contraseña incorrectos';
    }
}
?>
<html>

<head>
    <title>Sistema de Acceso</title>
    <style>
        body {
            font-family: Arial;
            background-color: #eee;
            padding: 50px;
        }

        .contenedor {
            background: white;
            padding: 25px;
            max-width: 400px;
            margin: 0 auto;
            border: 1px solid #ccc;
        }

        h1 {
            color: #333;
        }

        h2 {
            color: #0066cc;
        }

        .usuario-info {
            background: #f5f5f5;
            padding: 15px;
            margin: 15px 0;
        }

        input {
            width: 100%;
            padding: 8px;
            margin-bottom: 10px;
            border: 1px solid #ccc;
        }

        button {
            padding: 10px 20px;
            background-color: #0066cc;
            color: white;
            border: none;
            cursor: pointer;
        }

        a.boton {
            padding: 10px 20px;
            background-color: #0066cc;
            color: white;
            text-decoration: none;
        }

        .boton-rojo {
            background-color: #cc0000;
        }

        .error {
            background: #ffcccc;
            color: #cc0000;
            padding: 10px;
            margin-bottom: 10px;
        }

        .info {
            background: #e6f2ff;
            padding: 10px;
            margin-top: 15px;
            font-size: 13px;
        }

        .ayuda {
            background: #ffffcc;
            padding: 10px;
            margin-top: 10px;
            font-size: 13px;
        }
    </style>
</head>

<body>
    <div class="contenedor">
        <?php
        // si hay usuario logueado muestro esto
        if ($user_logged != null) {
            ?>
            <!-- esto se ve cuando estas logueado -->
            <div>
                <h2>Bienvenido de nuevo!</h2>

                <div class="usuario-info">
                    <p>Has iniciado sesión como:</p>
                    <p><?php echo $user_logged; ?></p>
                    <p style="margin-top:12px;font-size:13px;color:#777;">
                        Tu sesión se mantendrá activa durante 7 días
                    </p>
                </div>

                <a href="?salir=1" class="boton boton-rojo">Cerrar Sesión</a>

                <div class="info">
                    <strong>Información:</strong><br>
                    Puedes cerrar el navegador y tu sesión se mantendrá activa.
                </div>
            </div>
            <?php
        } else {
            ?>
            <!-- aqui esta el formulario de login -->
            <h1>Acceso al Sistema</h1>
            <p>Introduce tus credenciales para continuar</p>

            <?php
            // muestro el error si hay
            if (isset($mensaje_error)) {
                ?>
                <div class="error">
                    <?php echo $mensaje_error; ?>
                </div>
                <?php
            }
            ?>

            <form method="POST" action="">
                <div>
                    <label>Usuario:</label>
                    <input type="text" name="usuario" required placeholder="Ingresa tu usuario">
                </div>

                <div>
                    <label>Contraseña:</label>
                    <input type="password" name="clave" required placeholder="Ingresa tu contraseña">
                </div>

                <button type="submit">Iniciar Sesión</button>
            </form>

            <div class="ayuda">
                <strong>Credenciales de prueba:</strong><br>
                Usuario: operador<br>
                Contraseña: seguro123
            </div>
            <?php
        }
        ?>
    </div>
</body>

</html>