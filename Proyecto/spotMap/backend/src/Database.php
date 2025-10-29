<?php
namespace SpotMap;

use PDO;

class Database
{
    private static ?PDO $pdo = null;

    public static function init(): void
    {
        if (self::$pdo) return;

        $host = '127.0.0.1';
        $db   = 'spotmap';
        $user = 'root';      // Usuario XAMPP
        $pass = '';          // Contraseña por defecto en XAMPP
        $charset = 'utf8mb4';

        $dsn = "mysql:host=$host;dbname=$db;charset=$charset";

        self::$pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }

    public static function pdo(): PDO
    {
        if (!self::$pdo) self::init();
        return self::$pdo;
    }
}
