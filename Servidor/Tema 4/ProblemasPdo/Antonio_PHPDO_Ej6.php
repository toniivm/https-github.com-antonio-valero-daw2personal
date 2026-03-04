<?php
// Ejercicio 6 - Transferencia entre cuentas (transacción)
// Restar 100€ de cuenta 1, sumar 100€ a cuenta 2
// Si falla algo, nada cambia

try {
    $host = 'localhost';
    $db = 'empresa_db';
    $user = 'root';
    $password = '';
    $charset = 'utf8mb4';
    
    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ];
    
    $pdo = new PDO($dsn, $user, $password, $options);
    
    $cuentaOrigen = 1;
    $cuentaDestino = 2;
    $monto = 100;
    
    // Iniciar transacción
    $pdo->beginTransaction();
    
    // Restar de origen
    $sql1 = "UPDATE cuentas SET saldo = saldo - ? WHERE id = ?";
    $stmt1 = $pdo->prepare($sql1);
    $stmt1->execute([$monto, $cuentaOrigen]);
    
    if ($stmt1->rowCount() == 0) {
        throw new Exception("Cuenta origen no existe: $cuentaOrigen");
    }
    
    // Sumar a destino
    $sql2 = "UPDATE cuentas SET saldo = saldo + ? WHERE id = ?";
    $stmt2 = $pdo->prepare($sql2);
    $stmt2->execute([$monto, $cuentaDestino]);
    
    if ($stmt2->rowCount() == 0) {
        throw new Exception("Cuenta destino no existe: $cuentaDestino");
    }
    
    // Confirmar transacción
    $pdo->commit();
    
    // Mostrar saldos
    $sqlGet = "SELECT id, saldo FROM cuentas WHERE id IN (?, ?)";
    $stmtGet = $pdo->prepare($sqlGet);
    $stmtGet->execute([$cuentaOrigen, $cuentaDestino]);
    $cuentas = $stmtGet->fetchAll();
    
    echo "<h2>✓ Transferencia completada</h2>";
    echo "<p><strong>Monto:</strong> €" . number_format($monto, 2, ',', '.') . "</p>";
    echo "<p><strong>De:</strong> Cuenta $cuentaOrigen → <strong>A:</strong> Cuenta $cuentaDestino</p>";
    
    echo "<h3>Saldos:</h3>";
    echo "<table border='1' cellpadding='10'>";
    echo "<tr><th>Cuenta</th><th>Saldo</th></tr>";
    foreach ($cuentas as $cuenta) {
        echo "<tr>";
        echo "<td>" . htmlspecialchars($cuenta['id']) . "</td>";
        echo "<td>€" . number_format($cuenta['saldo'], 2, ',', '.') . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<p><em>Si algo hubiera fallado, nada se habría guardado.</em></p>";
    
} catch (Exception $e) {
    // Rollback si hay error
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    error_log('Transaction error: ' . $e->getMessage(), 0);
    
    echo "<h2>✗ Error en transferencia</h2>";
    echo "<p>La transacción se canceló. No cambió nada.</p>";
    echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
}
?>
