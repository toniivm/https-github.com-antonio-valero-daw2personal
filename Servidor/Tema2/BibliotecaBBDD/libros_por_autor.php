<?php
// libros_por_autor.php
require_once 'config.php';

// Consulta 1: libros por autor
$sql1 = "SELECT autor, COUNT(*) AS total_libros
         FROM libros GROUP BY autor ORDER BY total_libros DESC";
$resultado1 = mysqli_query($conexion, $sql1);

// Consulta 2: libros por género
$sql2 = "SELECT genero, COUNT(*) AS total_genero
         FROM libros GROUP BY genero ORDER BY total_genero DESC";
$resultado2 = mysqli_query($conexion, $sql2);
?>
<!doctype html>
<html lang="es">

<head>
    <meta charset="utf-8">
    <title>Estadísticas de libros</title>
</head>

<body>
    <h1>📊 Libros por autor</h1>
    <ul>
        <?php while ($fila = mysqli_fetch_assoc($resultado1)): ?>
            <li><?php echo htmlspecialchars($fila['autor']); ?>: <?php echo $fila['total_libros']; ?> libro(s)</li>
        <?php endwhile; ?>
    </ul>

    <h1>📚 Libros por género</h1>
    <ul>
        <?php while ($fila = mysqli_fetch_assoc($resultado2)): ?>
            <li><?php echo htmlspecialchars($fila['genero']); ?>: <?php echo $fila['total_genero']; ?> libro(s)</li>
        <?php endwhile; ?>
    </ul>
</body>

</html>
<?php
mysqli_free_result($resultado1);
mysqli_free_result($resultado2);
mysqli_close($conexion);
?>