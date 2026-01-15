<?php
namespace SpotMap;

/**
 * Clase para manejo de seguridad en la API
 * Incluye sanitización, rate limiting, CORS
 */
class Security
{
    private static ?string $nonce = null;
    /**
     * Configurar headers CORS
     * @param string $allowedOrigin - Origin permitido (ej: http://localhost)
     */
    public static function setCORSHeaders($allowedOrigin = null)
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowCredentials = false;

        // Si se especifica origin, validar
        if ($allowedOrigin) {
            if ($origin !== $allowedOrigin) {
                header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS, PUT");
                header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
                header("Access-Control-Max-Age: 86400"); // 24 horas
                return;
            }
            $allowCredentials = true;
        } else {
            if ($origin !== '') {
                $allowCredentials = true;
            }
        }

        $allowOrigin = $origin !== '' ? $origin : '*';
        header("Access-Control-Allow-Origin: $allowOrigin");
        header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS, PUT");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        if ($allowCredentials && $allowOrigin !== '*') {
            header("Access-Control-Allow-Credentials: true");
        }
        header("Access-Control-Max-Age: 86400"); // 24 horas
    }

    /**
     * Configurar headers de seguridad
     */
    public static function setSecurityHeaders()
    {
        if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
            header("Strict-Transport-Security: max-age=31536000; includeSubDomains; preload");
        }
        // Prevenir clickjacking
        header("X-Frame-Options: DENY");
        
        // Prevenir MIME sniffing
        header("X-Content-Type-Options: nosniff");
        
        // Prevenir XSS
        header("X-XSS-Protection: 1; mode=block");
        
        // Referrer policy
        header("Referrer-Policy: strict-origin-when-cross-origin");
        
        // Feature policy (ahora Permissions-Policy)
        header("Permissions-Policy: geolocation=(self), camera=()");

        // Content Security Policy dinámica basada en Config
        \SpotMap\Config::load();
        $nonce = self::getNonce();
        $csp = [
            'default-src ' . \SpotMap\Config::get('CSP_DEFAULT', "'self'"),
            'script-src ' . \SpotMap\Config::get('CSP_SCRIPT', "'self'") . " 'nonce-$nonce'",
            'style-src ' . \SpotMap\Config::get('CSP_STYLE', "'self'"),
            'img-src ' . \SpotMap\Config::get('CSP_IMG', "'self'"),
            'font-src ' . \SpotMap\Config::get('CSP_FONT', "'self'"),
            'connect-src ' . \SpotMap\Config::get('CSP_CONNECT', "'self'"),
            'object-src ' . \SpotMap\Config::get('CSP_OBJECT', "'none'"),
            'base-uri ' . \SpotMap\Config::get('CSP_BASE', "'self'"),
            'frame-ancestors ' . \SpotMap\Config::get('CSP_FRAME_ANCESTORS', "'none'"),
        ];
        header('Content-Security-Policy: ' . implode('; ', $csp));
        header('X-CSP-Nonce: ' . $nonce);
    }

    /**
     * Sanitizar string para prevenir inyección
     * @param string $input - Input a sanitizar
     * @return string - String sanitizado
     */
    public static function sanitizeString($input)
    {
        if (!is_string($input)) {
            return $input;
        }

        // Remover caracteres de control
        $sanitized = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $input);
        
        // Trim
        $sanitized = trim($sanitized);
        
        // Escape HTML entities
        $sanitized = htmlspecialchars($sanitized, ENT_QUOTES, 'UTF-8');
        
        return $sanitized;
    }

    /**
     * Sanitizar array recursivamente
     * @param array $input - Array a sanitizar
     * @return array - Array sanitizado
     */
    public static function sanitizeArray($input)
    {
        if (!is_array($input)) {
            return [self::sanitizeString($input)];
        }

        $sanitized = [];
        foreach ($input as $key => $value) {
            $key = self::sanitizeString($key);
            $value = is_array($value) ? self::sanitizeArray($value) : self::sanitizeString($value);
            $sanitized[$key] = $value;
        }

        return $sanitized;
    }

    /**
     * Verificar rate limiting (simple, basado en IP)
     * @param int $maxRequests - Máximo de requests permitidos
     * @param int $timeWindow - Ventana de tiempo en segundos
     * @return bool - True si está dentro del límite
     */
    public static function checkRateLimit($maxRequests = 100, $timeWindow = 60)
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $cacheKey = "rate_limit_" . md5($ip);
        $cacheFile = sys_get_temp_dir() . '/' . $cacheKey . '.tmp';

        $now = time();

        // Leer cache anterior
        $data = [];
        if (file_exists($cacheFile)) {
            $content = file_get_contents($cacheFile);
            $data = json_decode($content, true) ?? [];
        }

        // Limpiar requests antiguos
        $data['requests'] = array_filter($data['requests'] ?? [], function($timestamp) use ($now, $timeWindow) {
            return ($now - $timestamp) < $timeWindow;
        });

        // Verificar límite
        if (count($data['requests']) >= $maxRequests) {
            header("HTTP/1.1 429 Too Many Requests");
            header("Retry-After: " . $timeWindow);
            header("X-RateLimit-Limit: $maxRequests");
            header("X-RateLimit-Remaining: 0");
            header("X-RateLimit-Reset: " . ($now + $timeWindow));
            return false;
        }

        // Agregar request actual
        $data['requests'][] = $now;

        // Guardar cache
        file_put_contents($cacheFile, json_encode($data));

        // Headers informativos
        header("X-RateLimit-Limit: $maxRequests");
        header("X-RateLimit-Remaining: " . max(0, $maxRequests - count($data['requests'])));
        header("X-RateLimit-Reset: " . ($now + $timeWindow));

        return true;
    }

    /**
     * Validar que la solicitud es JSON válida
     * @return bool
     */
    public static function isValidJSON()
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        
        if (strpos($contentType, 'application/json') === false) {
            return false;
        }

        return true;
    }

    /**
     * Generar nonce para CSRF protection
     * @return string
     */
    public static function generateNonce()
    {
        return bin2hex(random_bytes(16));
    }

    /**
     * Validar nonce CSRF
     * @param string $nonce - Nonce a validar
     * @return bool
     */
    public static function validateNonce($nonce)
    {
        // Validación básica: verificar formato hexadecimal de 64 caracteres
        return is_string($nonce) && strlen($nonce) === 64 && ctype_xdigit($nonce);
    }

    /**
     * Obtener (o crear) nonce usado en CSP del request actual
     */
    public static function getNonce(): string
    {
        if (self::$nonce === null) {
            self::$nonce = self::generateNonce();
        }
        return self::$nonce;
    }

    /**
     * Obtener IP del cliente (considerando proxies)
     * @return string
     */
    public static function getClientIP()
    {
        $ip = '';

        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            $ip = trim($ips[0]);
        } else {
            $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        }

        // Validar que sea IP válida
        if (filter_var($ip, FILTER_VALIDATE_IP)) {
            return $ip;
        }

        return 'unknown';
    }

    /**
     * Registrar acceso (logging simple)
     * @param string $method - HTTP method (GET, POST, etc)
     * @param string $endpoint - Endpoint accedido
     * @param int $statusCode - Status code de respuesta
     */
    public static function logAccess($method, $endpoint, $statusCode)
    {
        $logDir = __DIR__ . '/../../logs';
        
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $ip = self::getClientIP();
        $timestamp = date('Y-m-d H:i:s');
        $logFile = $logDir . '/api_' . date('Y-m-d') . '.log';

        $logLine = "[$timestamp] $method $endpoint | Status: $statusCode | IP: $ip\n";
        file_put_contents($logFile, $logLine, FILE_APPEND);
    }
}
