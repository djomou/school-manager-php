<?php
class MatiereController {
    public function __construct(private PDO $pdo) {}

    public function getAll(): void {
        $stmt = $this->pdo->query("SELECT * FROM matieres ORDER BY id DESC");
        echo json_encode($stmt->fetchAll());
    }

    public function getOne(int $id): void {
        $stmt = $this->pdo->prepare("SELECT * FROM matieres WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode($stmt->fetch() ?: []);
    }

    public function create(): void {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $this->pdo->prepare(
            "INSERT INTO matieres (intitule, code, credits)
             VALUES (:intitule, :code, :credits)"
        );
        $stmt->execute([
            ':intitule' => $data['intitule'],
            ':code'     => $data['code'],
            ':credits'  => $data['credits'] ?? 3,
        ]);
        http_response_code(201);
        echo json_encode(['id' => $this->pdo->lastInsertId()]);
    }

    public function delete(int $id): void {
        $stmt = $this->pdo->prepare("DELETE FROM matieres WHERE id = ?");
        $stmt->execute([$id]);
        http_response_code(204);
    }
}
?>
