<?php
namespace SpotMap;

class Roles
{
    // Allowed roles hierarchy
    private static array $hierarchy = [
        'user' => 1,
        'moderator' => 5,
        'admin' => 10,
    ];

    public static function getUserRole(array $user): string
    {
        // Supabase user object may not include custom role; attempt fetch profile
        if (isset($user['role']) && isset(self::$hierarchy[$user['role']])) {
            return $user['role'];
        }
        // Placeholder: could call Supabase profiles table here
        return 'user';
    }

    public static function requireRole(array $user, array $allowed): void
    {
        $role = self::getUserRole($user);
        if (!in_array($role, $allowed, true)) {
            ApiResponse::unauthorized('Insufficient role');
        }
    }

    public static function atLeast(string $role, string $threshold): bool
    {
        return (self::$hierarchy[$role] ?? 0) >= (self::$hierarchy[$threshold] ?? 999);
    }
}
