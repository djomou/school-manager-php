<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

require_once 'config/database.php';
require_once 'controllers/MatiereController.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$parts  = explode('/', trim($uri, '/'));
$id     = $parts[1] ?? null;

$ctrl = new MatiereController(getConnection());

match(true) {
    $method === 'GET'    && !$id  => $ctrl->getAll(),
    $method === 'GET'    &&  $id  => $ctrl->getOne($id),
    $method === 'POST'            => $ctrl->create(),
    $method === 'DELETE' &&  $id  => $ctrl->delete($id),
    default => http_response_code(404)
};
?>
