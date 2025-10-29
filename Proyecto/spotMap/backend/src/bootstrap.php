<?php
declare(strict_types=1);

use SpotMap\Database;

$dbHost = getenv('DB_HOST') ?: 'db';
$dbName = getenv('DB_DATABASE') ?: 'spotmap';
$dbUser = getenv('DB_USERNAME') ?: 'spotmap';
$dbPass = getenv('DB_PASSWORD') ?: 'spotmappw';
$dbPort = getenv('DB_PORT') ?: '3306';

$dsn = "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4";

Database::init($dsn, $dbUser, $dbPass);
