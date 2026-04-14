<?php
class ProfesseurController {
    public function __construct(private PDO $pdo) {}

    public function getAll(): void {
        $stmt = $this->pdo->query("SELECT * FROM professeurs ORDER BY id DESC");
        echo json_encode($stmt->fetchAll());
    }

    public function getOne(int $id): void {
        $stmt = $this->pdo->prepare("SELECT * FROM professeurs WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode($stmt->fetch() ?: []);
    }

    public function create(): void {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $this->pdo->prepare(
            "INSERT INTO professeurs (nom, prenom, specialite, email)
             VALUES (:nom, :prenom, :specialite, :email)"
        );
        $stmt->execute([
            ':nom'       => $data['nom'],
            ':prenom'    => $data['prenom'],
            ':specialite'=> $data['specialite'],
            ':email'     => $data['email'],
        ]);
        http_response_code(201);
        echo json_encode(['id' => $this->pdo->lastInsertId()]);
    }

    public function delete(int $id): void {
        $stmt = $this->pdo->prepare("DELETE FROM professeurs WHERE id = ?");
        $stmt->execute([$id]);
        http_response_code(204);
    }
}
?>
