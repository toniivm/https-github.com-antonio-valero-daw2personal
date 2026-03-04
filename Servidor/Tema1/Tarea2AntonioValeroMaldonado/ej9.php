 <?php
session_start();

// Inicializar la lista de tareas si no existe
if (!isset($_SESSION['tareas'])) {
    $_SESSION['tareas'] = [];
}

// Añadir tarea
if (isset($_POST['nueva_tarea'])) {
    $tarea = $_POST['nueva_tarea'];
    if ($tarea !== '') {
        $_SESSION['tareas'][] = $tarea;
    }
}

// Eliminar tarea
if (isset($_POST['eliminar'])) {
    $indice = $_POST['eliminar'];
    unset($_SESSION['tareas'][$indice]);
    // Reindexar el array para evitar índices vacíos
    $_SESSION['tareas'] = array_values($_SESSION['tareas']);
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lista de Tareas</title>
</head>
<body>
    <h2>Lista de Tareas</h2>

    <!-- Formulario para añadir tarea -->
    <form method="post" action="">
        <label for="nueva_tarea">Nueva Tarea:</label>
        <input type="text" id="nueva_tarea" name="nueva_tarea">
        <input type="submit" value="Añadir">
    </form>

    <!-- Lista de tareas -->
    <h3>Tareas</h3>
    <?php if (empty($_SESSION['tareas'])): ?>
        <p>No hay tareas en la lista.</p>
    <?php else: ?>
        <form method="post" action="">
            <ul>
                <?php foreach ($_SESSION['tareas'] as $indice => $tarea): ?>
                    <li>
                        <?= $tarea ?>
                        <button type="submit" name="eliminar" value="<?= $indice ?>">Eliminar</button>
                    </li>
                <?php endforeach; ?>
            </ul>
        </form>
    <?php endif; ?>
</body>
</html>