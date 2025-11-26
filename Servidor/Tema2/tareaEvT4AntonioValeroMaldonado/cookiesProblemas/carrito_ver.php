<?php
// Ejercicio 4: Ver carrito

// Obtener carrito
function getCarrito() {
    if (isset($_COOKIE['carrito'])) {
        return json_decode($_COOKIE['carrito'], true);
    }
    return array();
}

// Guardar carrito
function saveCarrito($carr) {
    setcookie('carrito', json_encode($carr), time() + 604800, "/");
}

// Eliminar producto
if (isset($_POST['eliminar'])) {
    $carr = getCarrito();
    $id = intval($_POST['id']);
    
    if (isset($carr[$id])) {
        unset($carr[$id]);
        saveCarrito($carr);
    }
    
    header("Location: " . $_SERVER['PHP_SELF']);
    exit();
}

// Vaciar carrito
if (isset($_GET['vaciar'])) {
    setcookie('carrito', '', time() - 3600, "/");
    header("Location: " . $_SERVER['PHP_SELF']);
    exit();
}

// Carrito actual
$carr = getCarrito();

// Calculos
$subtotal = 0;
$items = 0;
foreach ($carr as $it) {
    if(isset($it['precio']) && isset($it['cant'])) {
        $subtotal += $it['precio'] * $it['cant'];
        $items += $it['cant'];
    }
}

$iva = $subtotal * 0.16;
$total = $subtotal + $iva;
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Mi Carrito</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
        }
        .header {
            background: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        h2 {
            margin: 0;
        }
        .volver {
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
        }
        .vacio {
            background: white;
            padding: 40px;
            text-align: center;
            border-radius: 5px;
        }
        .contenido {
            background: white;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .item {
            padding: 15px;
            border-bottom: 1px solid #ddd;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .item:last-child {
            border-bottom: none;
        }
        .vaciar {
            background-color: #dc3545;
            color: white;
            padding: 8px 15px;
            text-decoration: none;
            border-radius: 5px;
            font-size: 14px;
        }
        .eliminar {
            background-color: #dc3545;
            color: white;
            padding: 5px 10px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
        }
        .resumen {
            background: white;
            padding: 20px;
            border-radius: 5px;
        }
        .linea {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .total {
            font-size: 20px;
            font-weight: bold;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid #333;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Mi Carrito</h2>
        <a href="carrito_productos.php" class="volver">Volver a Productos</a>
    </div>
    
    <?php if (empty($carr)): ?>
        <div class="vacio">
            <h3>Tu carrito esta vacio</h3>
            <p>Agrega productos para comenzar</p>
            <a href="carrito_productos.php" class="volver">Ver Productos</a>
        </div>
    <?php else: ?>
        <div class="contenido">
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <h3>Productos (<?php echo $items; ?>)</h3>
                <a href="?vaciar=1" class="vaciar" onclick="return confirm('Vaciar carrito?')">Vaciar</a>
            </div>
            
            <?php foreach ($carr as $id => $it): ?>
                <div class="item">
                    <div>
                        <strong><?php echo $it['nom']; ?></strong><br>
                        <span style="color: #666;">$<?php echo number_format($it['precio'], 2); ?> x <?php echo $it['cant']; ?></span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <strong>$<?php echo number_format($it['precio'] * $it['cant'], 2); ?></strong>
                        <form method="POST" style="display: inline;">
                            <input type="hidden" name="id" value="<?php echo $id; ?>">
                            <button type="submit" name="eliminar" class="eliminar">X</button>
                        </form>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
        
        <div class="resumen">
            <h3>Resumen</h3>
            <div class="linea">
                <span>Subtotal:</span>
                <span>$<?php echo number_format($subtotal, 2); ?></span>
            </div>
            <div class="linea">
                <span>IVA (16%):</span>
                <span>$<?php echo number_format($iva, 2); ?></span>
            </div>
            <div class="linea total">
                <span>Total:</span>
                <span>$<?php echo number_format($total, 2); ?></span>
            </div>
        </div>
    <?php endif; ?>
</body>
</html>
