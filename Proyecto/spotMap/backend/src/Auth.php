<?php
namespace SpotMap;

/**
 * Auth helper para validar JWT de Supabase.
 * Estrategia simple: llamar al endpoint /auth/v1/user.
 * En producción se puede cachear la respuesta del usuario por jti/sub.
 */
class Auth
{
    public static function requireUser(): array
    {
        // Apache no pasa HTTP_AUTHORIZATION por defecto, probamos varias fuentes
        $hdr = $_SERVER['HTTP_AUTHORIZATION'] 
            ?? (function_exists('apache_request_headers') ? (apache_request_headers()['Authorization'] ?? '') : '')
            ?? (function_exists('getallheaders') ? (getallheaders()['Authorization'] ?? '') : '')
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
            ?? '';

        if (!str_starts_with($hdr, 'Bearer ')) {
            if (function_exists('apache_request_headers')) {
                error_log('[AUTH] Headers Apache: ' . print_r(apache_request_headers(), true));
            }
            error_log('[AUTH] _SERVER keys: ' . implode(', ', array_keys($_SERVER)));
            ApiResponse::unauthorized('Missing bearer token');
        }
        $token = substr($hdr, 7);
        $user = self::fetchUser($token);
        if (!$user) {
            ApiResponse::unauthorized('Invalid or expired token');
        }
        // Inject role placeholder if missing
        if (!isset($user['role'])) {
            $user['role'] = 'user';
        }
        return $user;
    }

    public static function fetchUser(string $token): ?array
    {
        $url = rtrim(Config::get('SUPABASE_URL'), '/') . '/auth/v1/user';
        $service = Config::get('SUPABASE_SERVICE_KEY');
        $anon = Config::get('SUPABASE_ANON_KEY');
        $key = $service ?: $anon;
        if (!$url || !$key) return null;
        $headers = [
            'apikey: ' . $key,
            'Authorization: Bearer ' . $token,
            'Accept: application/json'
        ];
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5); // Timeout total de 5 segundos
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3); // Timeout de conexión de 3 segundos
        $resp = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($code !== 200) return null;
        return json_decode($resp, true) ?: null;
    }
}
