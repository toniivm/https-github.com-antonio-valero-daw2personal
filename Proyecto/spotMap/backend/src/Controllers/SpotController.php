<?php
namespace SpotMap\Controllers;

use SpotMap\DatabaseAdapter;
use SpotMap\ApiResponse;
use SpotMap\Validator;
use SpotMap\Cache;
use SpotMap\Auth;

class SpotController
{
    /**
     * GET /spots - Listar todos los spots con paginación
     */
    public function index(): void
    {
        try {
            $page = max(1, (int)($_GET['page'] ?? 1));
            $limit = min(100, (int)($_GET['limit'] ?? 50));
            $offset = ($page - 1) * $limit;
            // Advanced filters (category, tag, min_rating) placeholder parsing
            $category = $_GET['category'] ?? null;
            $tag = $_GET['tag'] ?? null;
            $minRating = isset($_GET['min_rating']) ? (float)$_GET['min_rating'] : null;

            // Cache primero
            $cacheKey = "spots_{$page}_{$limit}";
            $cached = Cache::get($cacheKey);
            if ($cached !== null) {
                ApiResponse::success($cached);
                return;
            }

            $filters = [
                'category' => $category,
                'tag' => $tag,
                'schedule' => $_GET['schedule'] ?? null,
                'popularity' => isset($_GET['popularity']) ? (bool)$_GET['popularity'] : false,
                'center_lat' => $_GET['center_lat'] ?? null,
                'center_lng' => $_GET['center_lng'] ?? null,
                'max_distance_km' => $_GET['max_distance_km'] ?? null
            ];
            $result = DatabaseAdapter::getAllSpots($limit, $offset, $filters);
            
            if (isset($result['error'])) {
                ApiResponse::error($result['error'], 500);
                return;
            }

            $spots = $result['spots'] ?? [];
            $total = $result['total'] ?? count($spots);

            // Procesar tags JSON si es string
            array_walk($spots, function(&$spot) {
                if (isset($spot['tags']) && is_string($spot['tags'])) {
                    $spot['tags'] = json_decode($spot['tags']) ?: [];
                } else if (!isset($spot['tags'])) {
                    $spot['tags'] = [];
                }
            });

            // Field selection for list
            if (isset($_GET['fields'])) {
                $fields = array_filter(array_map('trim', explode(',', $_GET['fields'])));
                if ($fields) {
                    $spots = array_map(function($s) use ($fields) {
                        $filtered = [];
                        foreach ($fields as $f) if (array_key_exists($f, $s)) $filtered[$f] = $s[$f];
                        return $filtered;
                    }, $spots);
                }
            }

            $payload = [
                'spots' => $spots,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => (int)$total,
                    'pages' => ceil($total / $limit)
                ],
                'filters' => $filters
            ];
            // ETag y Last-Modified
            $lastModified = null;
            foreach ($spots as $s) {
                if (isset($s['created_at'])) {
                    $ts = strtotime($s['created_at']);
                    if ($ts && ($lastModified === null || $ts > $lastModified)) {
                        $lastModified = $ts;
                    }
                }
            }
            $etag = 'W/"spots_' . md5(json_encode(array_column($spots, 'id'))) . '"';
            // Condicional If-None-Match
            $ifNone = $_SERVER['HTTP_IF_NONE_MATCH'] ?? null;
            if ($ifNone && $ifNone === $etag) {
                \SpotMap\ApiResponse::notModified($etag, $lastModified);
            }
            if (!headers_sent()) {
                if ($lastModified) header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $lastModified) . ' GMT');
                header('ETag: ' . $etag);
            }
            // Cache persistente
            Cache::set($cacheKey, $payload, 60);
            ApiResponse::success($payload);

        } catch (\Exception $e) {
            ApiResponse::serverError($e->getMessage());
        }
    }

    /**
     * POST /spots - Crear nuevo spot con validación robusta
     * Soporta tanto JSON como FormData (para upload de fotos)
     */
    public function store(): void
    {
        try {
            // Auth requerido para crear
            $user = Auth::requireUser();
            // Obtener datos: JSON o FormData
            $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
            
            $input = null;
        
            if (strpos($contentType, 'multipart/form-data') !== false) {
                $input = $_POST;
            } else {
                $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
            }

            if (!is_array($input)) {
                ApiResponse::error('Invalid request data', 400);
                return;
            }
        
            // Parsear JSON fields si es necesario
            if (isset($input['tags']) && is_string($input['tags'])) {
                $tags = json_decode($input['tags'], true);
                $input['tags'] = is_array($tags) ? $tags : [];
            }

            // Validar
            $validator = new Validator();
            $validator->required($input['title'] ?? '', 'title');
            $validator->required($input['lat'] ?? '', 'lat');
            $validator->required($input['lng'] ?? '', 'lng');
            $validator->string($input['title'] ?? '', 'title', 1, 255);
            $validator->numeric($input['lat'] ?? '', 'lat');
            $validator->numeric($input['lng'] ?? '', 'lng');

            if (isset($input['lat']) && is_numeric($input['lat'])) {
                $validator->latitude($input['lat'], 'lat');
            }
            if (isset($input['lng']) && is_numeric($input['lng'])) {
                $validator->longitude($input['lng'], 'lng');
            }

            if ($validator->fails()) {
                ApiResponse::validation($validator->errors());
                return;
            }

            // Preparar datos
            $spotData = [
                'title' => trim($input['title']),
                'description' => trim($input['description'] ?? ''),
                'lat' => (float)$input['lat'],
                'lng' => (float)$input['lng'],
                'category' => isset($input['category']) ? trim($input['category']) : null,
                'tags' => isset($input['tags']) && is_array($input['tags']) ? $input['tags'] : []
            ];
            // Ownership
            if (\SpotMap\Config::get('OWNERSHIP_ENABLED') && isset($user['id'])) {
                $spotData['user_id'] = $user['id'];
            }

            // Manejar foto si está presente (si Supabase: usar Storage; si no: disco local)
            if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
                $photo = $_FILES['photo'];
                $maxSize = 5 * 1024 * 1024; // 5MB
                $validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
                if ($photo['size'] > $maxSize) {
                    ApiResponse::validation(['photo' => ['Photo cannot exceed 5MB']]);
                    return;
                }
                if (!in_array($photo['type'], $validTypes)) {
                    ApiResponse::validation(['photo' => ['Invalid photo format']]);
                    return;
                }
                $ext = pathinfo($photo['name'], PATHINFO_EXTENSION);
                $filename = uniqid('spot_') . '.' . $ext;

                if (\SpotMap\DatabaseAdapter::useSupabase()) {
                    // Subida a Supabase Storage (bucket 'spots')
                    try {
                        $bucket = 'spots';
                        $path = $bucket . '/' . $filename;
                        $fileContents = file_get_contents($photo['tmp_name']);
                        $uploadOk = \SpotMap\SupabaseStorage::upload($path, $fileContents, $photo['type']);
                        if ($uploadOk) {
                            $publicUrl = \SpotMap\SupabaseStorage::publicUrl($path);
                            $spotData['image_path'] = $publicUrl;
                        }
                    } catch (\Throwable $e) {
                        ApiResponse::error('Storage upload failed: ' . $e->getMessage(), 500);
                        return;
                    }
                } else {
                    $uploadDir = __DIR__ . '/../../public/uploads/spots/';
                    if (!is_dir($uploadDir)) {
                        mkdir($uploadDir, 0755, true);
                    }
                    $uploadPath = $uploadDir . $filename;
                    if (move_uploaded_file($photo['tmp_name'], $uploadPath)) {
                        $spotData['image_path'] = '/uploads/spots/' . $filename;
                    }
                }
            }

            // Crear spot usando DatabaseAdapter
            $result = DatabaseAdapter::createSpot($spotData);

            if (isset($result['error'])) {
                ApiResponse::error($result['error'], 500);
                return;
            }

            Cache::flushPattern('spots_*');
            ApiResponse::success($result, 'Spot created successfully', 201);

        } catch (\Exception $e) {
            ApiResponse::serverError($e->getMessage());
        }
    }

    /**
     * PUT /spots/{id} - Actualizar datos (solo propietario o moderador/admin)
     */
    public function update(int $id): void
    {
        try {
            $user = Auth::requireUser();
            if ($id <= 0) ApiResponse::error('Invalid ID', 400);
            $existing = DatabaseAdapter::getSpotById($id);
            if (isset($existing['error'])) ApiResponse::notFound('Spot not found');
            if (\SpotMap\Config::get('OWNERSHIP_ENABLED') && isset($existing['user_id']) && $existing['user_id'] !== ($user['id'] ?? null)) {
                // Allow moderators/admins
                $role = \SpotMap\Roles::getUserRole($user);
                if (!in_array($role, ['moderator','admin'])) {
                    ApiResponse::unauthorized('Not owner');
                }
            }
            $input = json_decode(file_get_contents('php://input'), true) ?? [];
            $fields = [];
            foreach (['title','description','category'] as $f) {
                if (isset($input[$f])) $fields[$f] = trim($input[$f]);
            }
            if (isset($input['tags']) && is_array($input['tags'])) {
                $fields['tags'] = $input['tags'];
            }
            if (!$fields) ApiResponse::error('No fields to update', 400);
            $updated = DatabaseAdapter::updateSpot($id, $fields);
            Cache::delete("spot_{$id}");
            Cache::flushPattern('spots_*');
            ApiResponse::success($updated, 'Spot updated');
        } catch (\Exception $e) {
            ApiResponse::serverError($e->getMessage());
        }
    }

    /**
     * GET /spots/{id} - Obtener un spot específico
     */
    public function show(int $id): void
    {
        try {
            if ($id <= 0) {
                ApiResponse::error('Invalid ID', 400);
                return;
            }

            $cacheKey = "spot_{$id}";
            $cached = Cache::get($cacheKey);
            if ($cached !== null) {
                ApiResponse::success($cached);
                return;
            }

            $result = DatabaseAdapter::getSpotById($id);

            if (isset($result['error'])) {
                ApiResponse::notFound('Spot not found');
                return;
            }

            // Procesar tags
            if (isset($result['tags']) && is_string($result['tags'])) {
                $result['tags'] = json_decode($result['tags']) ?: [];
            }
            // Field selection for single spot
            if (isset($_GET['fields'])) {
                $fields = array_filter(array_map('trim', explode(',', $_GET['fields'])));
                if ($fields) {
                    $filtered = [];
                    foreach ($fields as $f) if (array_key_exists($f, $result)) $filtered[$f] = $result[$f];
                    $result = $filtered;
                }
            }
            
            // ETag y Last-Modified para detalle
            $etag = 'W/"spot_' . $id . '_' . md5(json_encode($result)) . '"';
            if (isset($result['created_at']) && !headers_sent()) {
                $ts = strtotime($result['created_at']);
                $ifNone = $_SERVER['HTTP_IF_NONE_MATCH'] ?? null;
                if ($ifNone && $ifNone === $etag) {
                    \SpotMap\ApiResponse::notModified($etag, $ts);
                }
                if ($ts) header('Last-Modified: ' . gmdate('D, d M Y H:i:s', $ts) . ' GMT');
                header('ETag: ' . $etag);
            }
            Cache::set($cacheKey, $result, 120);
            ApiResponse::success($result);

        } catch (\Exception $e) {
            ApiResponse::serverError($e->getMessage());
        }
    }

    /**
     * DELETE /spots/{id} - Eliminar un spot y su foto asociada
     */
    public function destroy(int $id): void
    {
        try {
            // Auth requerido para eliminar
            $user = Auth::requireUser();
            if ($id <= 0) {
                ApiResponse::error('Invalid ID', 400);
                return;
            }

            // Obtener spot para eliminar foto
            $spot = DatabaseAdapter::getSpotById($id);

            if (isset($spot['error'])) {
                ApiResponse::notFound('Spot not found');
                return;
            }

            // Ownership check
            if (\SpotMap\Config::get('OWNERSHIP_ENABLED') && isset($spot['user_id']) && isset($user['id']) && $spot['user_id'] !== $user['id']) {
                ApiResponse::unauthorized('Not owner of spot');
            }

            // Eliminar imagen previa (Supabase Storage o local)
            if (isset($spot['image_path']) && $spot['image_path']) {
                $old = $spot['image_path'];
                if (\SpotMap\DatabaseAdapter::useSupabase()) {
                    try {
                        \SpotMap\SupabaseStorage::deleteIfBucketPath($old);
                    } catch (\Throwable $e) { /* ignorar */ }
                } else {
                    $filePath = __DIR__ . '/../../public' . $old;
                    if (file_exists($filePath)) { @unlink($filePath); }
                }
            }

            // Eliminar de la base de datos
            $result = DatabaseAdapter::deleteSpot($id);

            if (isset($result['error'])) {
                ApiResponse::error($result['error'], 500);
                return;
            }

            Cache::delete("spot_{$id}");
            Cache::flushPattern('spots_*');
            ApiResponse::success(null, 'Spot deleted successfully', 204);

        } catch (\Exception $e) {
            ApiResponse::serverError($e->getMessage());
        }
    }

    /**
     * POST /spots/{id}/photo - Subir foto a un spot con validación robusta
     */
    public function uploadPhoto(int $id): void
    {
        try {
            // Auth requerido para subir foto
            $user = Auth::requireUser();
            if ($id <= 0) {
                ApiResponse::error('Invalid ID', 400);
                return;
            }

            // Verificar que el spot existe
            $spot = DatabaseAdapter::getSpotById($id);
            if (isset($spot['error'])) {
                ApiResponse::notFound('Spot not found');
                return;
            }

            // Ownership check
            if (\SpotMap\Config::get('OWNERSHIP_ENABLED') && isset($spot['user_id']) && isset($user['id']) && $spot['user_id'] !== $user['id']) {
                ApiResponse::unauthorized('Not owner of spot');
            }

            // Validar que hay archivo
            if (!isset($_FILES['photo'])) {
                ApiResponse::error('No file uploaded', 400);
                return;
            }

            $file = $_FILES['photo'];

            // Validar
            $validator = new Validator();
            $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            $validator->mimeType($file, 'photo', $allowedMimes);
            $validator->fileSize($file, 'photo', 5 * 1024 * 1024);

            if ($validator->fails()) {
                ApiResponse::validation($validator->errors());
                return;
            }

            if ($file['error'] !== UPLOAD_ERR_OK) {
                ApiResponse::error('Upload error: ' . $file['error'], 400);
                return;
            }

            // Guardar archivo (Supabase Storage o local)
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $filename = 'spot_' . $id . '_' . time() . '.' . $ext;
            $uploadDir = __DIR__ . '/../../public/uploads/spots/';

            if (!is_dir($uploadDir)) {
                if (!mkdir($uploadDir, 0755, true)) {
                    ApiResponse::error('Failed to create upload directory', 500);
                    return;
                }
            }

            $filepath = $uploadDir . $filename;
            $relativePath = '/uploads/spots/' . $filename;

            if (\SpotMap\DatabaseAdapter::useSupabase()) {
                try {
                    $bucket = 'spots';
                    $path = $bucket . '/' . $filename;
                    $fileContents = file_get_contents($file['tmp_name']);
                    $uploadOk = \SpotMap\SupabaseStorage::upload($path, $fileContents, $file['type']);
                    if (!$uploadOk) {
                        ApiResponse::error('Failed to save file (Supabase)', 500);
                        return;
                    }
                    $relativePath = \SpotMap\SupabaseStorage::publicUrl($path);
                } catch (\Throwable $e) {
                    ApiResponse::error('Storage upload failed: ' . $e->getMessage(), 500);
                    return;
                }
            } else {
                if (!move_uploaded_file($file['tmp_name'], $filepath)) {
                    ApiResponse::error('Failed to save file', 500);
                    return;
                }
            }

            // Eliminar archivo anterior si existe
            if (isset($spot['image_path']) && $spot['image_path']) {
                if (\SpotMap\DatabaseAdapter::useSupabase()) {
                    \SpotMap\SupabaseStorage::deleteIfBucketPath($spot['image_path']);
                } else {
                    $oldPath = __DIR__ . '/../../public' . $spot['image_path'];
                    if (file_exists($oldPath)) { @unlink($oldPath); }
                }
            }

            // Actualizar base de datos
            $result = DatabaseAdapter::updateSpot($id, ['image_path' => $relativePath]);

            if (isset($result['error'])) {
                ApiResponse::error($result['error'], 500);
                return;
            }

            Cache::delete("spot_{$id}");
            Cache::flushPattern('spots_*');
            ApiResponse::success($result, 'Photo uploaded successfully', 200);

        } catch (\Exception $e) {
            ApiResponse::serverError($e->getMessage());
        }
    }
}