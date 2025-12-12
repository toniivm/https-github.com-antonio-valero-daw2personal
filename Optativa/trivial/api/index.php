<?php
// Lightweight API router for trivia game
header('Access-Control-Allow-Origin: ' . ($_SERVER['HTTP_ORIGIN'] ?? '*'));
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

$fullPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Normalize to start at "/api/..." even when the app is served under a subfolder
$pos = strpos($fullPath, '/api/');
$path = $pos !== false ? substr($fullPath, $pos) : $fullPath;
$method = $_SERVER['REQUEST_METHOD'];

// Simple storage paths
$dataDir = __DIR__ . '/../data';
$questionsFile = $dataDir . '/questions.json';
$scoresFile = $dataDir . '/scores.json';

function readJson($file) {
  if (!file_exists($file)) return [];
  $raw = file_get_contents($file);
  $data = json_decode($raw, true);
  return $data ?: [];
}

function writeJson($file, $data) {
  $tmp = $file . '.tmp';
  file_put_contents($tmp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
  rename($tmp, $file);
}

function send($payload, $code = 200) {
  http_response_code($code);
  echo json_encode($payload, JSON_UNESCAPED_UNICODE);
  exit;
}

if ($method === 'OPTIONS') {
  send(['ok' => true]);
}

// Routes
if ($path === '/api/questions' && $method === 'GET') {
  $qs = readJson($questionsFile);
  // Optional filters
  $category = $_GET['category'] ?? null;
  $difficulty = $_GET['difficulty'] ?? null;
  if ($category) {
    $qs = array_values(array_filter($qs, fn($q) => strtolower($q['category']) === strtolower($category)));
  }
  if ($difficulty) {
    $qs = array_values(array_filter($qs, fn($q) => strtolower($q['difficulty']) === strtolower($difficulty)));
  }
  // Shuffle and limit
  shuffle($qs);
  $limit = intval($_GET['limit'] ?? 10);
  $qs = array_slice($qs, 0, max(1, $limit));
  send(['questions' => $qs]);
}

if ($path === '/api/score' && $method === 'POST') {
  $input = json_decode(file_get_contents('php://input'), true) ?: [];
  $name = trim($input['name'] ?? 'Anon');
  $score = intval($input['score'] ?? 0);
  $duration = intval($input['duration'] ?? 0);
  $mode = $input['mode'] ?? 'classic';
  if ($name === '') $name = 'Anon';

  $scores = readJson($scoresFile);
  $scores[] = [
    'name' => $name,
    'score' => $score,
    'duration' => $duration,
    'mode' => $mode,
    'at' => date('c'),
  ];
  // Keep top 100 by score desc, then duration asc
  usort($scores, function($a, $b) {
    if ($a['score'] === $b['score']) return $a['duration'] <=> $b['duration'];
    return $b['score'] <=> $a['score'];
  });
  $scores = array_slice($scores, 0, 100);
  writeJson($scoresFile, $scores);
  send(['ok' => true]);
}

if ($path === '/api/leaderboard' && $method === 'GET') {
  $scores = readJson($scoresFile);
  send(['leaderboard' => $scores]);
}

send(['error' => 'Not found', 'path' => $path], 404);
