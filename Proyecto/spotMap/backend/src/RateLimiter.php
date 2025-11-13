<?php
namespace SpotMap;

class RateLimiter
{
    private static array $requestLog = [];

    public static function check(string $identifier = 'default'): bool
    {
        if (!Config::get('RATE_LIMIT_ENABLED', false)) {
            return true;
        }

        $maxRequests = Config::get('RATE_LIMIT_REQUESTS', 100);
        $window = Config::get('RATE_LIMIT_WINDOW', 3600);
        $now = time();
        $key = $identifier;

        // Inicializar si no existe
        if (!isset(self::$requestLog[$key])) {
            self::$requestLog[$key] = [];
        }

        // Limpiar solicitudes fuera de la ventana
        self::$requestLog[$key] = array_filter(
            self::$requestLog[$key],
            fn($timestamp) => ($now - $timestamp) < $window
        );

        // Comprobar si se excedió el límite
        if (count(self::$requestLog[$key]) >= $maxRequests) {
            return false;
        }

        // Registrar esta solicitud
        self::$requestLog[$key][] = $now;

        return true;
    }

    public static function getRemaining(string $identifier = 'default'): int
    {
        if (!Config::get('RATE_LIMIT_ENABLED', false)) {
            return -1;
        }

        $maxRequests = Config::get('RATE_LIMIT_REQUESTS', 100);
        $count = count(self::$requestLog[$identifier] ?? []);

        return max(0, $maxRequests - $count);
    }
}
