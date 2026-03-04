<?php
// lista_libros.php
// Muestra todos los libros guardados en la base de datos
// Incluye config.php para obtener $conexion
require_once 'config.php'; // incluye la conexión
// [NUEVO CONCEPTO] Query SELECT simple sin filtros
$sql = "SELECT id, titulo, autor, anio_publicacion, isbn, genero FROM libros ORDER BY titulo";
// Ejecutar query
$resultado = mysqli_query($conexion, $sql);
// Comprobación básica de errores en la consulta
if (!$resultado) {
 die("Error en la consulta: " . mysqli_error($conexion));
}
// Mostrar la página HTML con resultados
?>
<!doctype html>
<html lang="es">
<head>
 <meta charset="utf-8">
 <title>Listado de libros - Biblioteca</title>
</head>
<body>
 <h1>Listado de libros</h1>
 <?php if (mysqli_num_rows($resultado) > 0): ?>
 <table border="1" cellpadding="6">
 <thead>
 <tr>
 <th>Título</th>
 <th>Autor</th>
 <th>Año</th>
 <th>ISBN</th>
 <th>Género</th>
 </tr>
 </thead>
 <tbody>
 <?php
 // Recorremos filas y las imprimimos
 while ($fila = mysqli_fetch_assoc($resultado)) {
 // $fila es un array asociativo con los campos
 echo "<tr>";
 echo "<td>" . htmlspecialchars($fila['titulo']) . "</td>";
 echo "<td>" . htmlspecialchars($fila['autor']) . "</td>";
 echo "<td>" . ($fila['anio_publicacion'] ?: '') . "</td>";
 echo "<td>" . ($fila['isbn'] ?: '') . "</td>";
 echo "<td>" . htmlspecialchars($fila['genero'] ?: '') . "</td>";
 echo "</tr>";
 }
 ?>
 </tbody>
 </table>
 <?php else: ?>
 <p>No hay libros registrados.</p>
 <?php endif; ?>
 <?php
 // Liberar memoria y cerrar conexión
 mysqli_free_result($resultado);
 mysqli_close($conexion);
 ?>
</body>
</html>