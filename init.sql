CREATE TABLE professeurs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nom         VARCHAR(100) NOT NULL,
  prenom      VARCHAR(100) NOT NULL,
  specialite  VARCHAR(150) NOT NULL,
  email       VARCHAR(200) NOT NULL UNIQUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE matieres (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  intitule VARCHAR(150) NOT NULL,
  code     VARCHAR(50)  NOT NULL UNIQUE,
  credits  INT          NOT NULL DEFAULT 3
);

CREATE TABLE attributions (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  professeur_id    INT NOT NULL,
  matiere_id       INT NOT NULL,
  annee_academique VARCHAR(20) NOT NULL,
  FOREIGN KEY (professeur_id) REFERENCES professeurs(id) ON DELETE CASCADE,
  FOREIGN KEY (matiere_id)    REFERENCES matieres(id)    ON DELETE CASCADE
);
