<?php
/**
 * ⚠️ CÓDIGO PROPIETARIO - SPOTMAP ⚠️
 * Copyright (c) 2025 Antonio Valero
 * Todos los derechos reservados.
 * 
 * Sistema de seguridad avanzado para protección del backend
 * CONFIDENCIAL - Para uso interno únicamente
 */

declare(strict_types=1);

namespace SpotMap;

class SecurityHardening {
    
    private static array $suspiciousIPs = [];
    private static array $blockedIPs = [];
    private static int $maxRequestsPerMinute = 60;
    private static int $maxFailedLogins = 5;
    
    /**
     * Protección CSRF - Generar token
     */
    public static function generateCSRFToken(): string {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $token = bin2hex(random_bytes(32));
        $_SESSION['csrf_token'] = $token;
        $_SESSION['csrf_time'] = time();
        
        return $token;
    }
    
    /**
     * Protección CSRF - Validar token
     */
    public static function validateCSRFToken(string $token): bool {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['csrf_token']) || !isset($_SESSION['csrf_time'])) {
            return false;
        }
        
        // Token expira en 1 hora
        if (time() - $_SESSION['csrf_time'] > 3600) {
            unset($_SESSION['csrf_token']);
            unset($_SESSION['csrf_time']);
            return false;
        }
        
        return hash_equals($_SESSION['csrf_token'], $token);
    }
    
    /**
     * Rate limiting agresivo por IP
     */
    public static function checkRateLimit(): bool {
        $ip = self::getClientIP();
        $currentMinute = (int)(time() / 60);
        $key = $ip . '_' . $currentMinute;
        
        // Verificar si IP está bloqueada
        if (self::isIPBlocked($ip)) {
            http_response_code(403);
            die(json_encode([
                'success' => false,
                'error' => [
                    'code' => 403,
                    'message' => 'IP bloqueada por actividad sospechosa'
                ]
            ]));
        }
        
        // Inicializar contador
        if (!isset($_SESSION['rate_limit'][$key])) {
            $_SESSION['rate_limit'][$key] = 0;
        }
        
        $_SESSION['rate_limit'][$key]++;
        
        // Límite excedido
        if ($_SESSION['rate_limit'][$key] > self::$maxRequestsPerMinute) {
            self::flagSuspiciousIP($ip, 'rate_limit_exceeded');
            return false;
        }
        
        // Limpiar contadores antiguos
        self::cleanupRateLimitSession();
        
        return true;
    }
    
    /**
     * Sanitización avanzada de inputs
     */
    public static function sanitizeInput(mixed $input, string $type = 'string'): mixed {
        if (is_array($input)) {
            return array_map(function($item) use ($type) {
                return self::sanitizeInput($item, $type);
            }, $input);
        }
        
        switch ($type) {
            case 'string':
                $input = strip_tags($input);
                $input = htmlspecialchars($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
                break;
                
            case 'email':
                $input = filter_var($input, FILTER_SANITIZE_EMAIL);
                break;
                
            case 'url':
                $input = filter_var($input, FILTER_SANITIZE_URL);
                break;
                
            case 'int':
                $input = filter_var($input, FILTER_SANITIZE_NUMBER_INT);
                break;
                
            case 'float':
                $input = filter_var($input, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
                break;
                
            case 'sql':
                // Escapar caracteres peligrosos para SQL
                $input = str_replace(["'", '"', ';', '--', '/*', '*/'], '', $input);
                break;
        }
        
        // Detectar patrones de ataque comunes
        $dangerousPatterns = [
            '/<script\b[^>]*>(.*?)<\/script>/is',
            '/javascript:/i',
            '/on\w+\s*=/i',
            '/eval\s*\(/i',
            '/UNION.*SELECT/i',
            '/DROP.*TABLE/i',
            '/INSERT.*INTO/i',
            '/UPDATE.*SET/i',
            '/DELETE.*FROM/i',
        ];
        
        foreach ($dangerousPatterns as $pattern) {
            if (preg_match($pattern, $input)) {
                self::flagSuspiciousIP(self::getClientIP(), 'injection_attempt');
                throw new \Exception('Input contains potentially malicious content');
            }
        }
        
        return $input;
    }
    
    /**
     * Encriptar datos sensibles (AES-256-CBC)
     */
    public static function encrypt(string $data, string $key): string {
        $iv = random_bytes(16);
        $encrypted = openssl_encrypt(
            $data,
            'AES-256-CBC',
            hash('sha256', $key, true),
            0,
            $iv
        );
        
        return base64_encode($iv . $encrypted);
    }
    
    /**
     * Desencriptar datos
     */
    public static function decrypt(string $data, string $key): string {
        $data = base64_decode($data);
        $iv = substr($data, 0, 16);
        $encrypted = substr($data, 16);
        
        return openssl_decrypt(
            $encrypted,
            'AES-256-CBC',
            hash('sha256', $key, true),
            0,
            $iv
        );
    }
    
    /**
     * Obtener IP real del cliente (detrás de proxies/CDN)
     */
    private static function getClientIP(): string {
        $ipKeys = [
            'HTTP_CF_CONNECTING_IP', // Cloudflare
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'HTTP_CLIENT_IP',
            'REMOTE_ADDR'
        ];
        
        foreach ($ipKeys as $key) {
            if (isset($_SERVER[$key])) {
                $ip = $_SERVER[$key];
                if (strpos($ip, ',') !== false) {
                    $ips = explode(',', $ip);
                    $ip = trim($ips[0]);
                }
                
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
        
        return '0.0.0.0';
    }
    
    /**
     * Marcar IP como sospechosa
     */
    private static function flagSuspiciousIP(string $ip, string $reason): void {
        if (!isset(self::$suspiciousIPs[$ip])) {
            self::$suspiciousIPs[$ip] = [];
        }
        
        self::$suspiciousIPs[$ip][] = [
            'reason' => $reason,
            'timestamp' => time()
        ];
        
        // Registrar en log
        \SpotMap\Logger::warning("Actividad sospechosa detectada", [
            'ip' => $ip,
            'reason' => $reason,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ]);
        
        // Bloquear después de 3 infracciones
        if (count(self::$suspiciousIPs[$ip]) >= 3) {
            self::blockIP($ip);
        }
    }
    
    /**
     * Bloquear IP permanentemente
     */
    private static function blockIP(string $ip): void {
        self::$blockedIPs[] = $ip;
        
        // Guardar en archivo para persistencia
        $blockedFile = __DIR__ . '/../../config/blocked_ips.txt';
        file_put_contents($blockedFile, $ip . PHP_EOL, FILE_APPEND | LOCK_EX);
        
        \SpotMap\Logger::error("IP bloqueada permanentemente", ['ip' => $ip]);
    }
    
    /**
     * Verificar si IP está bloqueada
     */
    private static function isIPBlocked(string $ip): bool {
        // Cargar IPs bloqueadas del archivo
        $blockedFile = __DIR__ . '/../../config/blocked_ips.txt';
        if (file_exists($blockedFile)) {
            $blockedIPs = file($blockedFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            return in_array($ip, $blockedIPs);
        }
        
        return in_array($ip, self::$blockedIPs);
    }
    
    /**
     * Limpiar sesión de rate limiting (mantener solo último minuto)
     */
    private static function cleanupRateLimitSession(): void {
        if (!isset($_SESSION['rate_limit'])) {
            return;
        }
        
        $currentMinute = (int)(time() / 60);
        
        foreach (array_keys($_SESSION['rate_limit']) as $key) {
            $keyMinute = (int)explode('_', $key)[1] ?? 0;
            if ($currentMinute - $keyMinute > 5) {
                unset($_SESSION['rate_limit'][$key]);
            }
        }
    }
    
    /**
     * Headers de seguridad avanzados
     */
    public static function setAdvancedSecurityHeaders(): void {
        // CSP estricto
        header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://ptjkepxsjqyejkynjewc.supabase.co; frame-ancestors 'none';");
        
        // Protección XSS
        header('X-XSS-Protection: 1; mode=block');
        
        // Prevenir MIME sniffing
        header('X-Content-Type-Options: nosniff');
        
        // Clickjacking protection
        header('X-Frame-Options: DENY');
        
        // HTTPS only
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
        
        // Referrer policy
        header('Referrer-Policy: strict-origin-when-cross-origin');
        
        // Permissions policy
        header("Permissions-Policy: geolocation=(self), microphone=(), camera=()");
        
        // Custom security header (watermark)
        header('X-SpotMap-Protected: true');
        header('X-Copyright: (c) 2025 Antonio Valero. Todos los derechos reservados.');
    }
    
    /**
     * Validar fingerprint del cliente
     */
    public static function validateClientFingerprint(): bool {
        $fingerprint = $_SERVER['HTTP_X_SPOTMAP_FINGERPRINT'] ?? null;
        
        if (!$fingerprint) {
            return false;
        }
        
        // Validar formato del fingerprint
        if (!preg_match('/^[a-z0-9]{8,16}$/', $fingerprint)) {
            self::flagSuspiciousIP(self::getClientIP(), 'invalid_fingerprint');
            return false;
        }
        
        return true;
    }
}
