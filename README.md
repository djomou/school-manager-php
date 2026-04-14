Voici l'essentiel à savoir concernant le projet:

  Étape 1 — 🖥️ Fondations du Serveur Préparer l'environnement sur Ubuntu Server:
  
    • sudo apt update && sudo apt upgrade -y, 
    • PHP 8.2 + extensions nécessaires,
    • Composer (gestionnaire de dépendances PHP),
    • Node.js (uniquement pour la Gateway JWT), 
    • Docker + Docker Compose (pour MariaDB).

  Étape 2 — 🗄️ La Couche Données — MariaDB Déployer et configurer la base de données:
  
    • docker-compose.yml, : yamlversion: '3.8' services: 
    • Mariadb: image, 
    • TABLE professeurs, 
    • TABLE matieres, 
    • TABLE attributions, 
    • Démarrer : docker-compose up -d. 

  Étape 3 — 👤 Microservice Professeurs (PHP):
  
    • Dockerfile du microservice: EXPOSE 3000, 	
    • Tester : curl http://IP:3000/professeurs.
 
  Étape 4 — 📚 Microservices Matières & Attributions Même structure que le microservice Professeurs:
  
    • [mariadb] ms-matieres: ports: ["3001:3001"],
    • [mariadb] ms-attributions: ports: ["3002:3002"].

  Étape 5 — 🛡️ L'API Gateway:
  
    • La Gateway est en PHP. jwt,CORS, Proxy,
    • cd ~/school-manager-v2/api-gateway && composer install,
    • cd ~/school-manager-v2/api-gateway && php -S 0.0.0.0:8081 gateway.php.
 
  Étape 6 — 🎨 Le Frontend (HTML / CSS / JavaScript):
  
    • Page de connexion
    • Page Professeurs  
    • Page Matières  
    • Page Affectations 
    
  Lancement complet :
  
    1. Base de données + microservices PHP : docker-compose up -d. 
    2. API Gateway : cd ~/school-manager-v2/api-gateway && php -S 0.0.0.0:8081 gateway.php.
    3. Frontend statique: cd ~/school-manager-v2/frontend && php -S 0.0.0.0:3003, Ouvrir : http://IP:3003/login.html"
