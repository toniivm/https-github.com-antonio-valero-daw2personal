<?php
require_once 'login.php';
$db_server = new mysqli($db_hostname, $db_username, $db_password, $db_database);

if ($db_server->connect_error) {
    die("Error de conexión: " . $db_server->connect_error);
}

$datos = [
    [1, 'Planta', 'Bulbasaur', 'Bulbasaur'],
    [4, 'Fuego', 'Charmander', 'Charmander'],
    [7, 'Agua', 'Squirtle', 'Squirtle']
];

foreach ($datos as $pokemon) {
    $id = $pokemon[0];
    $check = $db_server->query("SELECT id FROM pokemon WHERE id = $id");

    if ($check->num_rows === 0) {
        $query = "INSERT INTO pokemon VALUES ($id, '$pokemon[1]', '$pokemon[2]', '$pokemon[3]')";
        if ($db_server->query($query)) {
            echo "✅ Insertado: $pokemon[3]<br>";
        } else {
            echo "❌ Error al insertar $pokemon[3]: " . $db_server->error . "<br>";
        }
    } else {
        echo "⚠️ Ya existe el Pokémon con ID $id: $pokemon[3]<br>";
    }

    $check->free();
}

$db_server->close();
?>
