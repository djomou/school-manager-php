<?php
require_once __DIR__ . '/vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// ── Configuration ────────────────────────────────────
const SECRET_KEY = "ma_cle_secrete_hyper_complexe_school_manager_v2";
const ADMIN_EMAIL = "admin@ecole.com";
const ADMIN_PASS  = "admin123";

$services = require __DIR__ . '/config/services.php';

// ── Headers CORS ─────────────────────────────────────
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Répondre immédiatement aux requêtes OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── Lecture de la requête entrante ───────────────────
$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = '/' . trim($uri, '/');

// ── ROUTE LOGIN ──────────────────────────────────────
if ($method === 'POST' && $uri === '/api/auth/login') {
    $body = json_decode(file_get_contents('php://input'), true);
    $email = $body['email'] ?? '';
    $pass  = $body['password'] ?? '';

    if ($email === ADMIN_EMAIL && $pass === ADMIN_PASS) {
        $payload = [
            'role' => 'admin',
            'iat'  => time(),
            'exp'  => time() + 86400  // 24 heures
        ];
        $token = JWT::encode($payload, SECRET_KEY, 'HS256');
        echo json_encode(['token' => $token]);
    } else {
        http_response_code(401);
        echo json_encode(['message' => 'Identifiants incorrects']);
    }
    exit;
}

// ── VERIFICATION DU TOKEN ────────────────────────────
function verifyToken(): void {
    $headers = getallheaders();
    $auth    = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (!$auth || !str_starts_with($auth, 'Bearer ')) {
        http_response_code(403);
        echo json_encode(['message' => 'Accès refusé. Aucun token.']);
        exit;
    }

    $token = substr($auth, 7);

    try {
        JWT::decode($token, new Key(SECRET_KEY, 'HS256'));
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(['message' => 'Token invalide ou expiré.']);
        exit;
    }
}

// ── FONCTION PROXY ───────────────────────────────────
function proxyRequest(string $targetUrl, string $method, ?string $body): void {
    $ch = curl_init();

    curl_setopt_array($ch, [
        CURLOPT_URL            => $targetUrl,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT        => 10,
    ]);

    if (in_array($method, ['POST', 'PUT', 'PATCH']) && $body) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error    = curl_error($ch);
    curl_close($ch);

    if ($error) {
        http_response_code(502);
        echo json_encode(['message' => 'Microservice injoignable.', 'detail' => $error]);
        return;
    }

    http_response_code($httpCode ?: 500);
    echo $response;
}

// ── ROUTING AVEC PROXY ───────────────────────────────
verifyToken();

$body     = file_get_contents('php://input') ?: null;
$services = require __DIR__ . '/config/services.php';

// Extraire la ressource et l'ID depuis l'URI
// /api/professeurs     → ressource = professeurs, id = null
// /api/professeurs/5   → ressource = professeurs, id = 5
if (preg_match('#^/api/(professeurs|matieres|attributions)(?:/(\d+))?$#', $uri, $matches)) {
    $ressource = $matches[1];
    $id        = $matches[2] ?? null;
    $baseUrl   = $services[$ressource];
    $targetUrl = $id
        ? "{$baseUrl}/{$ressource}/{$id}"
        : "{$baseUrl}/{$ressource}";

    echo ""; // flush headers
    proxyRequest($targetUrl, $method, $body);
} else {
    http_response_code(404);
    echo json_encode(['message' => 'Route non trouvée : ' . $uri]);
}
