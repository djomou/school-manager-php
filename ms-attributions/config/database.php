<?php
function getConnection(): PDO {
    $dsn = "mysql:host=school-db;dbname=school_manager;charset=utf8";
    return new PDO($dsn, "school_user", "school_pass", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
}
?>
