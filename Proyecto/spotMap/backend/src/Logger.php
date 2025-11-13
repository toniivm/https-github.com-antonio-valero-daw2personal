<?php
namespace SpotMap;

class Logger
{
    const LEVEL_DEBUG = 'DEBUG';
    const LEVEL_INFO = 'INFO';
    const LEVEL_WARN = 'WARN';
    const LEVEL_ERROR = 'ERROR';

    private static array $levels = [
        self::LEVEL_DEBUG => 0,
        self::LEVEL_INFO => 1,
        self::LEVEL_WARN => 2,
        self::LEVEL_ERROR => 3,
    ];

    private static ?string $requestId = null;
    private static bool $initialized = false;

    private static function init(): void
    {
        if (self::$initialized) return;
        // Generar un requestId estable por petición (o CLI ejecución)
        self::$requestId = bin2hex(random_bytes(6));
        self::$initialized = true;
    }

    public static function getRequestId(): string
    {
        self::init();
        return self::$requestId ?? 'unknown';
    }

    private static function shouldLog(string $level): bool
    {
        $configLevel = Config::get('LOG_LEVEL', 'INFO');
        $configLevel = strtoupper($configLevel);
        return (self::$levels[$level] ?? 999) >= (self::$levels[$configLevel] ?? 1);
    }

    private static function format(string $level, string $message, ?array $context = null): string
    {
        self::init();
        $format = Config::get('LOG_FORMAT', 'TEXT'); // TEXT | JSON
        $timestamp = date('c');
        $base = [
            'ts' => $timestamp,
            'level' => $level,
            'msg' => $message,
            'requestId' => self::$requestId,
            'env' => Config::get('ENV', 'development'),
        ];
        if ($context) {
            $base['context'] = $context;
        }

        if (strtoupper($format) === 'JSON') {
            return json_encode($base, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }

        // Formato texto legible
        $text = "[{$base['ts']}] [{$base['level']}] [req:" . $base['requestId'] . "] {$base['msg']}";
        if ($context) {
            $text .= " | " . json_encode($context, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }
        return $text;
    }

    private static function output(string $formatted): void
    {
        $logFile = Config::get('LOG_FILE');
        if ($logFile) {
            // Escribir en archivo (append) con bloqueo básico
            @file_put_contents($logFile, $formatted . PHP_EOL, FILE_APPEND | LOCK_EX);
        } else {
            error_log($formatted);
        }
    }

    public static function debug(string $message, ?array $context = null): void
    {
        if (!Config::isDebug()) return; // Solo en modo debug
        if (self::shouldLog(self::LEVEL_DEBUG)) {
            self::output(self::format(self::LEVEL_DEBUG, $message, $context));
        }
    }

    public static function info(string $message, ?array $context = null): void
    {
        if (self::shouldLog(self::LEVEL_INFO)) {
            self::output(self::format(self::LEVEL_INFO, $message, $context));
        }
    }

    public static function warn(string $message, ?array $context = null): void
    {
        if (self::shouldLog(self::LEVEL_WARN)) {
            self::output(self::format(self::LEVEL_WARN, $message, $context));
        }
    }

    public static function error(string $message, ?array $context = null): void
    {
        if (self::shouldLog(self::LEVEL_ERROR)) {
            self::output(self::format(self::LEVEL_ERROR, $message, $context));
        }
    }

    public static function exception(\Throwable $e, string $prefix = 'Exception'): void
    {
        self::error("$prefix: {$e->getMessage()}", [
            'code' => $e->getCode(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => Config::isDebug() ? $e->getTraceAsString() : null,
        ]);
    }
}
