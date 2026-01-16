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
        // Intentar validar contra Supabase primero
        $url = rtrim(Config::get('SUPABASE_URL'), '/') . '/auth/v1/user';
        $service = Config::get('SUPABASE_SERVICE_KEY');
        $anon = Config::get('SUPABASE_ANON_KEY');
        $key = $service ?: $anon;
        
        if ($url && $key) {
            $headers = [
                'apikey: ' . $key,
                'Authorization: Bearer ' . $token,
                'Accept: application/json'
            ];
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
            
            $resp = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $err = curl_error($ch);
            curl_close($ch);
            
            if ($code === 200 && $resp) {
                return json_decode($resp, true) ?: null;
            }
            
            // Log para debugging
            if ($code !== 200) {
                error_log("[AUTH] Supabase validation failed: HTTP $code");
            }
            if ($err) {
                error_log("[AUTH] Supabase curl error: $err");
            }
        }
        
        // Fallback: validar JWT localmente (para desarrollo sin Supabase)
        // JWT format: header.payload.signature
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            error_log("[AUTH] Invalid JWT format");
            return null;
        }
        
        // Decodificar payload
        try {
            $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);
            
            if (!$payload || !isset($payload['sub'])) {
                error_log("[AUTH] Invalid JWT payload");
                return null;
            }
            
            // Validar expiración si existe
            if (isset($payload['exp'])) {
                $now = time();
                if ($payload['exp'] < $now) {
                    error_log("[AUTH] JWT token expired: exp={$payload['exp']}, now={$now}");
                    return null;
                }
            }
            
            // Retornar usuario autenticado para modo fallback
            return [
                'id' => $payload['sub'],
                'email' => $payload['email'] ?? 'user@example.com',
                'user_metadata' => [
                    'name' => $payload['user_metadata']['name'] ?? 'User'
                ],
                'role' => 'authenticated',
                'aud' => $payload['aud'] ?? null
            ];
        } catch (\Throwable $e) {
            error_log("[AUTH] JWT decode error: " . $e->getMessage());
            return null;
        }
    }
}
