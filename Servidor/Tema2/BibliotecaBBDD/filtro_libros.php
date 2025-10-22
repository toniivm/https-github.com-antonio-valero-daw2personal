<?php
// filtro_libros.php
require_once 'config.php';
// Recoger parámetros GET
$autor = isset($_GET['autor']) ? trim($_GET['autor']) : '';
$anio_min = isset($_GET['anio_min']) ? trim($_GET['anio_min']) : '';
$anio_max = isset($_GET['anio_max']) ? trim($_GET['anio_max']) : '';
// Construir condiciones de forma segura usando mysqli_real_escape_string para evitar inyección (mejoraremos en ejercicios posteriores)
$condiciones = [];
if ($autor !== '') {
    $condiciones[] = "autor LIKE '%" . mysqli_real_escape_string($conexion, $autor) . "%'";
}
if ($anio_min !== '') {
    $condiciones[] = "anio_publicacion >= '" . mysqli_real_escape_string(
        $conexion,
        $anio_min
    ) . "'";
}
if ($anio_max !== '') {
    $condiciones[] = "anio_publicacion <= '" . mysqli_real_escape_string(
        $conexion,
        $anio_max
    ) . "'";
}
$sql = "SELECT id, titulo, autor, anio_publicacion FROM libros";
if (count($condiciones) > 0) {
    $sql .= " WHERE " . implode(" AND ", $condiciones);
}
$sql .= " ORDER BY titulo";
$resultado = mysqli_query($conexion, $sql);
if (!$resultado) {
    die("Error en la consulta: " . mysqli_error($conexion));
}
?>
<!doctype html>
<html lang="es">

<head>
    <meta charset="utf-8">
    <title>Filtro de libros</title>
</head>

<body>
    <h1>Filtro de libros</h1>
    <form method="get" action="filtro_libros.php">
        <label>Autor: <input type="text" name="autor" value="<?php echo
            htmlspecialchars($autor); ?>"></label>
        <label>Año mínimo: <input type="number" name="anio_min" value="<?php echo
            htmlspecialchars($anio_min); ?>"></label>
        <label>Año máximo: <input type="number" name="anio_max" value="<?php echo
            htmlspecialchars($anio_max); ?>"></label>
        <button type="submit">Aplicar filtros</button>
    </form>
    <hr>
    <?php if (mysqli_num_rows($resultado) > 0): ?>
        <ul>
            <?php while ($fila = mysqli_fetch_assoc($resultado)): ?>
                <li><?php echo htmlspecialchars($fila['titulo']); ?> — <?php echo
                        htmlspecialchars($fila['autor']); ?> (<?php echo $fila['anio_publicacion']; ?>)</li>
            <?php endwhile; ?>
        </ul>
    <?php else: ?>
        <p>No hay resultados con los filtros aplicados.</p>
    <?php endif; ?>
    <?php
    mysqli_free_result($resultado);
    mysqli_close($conexion);
    ?>
</body>

</html>