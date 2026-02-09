<?php
namespace SpotMap;

/**
 * Detecta y usa automáticamente Supabase o MySQL
 */
class DatabaseAdapter
{
    private static $useSupabase = null;
    private static $supabase = null;

    public static function useSupabase(): bool
    {
        if (self::$useSupabase === null) {
            $url = Config::get('SUPABASE_URL');
            $service = Config::get('SUPABASE_SERVICE_KEY');
            $anon = Config::get('SUPABASE_ANON_KEY');
            $key = $service ?: $anon;
            self::$useSupabase = !empty($url) && !empty($key);
        }
        return self::$useSupabase;
    }

    public static function getClient()
    {
        if (self::useSupabase()) {
            if (self::$supabase === null) {
                self::$supabase = new SupabaseClient();
            }
            return self::$supabase;
        }
        return Database::pdo();
    }

    public static function getAllSpots(int $limit = 100, int $offset = 0, array $filters = []): array
    {
        if (self::useSupabase()) {
            $spots = self::getClient()->getAllSpots($limit, $offset, $filters);
            $total = count($spots);
            
            // Parsear tags JSONB
            array_walk($spots, function(&$spot) {
                if (isset($spot['tags']) && is_string($spot['tags'])) {
                    $spot['tags'] = json_decode($spot['tags'], true) ?? [];
                }
            });
            
            // Popularity: if requested, enrich with aggregate popularity view (basic join by id)
            if (!empty($filters['popularity'])) {
                $pop = self::getClient()->getPopularity();
                $popIndex = [];
                foreach ($pop as $p) { $popIndex[$p['spot_id']] = $p; }
                foreach ($spots as &$s) {
                    $pid = $s['id'] ?? null;
                    if ($pid && isset($popIndex[$pid])) {
                        $s['popularity'] = $popIndex[$pid];
                    }
                }
            }
            // Distance filtering post-fetch (Haversine) if center + max_distance provided
            if (isset($filters['center_lat'], $filters['center_lng'], $filters['max_distance_km'])) {
                $clat = (float)$filters['center_lat'];
                $clng = (float)$filters['center_lng'];
                $maxD = (float)$filters['max_distance_km'];
                $spots = array_values(array_filter($spots, function($s) use ($clat,$clng,$maxD) {
                    if (!isset($s['lat'],$s['lng'])) return false;
                    $lat1 = deg2rad($clat); $lon1 = deg2rad($clng);
                    $lat2 = deg2rad((float)$s['lat']); $lon2 = deg2rad((float)$s['lng']);
                    $dlat = $lat2 - $lat1; $dlon = $lon2 - $lon1;
                    $a = sin($dlat/2)**2 + cos($lat1)*cos($lat2)*sin($dlon/2)**2;
                    $c = 2 * atan2(sqrt($a), sqrt(1-$a));
                    $distance = 6371 * $c;
                    return $distance <= $maxD;
                }));
                $total = count($spots);
            }
            return ['spots' => $spots, 'total' => $total];
        } else {
            $pdo = self::getClient();
            
            // Contar total
            $stmt = $pdo->query('SELECT COUNT(*) as total FROM spots');
            $total = (int)$stmt->fetch()['total'];
            
            // Obtener spots
            $stmt = $pdo->prepare('SELECT * FROM spots ORDER BY created_at DESC LIMIT :limit OFFSET :offset');
            $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
            $stmt->execute();
            $spots = $stmt->fetchAll();

            // Normalizar nombres de campos a frontend (lat/lng)
            array_walk($spots, function(&$spot) {
                if (array_key_exists('latitude', $spot) && !array_key_exists('lat', $spot)) {
                    $spot['lat'] = (float)$spot['latitude'];
                }
                if (array_key_exists('longitude', $spot) && !array_key_exists('lng', $spot)) {
                    $spot['lng'] = (float)$spot['longitude'];
                }
                $spot['tags'] = $spot['tags'] ? json_decode($spot['tags']) : [];
            });
            
            return ['spots' => $spots, 'total' => $total]; // Filters not implemented for local DB
        }
    }

    public static function getSpotById(int $id): array
    {
        if (self::useSupabase()) {
            $spot = self::getClient()->getSpot($id);
            if (!$spot) {
                return ['error' => 'Not found'];
            }
            if (isset($spot['tags']) && is_string($spot['tags'])) {
                $spot['tags'] = json_decode($spot['tags'], true) ?? [];
            }
            return $spot;
        } else {
            $pdo = self::getClient();
            $stmt = $pdo->prepare('SELECT * FROM spots WHERE id = :id LIMIT 1');
            $stmt->execute([':id' => $id]);
            $spot = $stmt->fetch();
            if (!$spot) {
                return ['error' => 'Not found'];
            }
            if (array_key_exists('latitude', $spot) && !array_key_exists('lat', $spot)) {
                $spot['lat'] = (float)$spot['latitude'];
            }
            if (array_key_exists('longitude', $spot) && !array_key_exists('lng', $spot)) {
                $spot['lng'] = (float)$spot['longitude'];
            }
            $spot['tags'] = $spot['tags'] ? json_decode($spot['tags']) : [];
            return $spot;
        }
    }

    public static function listSpotsByStatus(string $status, int $limit = 100, int $offset = 0, ?string $userToken = null): array
    {
        if (!self::useSupabase()) {
            return ['error' => 'Pending list requires Supabase backend'];
        }
        try {
            $spots = self::getClient()->listSpotsByStatus($status, $limit, $offset, $userToken);
            return ['spots' => $spots, 'total' => count($spots)];
        } catch (\Throwable $e) {
            return ['error' => $e->getMessage()];
        }
    }

    public static function getProfileRole(string $userId): ?string
    {
        if (!self::useSupabase()) {
            return null;
        }
        return self::getClient()->getProfileRole($userId);
    }

    public static function createSpot(array $data, ?string $userToken = null): array
    {
        if (self::useSupabase()) {
            return self::getClient()->createSpot($data, $userToken);
        } else {
            $pdo = self::getClient();
            $stmt = $pdo->prepare('
                INSERT INTO spots (title, description, latitude, longitude, tags, category, image_path)
                VALUES (:title, :desc, :lat, :lng, :tags, :cat, :image_path)
            ');
            $stmt->execute([
                ':title' => $data['title'],
                ':desc' => $data['description'] ?? null,
                ':lat' => $data['lat'],
                ':lng' => $data['lng'],
                ':tags' => isset($data['tags']) ? json_encode($data['tags']) : null,
                ':cat' => $data['category'] ?? null,
                ':image_path' => $data['image_path'] ?? null
            ]);
            $id = (int)$pdo->lastInsertId();
            // Asegurar que lat/lng estén presentes en respuesta
            $out = array_merge(['id' => $id], $data);
            if (!isset($out['lat']) && isset($data['latitude'])) $out['lat'] = (float)$data['latitude'];
            if (!isset($out['lng']) && isset($data['longitude'])) $out['lng'] = (float)$data['longitude'];
            return $out;
        }
    }

    public static function updateSpot(int $id, array $data, ?string $userToken = null): array
    {
        if (self::useSupabase()) {
            $result = self::getClient()->updateSpot($id, $data, $userToken);
            if (!$result) {
                return ['error' => 'Update failed'];
            }
            return self::getSpotById($id);
        } else {
            $pdo = self::getClient();
            $stmt = $pdo->prepare('UPDATE spots SET image_path = :path, updated_at = NOW() WHERE id = :id');
            $success = $stmt->execute([':path' => $data['image_path'], ':id' => $id]);
            if (!$success) {
                return ['error' => 'Update failed'];
            }
            return self::getSpotById($id);
        }
    }

    public static function deleteSpot(int $id, ?string $userToken = null): array
    {
        if (self::useSupabase()) {
            $success = self::getClient()->deleteSpot($id, $userToken);
            return $success ? ['success' => true] : ['error' => 'Delete failed'];
        } else {
            $pdo = self::getClient();
            $stmt = $pdo->prepare('DELETE FROM spots WHERE id = :id');
            $success = $stmt->execute([':id' => $id]);
            return $success ? ['success' => true] : ['error' => 'Delete failed'];
        }
    }

    /* ===== Extended Features (Supabase only) ===== */
    public static function favorite(string $userId, int $spotId, ?string $userToken = null): array
    {
        if (!self::useSupabase()) return ['error' => 'Favorites unsupported'];
        self::getClient()->favoriteSpot($userId, $spotId, $userToken);
        return ['success' => true];
    }
    public static function unfavorite(string $userId, int $spotId, ?string $userToken = null): array
    {
        if (!self::useSupabase()) return ['error' => 'Favorites unsupported'];
        self::getClient()->unfavoriteSpot($userId, $spotId, $userToken);
        return ['success' => true];
    }
    public static function favoritesOf(int $spotId): array
    {
        if (!self::useSupabase()) return [];
        return self::getClient()->listFavorites($spotId);
    }
    public static function commentsOf(int $spotId): array
    {
        if (!self::useSupabase()) return [];
        return self::getClient()->listComments($spotId);
    }
    public static function addComment(string $userId, int $spotId, string $body, ?string $userToken = null): array
    {
        if (!self::useSupabase()) return ['error' => 'Comments unsupported'];
        return self::getClient()->addComment($userId, $spotId, $body, $userToken);
    }
    public static function deleteComment(int $commentId, ?string $userToken = null): array
    {
        if (!self::useSupabase()) return ['error' => 'Comments unsupported'];
        self::getClient()->deleteComment($commentId, $userToken);
        return ['success' => true];
    }
    public static function rate(string $userId, int $spotId, int $score, ?string $userToken = null): array
    {
        if (!self::useSupabase()) return ['error' => 'Ratings unsupported'];
        return self::getClient()->rateSpot($userId, $spotId, $score, $userToken);
    }
    public static function ratingAggregate(int $spotId): array
    {
        if (!self::useSupabase()) return ['count' => 0, 'average' => 0];
        return self::getClient()->getRatingAggregate($spotId);
    }
    public static function report(string $userId, int $spotId, string $reason, ?string $userToken = null): array
    {
        if (!self::useSupabase()) return ['error' => 'Reports unsupported'];
        return self::getClient()->reportSpot($userId, $spotId, $reason, $userToken);
    }
    public static function listReports(string $status = 'pending', ?string $userToken = null): array
    {
        if (!self::useSupabase()) return [];
        return self::getClient()->listReports($status, $userToken);
    }
    public static function moderateReport(int $reportId, string $newStatus, string $moderatorId, ?string $note = null, ?string $userToken = null): array
    {
        if (!self::useSupabase()) return ['error' => 'Reports unsupported'];
        self::getClient()->moderateReport($reportId, $newStatus, $moderatorId, $note, $userToken);
        return ['success' => true];
    }
}
