<?php
/**
 * Ejercicio 4: Carrito de compras simple - Ver Carrito
 * Muestra los productos agregados al carrito y permite gestionar cantidades.
 */

// Función para obtener el carrito desde las cookies
function obtenerCarrito() {
    if (isset($_COOKIE['carrito'])) {
        return json_decode($_COOKIE['carrito'], true);
    }
    return [];
}

// Función para guardar el carrito en cookies
function guardarCarrito($carrito) {
    setcookie('carrito', json_encode($carrito), time() + (86400 * 7), "/"); // 7 días
}

// Procesar acciones del carrito
if (isset($_POST['accion'])) {
    $carrito = obtenerCarrito();
    $id_producto = intval($_POST['id_producto']);
    
    switch ($_POST['accion']) {
        case 'incrementar':
            if (isset($carrito[$id_producto])) {
                $carrito[$id_producto]['cantidad']++;
                guardarCarrito($carrito);
            }
            break;
            
        case 'decrementar':
            if (isset($carrito[$id_producto])) {
                $carrito[$id_producto]['cantidad']--;
                if ($carrito[$id_producto]['cantidad'] <= 0) {
                    unset($carrito[$id_producto]);
                }
                guardarCarrito($carrito);
            }
            break;
            
        case 'eliminar':
            if (isset($carrito[$id_producto])) {
                unset($carrito[$id_producto]);
                guardarCarrito($carrito);
            }
            break;
    }
    
    // Recargar para actualizar la vista
    header("Location: " . $_SERVER['PHP_SELF']);
    exit();
}

// Vaciar carrito
if (isset($_GET['vaciar'])) {
    setcookie('carrito', '', time() - 3600, "/");
    header("Location: " . $_SERVER['PHP_SELF']);
    exit();
}

// Obtener carrito actual
$carrito = obtenerCarrito();

// Calcular totales
$subtotal = 0;
$total_items = 0;
foreach ($carrito as $item) {
    $subtotal += $item['precio'] * $item['cantidad'];
    $total_items += $item['cantidad'];
}

$impuestos = $subtotal * 0.16; // 16% IVA
$total = $subtotal + $impuestos;
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Carrito - Carrito de Compras</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .navbar {
            background: white;
            padding: 20px 30px;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .navbar h1 {
            color: #333;
            font-size: 28px;
        }
        
        .btn-volver {
            padding: 12px 25px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s;
        }
        
        .btn-volver:hover {
            background: #5568d3;
            transform: translateY(-2px);
        }
        
        .container {
            max-width: 1000px;
            margin: 0 auto;
        }
        
        .carrito-vacio {
            background: white;
            padding: 60px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
        }
        
        .carrito-vacio-icon {
            font-size: 80px;
            margin-bottom: 20px;
        }
        
        .carrito-vacio h2 {
            color: #333;
            margin-bottom: 15px;
        }
        
        .carrito-vacio p {
            color: #666;
            margin-bottom: 25px;
        }
        
        .carrito-contenido {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
            margin-bottom: 20px;
        }
        
        .carrito-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
        }
        
        .carrito-header h2 {
            color: #333;
        }
        
        .btn-vaciar {
            padding: 10px 20px;
            background: #f44336;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s;
            border: none;
            cursor: pointer;
        }
        
        .btn-vaciar:hover {
            background: #da190b;
        }
        
        .item-carrito {
            display: flex;
            align-items: center;
            gap: 20px;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 10px;
            margin-bottom: 15px;
        }
        
        .item-info {
            flex: 1;
        }
        
        .item-nombre {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
        }
        
        .item-precio {
            color: #667eea;
            font-weight: 600;
        }
        
        .item-controles {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .cantidad-control {
            display: flex;
            align-items: center;
            gap: 10px;
            background: white;
            padding: 5px;
            border-radius: 8px;
            border: 2px solid #ddd;
        }
        
        .btn-cantidad {
            width: 35px;
            height: 35px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 18px;
            font-weight: bold;
            transition: all 0.2s;
        }
        
        .btn-cantidad:hover {
            background: #5568d3;
        }
        
        .cantidad-valor {
            min-width: 40px;
            text-align: center;
            font-weight: 600;
            font-size: 16px;
        }
        
        .btn-eliminar {
            padding: 10px 15px;
            background: #f44336;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
        }
        
        .btn-eliminar:hover {
            background: #da190b;
        }
        
        .subtotal-item {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            min-width: 100px;
            text-align: right;
        }
        
        .resumen {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
        }
        
        .resumen h3 {
            color: #333;
            margin-bottom: 20px;
            font-size: 22px;
        }
        
        .linea-resumen {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .linea-resumen:last-child {
            border-bottom: none;
            padding-top: 20px;
            margin-top: 10px;
            border-top: 2px solid #333;
        }
        
        .linea-resumen.total {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
        }
        
        .btn-finalizar {
            width: 100%;
            padding: 15px;
            background: #4caf50;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 20px;
            transition: all 0.3s;
        }
        
        .btn-finalizar:hover {
            background: #45a049;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
        }
        
        .info {
            background: white;
            padding: 20px;
            border-radius: 15px;
            margin-top: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="navbar">
        <h1>🛍️ Mi Carrito</h1>
        <a href="carrito_productos.php" class="btn-volver">← Seguir Comprando</a>
    </div>
    
    <div class="container">
        <?php if (empty($carrito)): ?>
            <div class="carrito-vacio">
                <div class="carrito-vacio-icon">🛒</div>
                <h2>Tu carrito está vacío</h2>
                <p>¡Agrega productos para comenzar tu compra!</p>
                <a href="carrito_productos.php" class="btn-volver" style="display: inline-block;">
                    Ver Productos
                </a>
            </div>
        <?php else: ?>
            <div class="carrito-contenido">
                <div class="carrito-header">
                    <h2>Productos en tu carrito (<?php echo $total_items; ?>)</h2>
                    <a href="?vaciar=1" class="btn-vaciar" onclick="return confirm('¿Estás seguro de vaciar el carrito?')">
                        🗑️ Vaciar carrito
                    </a>
                </div>
                
                <?php foreach ($carrito as $id => $item): ?>
                    <div class="item-carrito">
                        <div class="item-info">
                            <div class="item-nombre"><?php echo htmlspecialchars($item['nombre']); ?></div>
                            <div class="item-precio">$<?php echo number_format($item['precio'], 2); ?> c/u</div>
                        </div>
                        
                        <div class="item-controles">
                            <div class="cantidad-control">
                                <form method="POST" style="display: inline;">
                                    <input type="hidden" name="id_producto" value="<?php echo $id; ?>">
                                    <input type="hidden" name="accion" value="decrementar">
                                    <button type="submit" class="btn-cantidad">-</button>
                                </form>
                                
                                <span class="cantidad-valor"><?php echo $item['cantidad']; ?></span>
                                
                                <form method="POST" style="display: inline;">
                                    <input type="hidden" name="id_producto" value="<?php echo $id; ?>">
                                    <input type="hidden" name="accion" value="incrementar">
                                    <button type="submit" class="btn-cantidad">+</button>
                                </form>
                            </div>
                            
                            <div class="subtotal-item">
                                $<?php echo number_format($item['precio'] * $item['cantidad'], 2); ?>
                            </div>
                            
                            <form method="POST" style="display: inline;">
                                <input type="hidden" name="id_producto" value="<?php echo $id; ?>">
                                <input type="hidden" name="accion" value="eliminar">
                                <button type="submit" class="btn-eliminar">🗑️</button>
                            </form>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
            
            <div class="resumen">
                <h3>📋 Resumen del pedido</h3>
                
                <div class="linea-resumen">
                    <span>Subtotal:</span>
                    <span>$<?php echo number_format($subtotal, 2); ?></span>
                </div>
                
                <div class="linea-resumen">
                    <span>IVA (16%):</span>
                    <span>$<?php echo number_format($impuestos, 2); ?></span>
                </div>
                
                <div class="linea-resumen total">
                    <span>Total:</span>
                    <span>$<?php echo number_format($total, 2); ?></span>
                </div>
                
                <button class="btn-finalizar" onclick="alert('¡Compra finalizada! (Simulación)')">
                    ✓ Finalizar Compra
                </button>
            </div>
        <?php endif; ?>
        
        <div class="info">
            <strong>ℹ️ Ejercicio 4 - Carrito de Compras con Cookies</strong><br>
            Tu carrito se guarda en cookies y permanecerá disponible durante 7 días.
            Puedes cerrar el navegador y tus productos seguirán aquí.
        </div>
    </div>
</body>
</html>
