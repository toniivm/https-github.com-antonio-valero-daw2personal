<?php
/**
 * Ejercicio 2: Preferencia de tema (claro/oscuro)
 * El usuario puede elegir entre tema claro u oscuro.
 * La preferencia se guarda en una cookie y se aplica al recargar.
 */

// Procesar cambio de tema
if (isset($_POST['tema'])) {
    $tema = $_POST['tema'];
    // Guardar cookie por 365 días
    setcookie('tema_preferido', $tema, time() + (86400 * 365), "/");
    header("Location: " . $_SERVER['PHP_SELF']);
    exit();
}

// Obtener tema de la cookie o usar 'claro' por defecto
$temaActual = isset($_COOKIE['tema_preferido']) ? $_COOKIE['tema_preferido'] : 'claro';
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preferencia de Tema - Cookies</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            transition: all 0.3s ease;
        }
        
        /* Estilos para tema claro */
        body.claro {
            background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
            color: #333;
        }
        
        body.claro .container {
            background: white;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        }
        
        body.claro .tema-card {
            border: 3px solid #ddd;
        }
        
        body.claro .tema-card.activo {
            border-color: #ff6b6b;
            background: #fff5f5;
        }
        
        /* Estilos para tema oscuro */
        body.oscuro {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #e0e0e0;
        }
        
        body.oscuro .container {
            background: #0f3460;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }
        
        body.oscuro h1,
        body.oscuro h2 {
            color: #e0e0e0;
        }
        
        body.oscuro .subtitle {
            color: #b0b0b0;
        }
        
        body.oscuro .tema-card {
            border: 3px solid #1a1a2e;
            background: #16213e;
        }
        
        body.oscuro .tema-card.activo {
            border-color: #00d4ff;
            background: #1e3a5f;
        }
        
        body.oscuro .tema-card h3 {
            color: #e0e0e0;
        }
        
        body.oscuro .info {
            background: #1e3a5f;
            border-left-color: #00d4ff;
            color: #b0d4ff;
        }
        
        .container {
            padding: 40px;
            border-radius: 15px;
            max-width: 600px;
            width: 100%;
            transition: all 0.3s ease;
        }
        
        h1 {
            margin-bottom: 10px;
            text-align: center;
        }
        
        .subtitle {
            color: #666;
            text-align: center;
            margin-bottom: 30px;
            font-size: 14px;
        }
        
        .tema-actual {
            text-align: center;
            margin-bottom: 30px;
            padding: 15px;
            border-radius: 10px;
            font-size: 18px;
            font-weight: 600;
        }
        
        body.claro .tema-actual {
            background: #fff3cd;
            color: #856404;
        }
        
        body.oscuro .tema-actual {
            background: #1e3a5f;
            color: #00d4ff;
        }
        
        .temas-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .tema-card {
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .tema-card:hover {
            transform: translateY(-5px);
        }
        
        .tema-card.activo {
            transform: scale(1.05);
        }
        
        .tema-icon {
            font-size: 60px;
            margin-bottom: 15px;
        }
        
        .tema-card h3 {
            margin-bottom: 10px;
            font-size: 20px;
        }
        
        .tema-card button {
            width: 100%;
            padding: 10px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            margin-top: 15px;
        }
        
        body.claro .tema-card button {
            background: #ff6b6b;
            color: white;
        }
        
        body.claro .tema-card button:hover {
            background: #ee5a52;
        }
        
        body.oscuro .tema-card button {
            background: #00d4ff;
            color: #0f3460;
        }
        
        body.oscuro .tema-card button:hover {
            background: #00b8d4;
        }
        
        .tema-card.activo button {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .info {
            border-left: 4px solid #2196f3;
            padding: 15px;
            border-radius: 5px;
            font-size: 14px;
        }
        
        body.claro .info {
            background: #e3f2fd;
            color: #1565c0;
        }
        
        .badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 10px;
        }
        
        body.claro .badge {
            background: #4caf50;
            color: white;
        }
        
        body.oscuro .badge {
            background: #00d4ff;
            color: #0f3460;
        }
    </style>
</head>
<body class="<?php echo $temaActual; ?>">
    <div class="container">
        <h1>🎨 Preferencia de Tema</h1>
        <p class="subtitle">Ejercicio 2 - Cookies en PHP</p>
        
        <div class="tema-actual">
            Tema actual: <strong><?php echo ucfirst($temaActual); ?></strong>
            <span class="badge">Guardado en cookie</span>
        </div>
        
        <div class="temas-grid">
            <div class="tema-card <?php echo $temaActual === 'claro' ? 'activo' : ''; ?>">
                <div class="tema-icon">☀️</div>
                <h3>Tema Claro</h3>
                <p>Brillante y luminoso</p>
                <form method="POST">
                    <input type="hidden" name="tema" value="claro">
                    <button type="submit" <?php echo $temaActual === 'claro' ? 'disabled' : ''; ?>>
                        <?php echo $temaActual === 'claro' ? 'Activo' : 'Activar'; ?>
                    </button>
                </form>
            </div>
            
            <div class="tema-card <?php echo $temaActual === 'oscuro' ? 'activo' : ''; ?>">
                <div class="tema-icon">🌙</div>
                <h3>Tema Oscuro</h3>
                <p>Suave para los ojos</p>
                <form method="POST">
                    <input type="hidden" name="tema" value="oscuro">
                    <button type="submit" <?php echo $temaActual === 'oscuro' ? 'disabled' : ''; ?>>
                        <?php echo $temaActual === 'oscuro' ? 'Activo' : 'Activar'; ?>
                    </button>
                </form>
            </div>
        </div>
        
        <div class="info">
            <strong>ℹ️ Información:</strong><br>
            Tu preferencia de tema se guarda en una cookie y se aplica automáticamente 
            cuando regresas a esta página. La cookie expira en 1 año.
        </div>
    </div>
</body>
</html>
