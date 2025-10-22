<?php
// buscar_libros.php
require_once 'config.php';
// Conceptos previos: GET obtiene datos enviados en la URL, e.g. ?q=php
// [NUEVO CONCEPTO] uso de GET para filtrar
$termino_busqueda = isset($_GET['q']) ? trim($_GET['q']) : '';
// Construir la consulta
// IMPORTANTE: aquí mostramos la forma simple (insegura) para introducir el concepto.
// Señalamos después por qué esto NO ES SEGURO.
if ($termino_busqueda === '') {
    // Si no hay término mostramos todos (o mensaje)
    $sql = "SELECT id, titulo, autor, anio_publicacion FROM libros ORDER BY titulo";
} else {
    // [AQUÍ EXPLICAMOS QUE ESTA CONCATENACIÓN PUEDE DAR LUGAR A INYECCIÓN]
    $sql = "SELECT id, titulo, autor, anio_publicacion FROM libros
 WHERE titulo LIKE '%" . mysqli_real_escape_string($conexion, $termino_busqueda)
        . "%'
 ORDER BY titulo";
}
$resultado = mysqli_query($conexion, $sql);
if (!$resultado) {
    die("Error en la consulta: " . mysqli_error($conexion));
}
?>
<!doctype html>
<html lang="es">

<head>
    <meta charset="utf-8">
    <title>Búsqueda de libros</title>
</head>

<body>
    <h1>Búsqueda de libros</h1>
    <form method="get" action="buscar_libros.php">
        <label>Buscar título: <input type="text" name="q" value="<?php echo
            htmlspecialchars($termino_busqueda); ?>"></label>
        <button type="submit">Buscar</button>
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
        <p>No se encontraron resultados.</p>
    <?php endif; ?>
    <?php
    mysqli_free_result($resultado);
    mysqli_close($conexion);
    ?>
</body>

</html>