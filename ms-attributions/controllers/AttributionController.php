<?php
class AttributionController {
    public function __construct(private PDO $pdo) {}

    public function getAll(): void {
        $stmt = $this->pdo->query("
            SELECT a.*, p.nom, p.prenom, m.intitule, m.code 
            FROM attributions a
            JOIN professeurs p ON a.professeur_id = p.id
            JOIN matieres m ON a.matiere_id = m.id
            ORDER BY a.id DESC
        ");
        echo json_encode($stmt->fetchAll());
    }

    public function getOne(int $id): void {
        $stmt = $this->pdo->prepare("
            SELECT a.*, p.nom, p.prenom, m.intitule, m.code 
            FROM attributions a
            JOIN professeurs p ON a.professeur_id = p.id
            JOIN matieres m ON a.matiere_id = m.id
            WHERE a.id = ?
        ");
        $stmt->execute([$id]);
        echo json_encode($stmt->fetch() ?: []);
    }

    public function create(): void {
        $data = json_decode(file_get_contents('php://input'), true);

        // ✅ Accepte camelCase ET snake_case
        $professeur_id    = $data['professeurId']    
                         ?? $data['professeur_id']    
                         ?? null;
                         
        $matiere_id       = $data['matiereId']       
                         ?? $data['matiere_id']       
                         ?? null;
                         
        $annee_academique = $data['anneeAcademique'] 
                         ?? $data['annee_academique'] 
                         ?? null;

        // ✅ Validation avant INSERT
        if (!$professeur_id || !$matiere_id || !$annee_academique) {
            http_response_code(400);
            echo json_encode([
                'error' => 'Champs manquants',
                'recu'  => $data
            ]);
            return;
        }

        $stmt = $this->pdo->prepare(
            "INSERT INTO attributions (professeur_id, matiere_id, annee_academique)
             VALUES (:professeur_id, :matiere_id, :annee_academique)"
        );
        $stmt->execute([
            ':professeur_id'    => $professeur_id,
            ':matiere_id'       => $matiere_id,
            ':annee_academique' => $annee_academique,
        ]);

        http_response_code(201);
        echo json_encode(['id' => $this->pdo->lastInsertId()]);
    }

    public function delete(int $id): void {
        $stmt = $this->pdo->prepare(
            "DELETE FROM attributions WHERE id = ?"
        );
        $stmt->execute([$id]);
        http_response_code(204);
    }
}
?>
