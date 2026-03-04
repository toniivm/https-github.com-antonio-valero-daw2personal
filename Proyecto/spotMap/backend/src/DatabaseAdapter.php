<?php
namespace SpotMap;

/**
 * Detecta y usa automáticamente Supabase o MySQL
 */
class DatabaseAdapter
{
    private static $useSupabase = null;
    private static $supabase = null;
    private static $hasUserIdColumn = null;
    private static array $columnExistsCache = [];

    private static function toTagList($tags): array
    {
        if (is_array($tags)) {
            return array_values(array_filter(array_map(static fn($tag) => strtolower(trim((string)$tag)), $tags)));
        }
        if (is_string($tags) && $tags !== '') {
            $decoded = json_decode($tags, true);
            if (is_array($decoded)) {
                return array_values(array_filter(array_map(static fn($tag) => strtolower(trim((string)$tag)), $decoded)));
            }
            return array_values(array_filter(array_map(static fn($tag) => strtolower(trim((string)$tag)), explode(',', $tags))));
        }
        return [];
    }

    private static function filterValueMatches(array $spot, string $field, ?string $filterValue): bool
    {
        if ($filterValue === null || $filterValue === '') {
            return true;
        }

        $needle = strtolower(trim($filterValue));
        $direct = isset($spot[$field]) ? strtolower(trim((string)$spot[$field])) : '';
        if ($direct !== '' && $direct === $needle) {
            return true;
        }

        $tags = self::toTagList($spot['tags'] ?? []);
        if (in_array($needle, $tags, true)) {
            return true;
        }

        foreach ($tags as $tag) {
            if (str_contains($tag, $needle)) {
                return true;
            }
        }

        return false;
    }

    private static function applyPhotoFilters(array $spots, array $filters): array
    {
        $schedule = isset($filters['schedule']) ? trim((string)$filters['schedule']) : null;
        if (($schedule === null || $schedule === '') && isset($filters['best_time'])) {
            $schedule = trim((string)$filters['best_time']);
        }
        $difficulty = isset($filters['difficulty']) ? trim((string)$filters['difficulty']) : null;
        $season = isset($filters['season']) ? trim((string)$filters['season']) : null;

        if (($schedule === null || $schedule === '') && ($difficulty === null || $difficulty === '') && ($season === null || $season === '')) {
            return $spots;
        }

        return array_values(array_filter($spots, static function($spot) use ($schedule, $difficulty, $season) {
            return self::filterValueMatches($spot, 'schedule', $schedule)
                && self::filterValueMatches($spot, 'difficulty', $difficulty)
                && self::filterValueMatches($spot, 'season', $season);
        }));
    }

    private static function hasPhotoFilters(array $filters): bool
    {
        $schedule = isset($filters['schedule']) ? trim((string)$filters['schedule']) : '';
        if ($schedule === '' && isset($filters['best_time'])) {
            $schedule = trim((string)$filters['best_time']);
        }

        $difficulty = isset($filters['difficulty']) ? trim((string)$filters['difficulty']) : '';
        $season = isset($filters['season']) ? trim((string)$filters['season']) : '';

        return $schedule !== '' || $difficulty !== '' || $season !== '';
    }

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
        $photoFiltersActive = self::hasPhotoFilters($filters);

        if (self::useSupabase()) {
            $queryLimit = $photoFiltersActive ? 1000 : $limit;
            $queryOffset = $photoFiltersActive ? 0 : $offset;

            $spots = self::getClient()->getAllSpots($queryLimit, $queryOffset, $filters);
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

            $spots = self::applyPhotoFilters($spots, $filters);
            $total = count($spots);

            if ($photoFiltersActive) {
                $spots = array_slice($spots, $offset, $limit);
            }

            return ['spots' => $spots, 'total' => $total];
        } else {
            $pdo = self::getClient();

            $where = [];
            $params = [];

            if (!empty($filters['category'])) {
                $where[] = 'category = :category';
                $params[':category'] = $filters['category'];
            }
            if (!empty($filters['tag'])) {
                $where[] = 'tags LIKE :tag';
                $params[':tag'] = '%' . $filters['tag'] . '%';
            }

            $whereSql = $where ? (' WHERE ' . implode(' AND ', $where)) : '';

            $querySql = 'SELECT * FROM spots' . $whereSql . ' ORDER BY created_at DESC';
            if (!$photoFiltersActive) {
                $querySql .= ' LIMIT :limit OFFSET :offset';
            }

            $stmt = $pdo->prepare($querySql);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value, \PDO::PARAM_STR);
            }
            if (!$photoFiltersActive) {
                $stmt->bindValue(':limit', $limit, \PDO::PARAM_INT);
                $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
            }
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
                $spot['tags'] = $spot['tags'] ? (json_decode($spot['tags'], true) ?? []) : [];
            });

            $spots = self::applyPhotoFilters($spots, $filters);
            $total = count($spots);

            if ($photoFiltersActive) {
                $spots = array_slice($spots, $offset, $limit);
            }

            return ['spots' => $spots, 'total' => $total];
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
            $latColumn = self::resolveLatitudeColumn();
            $lngColumn = self::resolveLongitudeColumn();

            $columns = ['title', 'description', $latColumn, $lngColumn, 'tags', 'category', 'image_path'];
            $params = [
                ':title' => $data['title'],
                ':description' => $data['description'] ?? null,
                ':' . $latColumn => $data['lat'],
                ':' . $lngColumn => $data['lng'],
                ':tags' => isset($data['tags']) ? json_encode($data['tags']) : null,
                ':category' => $data['category'] ?? null,
                ':image_path' => $data['image_path'] ?? null,
            ];

            if (self::hasUserIdColumn() && isset($data['user_id'])) {
                $columns[] = 'user_id';
                $params[':user_id'] = $data['user_id'];
            }

            foreach (['schedule', 'difficulty', 'season', 'status', 'image_path_2'] as $optionalColumn) {
                if (array_key_exists($optionalColumn, $data) && self::hasSpotColumn($optionalColumn)) {
                    $columns[] = $optionalColumn;
                    $params[':' . $optionalColumn] = $data[$optionalColumn];
                }
            }

            $placeholders = array_map(static fn($column) => ':' . $column, $columns);
            $sql = 'INSERT INTO spots (' . implode(', ', $columns) . ') VALUES (' . implode(', ', $placeholders) . ')';
            $stmt = $pdo->prepare($sql);

            $stmt->execute($params);
            $id = (int)$pdo->lastInsertId();
            // Asegurar que lat/lng estén presentes en respuesta
            $out = array_merge(['id' => $id], $data);
            if (!isset($out['lat']) && isset($data['latitude'])) $out['lat'] = (float)$data['latitude'];
            if (!isset($out['lng']) && isset($data['longitude'])) $out['lng'] = (float)$data['longitude'];
            return $out;
        }
    }

    private static function hasUserIdColumn(): bool
    {
        if (self::$hasUserIdColumn !== null) {
            return self::$hasUserIdColumn;
        }

        try {
            $pdo = self::getClient();
            $stmt = $pdo->query("SHOW COLUMNS FROM spots LIKE 'user_id'");
            self::$hasUserIdColumn = (bool)$stmt->fetch();
        } catch (\Throwable $e) {
            self::$hasUserIdColumn = false;
        }

        return self::$hasUserIdColumn;
    }

    private static function hasSpotColumn(string $column): bool
    {
        $cacheKey = 'spots.' . $column;
        if (array_key_exists($cacheKey, self::$columnExistsCache)) {
            return self::$columnExistsCache[$cacheKey];
        }

        try {
            $pdo = self::getClient();
            $stmt = $pdo->prepare("SHOW COLUMNS FROM spots LIKE :column");
            $stmt->execute([':column' => $column]);
            self::$columnExistsCache[$cacheKey] = (bool)$stmt->fetch();
        } catch (\Throwable $e) {
            self::$columnExistsCache[$cacheKey] = false;
        }

        return self::$columnExistsCache[$cacheKey];
    }

    private static function resolveLatitudeColumn(): string
    {
        if (self::hasSpotColumn('latitude')) {
            return 'latitude';
        }
        if (self::hasSpotColumn('lat')) {
            return 'lat';
        }
        return 'latitude';
    }

    private static function resolveLongitudeColumn(): string
    {
        if (self::hasSpotColumn('longitude')) {
            return 'longitude';
        }
        if (self::hasSpotColumn('lng')) {
            return 'lng';
        }
        return 'longitude';
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
            $fields = [];
            $params = [':id' => $id];

            if (isset($data['title'])) {
                $fields[] = 'title = :title';
                $params[':title'] = $data['title'];
            }
            if (isset($data['description'])) {
                $fields[] = 'description = :description';
                $params[':description'] = $data['description'];
            }
            if (isset($data['category'])) {
                $fields[] = 'category = :category';
                $params[':category'] = $data['category'];
            }
            if (isset($data['tags'])) {
                $fields[] = 'tags = :tags';
                $params[':tags'] = is_array($data['tags']) ? json_encode($data['tags']) : $data['tags'];
            }
            if (isset($data['image_path'])) {
                $fields[] = 'image_path = :image_path';
                $params[':image_path'] = $data['image_path'];
            }
            if (isset($data['image_path_2'])) {
                $fields[] = 'image_path_2 = :image_path_2';
                $params[':image_path_2'] = $data['image_path_2'];
            }
            if (isset($data['lat'])) {
                $latColumn = self::resolveLatitudeColumn();
                $fields[] = $latColumn . ' = :lat';
                $params[':lat'] = (float)$data['lat'];
            }
            if (isset($data['lng'])) {
                $lngColumn = self::resolveLongitudeColumn();
                $fields[] = $lngColumn . ' = :lng';
                $params[':lng'] = (float)$data['lng'];
            }
            if (isset($data['schedule']) && self::hasSpotColumn('schedule')) {
                $fields[] = 'schedule = :schedule';
                $params[':schedule'] = $data['schedule'];
            }
            if (isset($data['difficulty']) && self::hasSpotColumn('difficulty')) {
                $fields[] = 'difficulty = :difficulty';
                $params[':difficulty'] = $data['difficulty'];
            }
            if (isset($data['season']) && self::hasSpotColumn('season')) {
                $fields[] = 'season = :season';
                $params[':season'] = $data['season'];
            }
            if (isset($data['status']) && self::hasSpotColumn('status')) {
                $fields[] = 'status = :status';
                $params[':status'] = $data['status'];
            }

            if (!$fields) {
                return ['error' => 'No fields to update'];
            }

            $sql = 'UPDATE spots SET ' . implode(', ', $fields) . ', updated_at = NOW() WHERE id = :id';
            $stmt = $pdo->prepare($sql);
            $success = $stmt->execute($params);
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
