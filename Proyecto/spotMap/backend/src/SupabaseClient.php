<?php
namespace SpotMap;

/**
 * Adaptador para Supabase REST API
 * Permite usar Supabase como backend de base de datos
 */
class SupabaseClient
{
    private string $url;
    private string $key;
    private string $table = 'spots';

    public function __construct()
    {
        $this->url = Config::get('SUPABASE_URL');
        $this->key = Config::get('SUPABASE_KEY');

        if (!$this->url || !$this->key) {
            throw new \Exception('Supabase credentials not configured in .env');
        }
    }

    /**
     * Realizar petición HTTP a Supabase REST API
     */
    private function request(string $method, string $endpoint, $body = null): array
    {
        $url = rtrim($this->url, '/') . '/rest/v1/' . ltrim($endpoint, '/');
        
        $headers = [
            'apikey: ' . $this->key,
            'Authorization: Bearer ' . $this->key,
            'Content-Type: application/json',
            'Prefer: return=representation'
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

        if ($body !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 400) {
            $error = json_decode($response, true);
            throw new \Exception($error['message'] ?? 'Supabase API error: ' . $httpCode);
        }

        return json_decode($response, true) ?? [];
    }

    /**
     * Obtener todos los spots
     */
    public function getAllSpots(int $limit = 100, int $offset = 0): array
    {
        $endpoint = "{$this->table}?select=*&order=created_at.desc&limit={$limit}&offset={$offset}";
        return $this->request('GET', $endpoint);
    }

    /**
     * Obtener un spot por ID
     */
    public function getSpot(int $id): ?array
    {
        $endpoint = "{$this->table}?id=eq.{$id}&select=*";
        $result = $this->request('GET', $endpoint);
        return $result[0] ?? null;
    }

    /**
     * Crear nuevo spot
     */
    public function createSpot(array $data): array
    {
        // Convertir tags a JSON si es array
        if (isset($data['tags']) && is_array($data['tags'])) {
            $data['tags'] = json_encode($data['tags']);
        }

        $result = $this->request('POST', $this->table, $data);
        return $result[0] ?? $result;
    }

    /**
     * Actualizar spot
     */
    public function updateSpot(int $id, array $data): array
    {
        $endpoint = "{$this->table}?id=eq.{$id}";
        $result = $this->request('PATCH', $endpoint, $data);
        return $result[0] ?? $result;
    }

    /**
     * Eliminar spot
     */
    public function deleteSpot(int $id): bool
    {
        $endpoint = "{$this->table}?id=eq.{$id}";
        $this->request('DELETE', $endpoint);
        return true;
    }

    /**
     * Contar total de spots
     */
    public function countSpots(): int
    {
        $endpoint = "{$this->table}?select=count";
        $result = $this->request('GET', $endpoint);
        return $result[0]['count'] ?? 0;
    }
}
