CREATE TYPE type_competition AS ENUM ('CSO', 'Equifun');
CREATE TYPE statut_epreuve AS ENUM ('A venir', 'En cours', 'Terminée', 'Cloturée');
CREATE TYPE statut_participation AS ENUM ('Partant', 'En piste', 'En bord de piste', 'Non Partant', 'Fini', 'Eliminé');
CREATE TYPE type_utilisateur AS ENUM ('jury', 'entrée de piste', 'lecteur', 'administrateur');

CREATE TABLE Competition (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(20) UNIQUE NOT NULL,
    intitule VARCHAR(255) NOT NULL,
    type type_competition NOT NULL
);

CREATE TABLE Epreuve (
    id SERIAL PRIMARY KEY,
    competition_id INT REFERENCES Competition(id) ON DELETE CASCADE,
    intitule VARCHAR(255) NOT NULL,
    numero_ordre INT NOT NULL,
    statut statut_epreuve DEFAULT 'A venir'
);

CREATE TABLE Couple (
    id SERIAL PRIMARY KEY,
    numero_licence VARCHAR(50) UNIQUE NOT NULL,
    nom_cavalier VARCHAR(255) NOT NULL,
    prenom_cavalier VARCHAR(255) NOT NULL,
    coach VARCHAR(255) NOT NULL,
    ecurie VARCHAR(255) NOT NULL,
    numero_sire VARCHAR(50) UNIQUE NOT NULL,
    nom_cheval VARCHAR(255) NOT NULL,
    numero_passage VARCHAR(255) NOT NULL,
    statut statut_participation DEFAULT 'Partant'
);

CREATE TABLE Utilisateur (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe TEXT NOT NULL,
    type type_utilisateur NOT NULL
);

CREATE TABLE Participer (
    id SERIAL PRIMARY KEY,
    epreuve_id INT REFERENCES Epreuve(id) ON DELETE CASCADE,
    couple_id INT REFERENCES Couple(id) ON DELETE CASCADE,
    numero_passage INT NOT NULL,
    temps DECIMAL(5,2),
    penalite INT,
    temps_total DECIMAL(5,2),
    classement INT
);
