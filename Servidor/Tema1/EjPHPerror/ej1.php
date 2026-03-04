<?php
// ejemplo1.php
// Calculadora de descuento simple
// Función que calcula precio con descuento
function aplicar_descuento($precio, $porcentaje)
{
    $descuento = $precio * ($porcentaje / 100);
    $final = $precio - $descuento;
    return ['precio' => $precio, 'descuento' => $descuento, 'final' => $final];
}
// Inicialización de ejemplo: simulamos 3 productos en un array indexado
$productos = [
    ['nombre' => 'Camiseta', 'precio' => 25.00],
    ['nombre' => 'Pantalón', 'precio' => 40.00],
    ['nombre' => 'Gorra', 'precio' => 12.50],
];
// Si se ha enviado el formulario
$resultados = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Leemos el porcentaje desde $_POST
    $porcentaje = isset($_POST['descuento']) ? floatval($_POST['descuento']) : 0;
    // Aplicamos el descuento a todos los productos con un bucle for
    for ($i = 0; $i < count($productos); $i++) {
        $p = $productos[$i];
        $resultados[] = array_merge($p, aplicar_descuento($p['precio'], $porcentaje));
    }
}
?>
<!doctype html>
<html>

<head>
    <meta charset="utf-8">
    <title>Calculadora de
        descuento</title>
</head>

<body>
    <h2>Calculadora de descuentos (ejemplo 1)</h2>
    <form method="post" action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']);
    ?>">
        <label>Descuento (%) <input type="number" name="descuento" step="0.1" value="10"></label>
        <button type="submit">Aplicar</button>
    </form>
    <?php if (!empty($resultados)): ?>
        <h3>Resultados</h3>
        <table border="1" cellpadding="6">
            <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Descuento</th>
                <th>Final</th>
            </tr>
            <?php foreach ($resultados as $r): ?>
                <tr>
                    <td><?php echo htmlspecialchars($r['nombre']); ?></td>
                    <td><?php echo number_format($r['precio'], 2); ?> €</td>
                    <td><?php echo number_format($r['descuento'], 2); ?> €</td>
                    <td><?php echo number_format($r['final'], 2); ?> €</td>
                </tr>
            <?php endforeach; ?>
        </table>
    <?php endif; ?>
</body>

</html>