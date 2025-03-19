"use client";

import { useState, useEffect } from "react";

// Composant de sélection de compétition
export default function SelectCompetition() {
  const [competitions, setCompetitions] = useState<{ id: number; numero: string; name: string; type: string; epreuves: { id: number; intitule: string; numero_ordre: number; statut: string }[] }[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<number | null>(null);

  // Charger les compétitions depuis l'API
  useEffect(() => {
    const fetchedData = {
      competitions: [
        {
          id: 2,
          numero: "COMP2025-002",
          name: "Challenge National Junior",
          type: "CSO",
          epreuves: [
            { id: 4, intitule: "Junior Individuel", numero_ordre: 1, statut: "A_venir" },
            { id: 5, intitule: "Junior Équipe", numero_ordre: 2, statut: "A_venir" }
          ]
        },
        {
          id: 1,
          numero: "COMP2025-001",
          name: "Grand Prix Équestre de Paris",
          type: "CSO",
          epreuves: [
            { id: 1, intitule: "Épreuve Pro Elite Grand Prix", numero_ordre: 1, statut: "A_venir" },
            { id: 2, intitule: "Épreuve Pro 1 Grand Prix", numero_ordre: 2, statut: "A_venir" }
          ]
        },
        {
          id: 3,
          numero: "COMP2025-003",
          name: "Tournoi Régional Équifun",
          type: "Equifun",
          epreuves: [
            { id: 6, intitule: "Parcours Ludique Débutant", numero_ordre: 1, statut: "A_venir" },
            { id: 7, intitule: "Parcours Ludique Confirmé", numero_ordre: 2, statut: "A_venir" }
          ]
        }
      ]
    };
    setCompetitions(fetchedData.competitions);
  }, []);

  const handleSelectCompetition = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCompetition(Number(event.target.value));
  };

  const selectedComp = competitions.find(comp => comp.id === selectedCompetition);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#f3f4f6", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "400px", padding: "16px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", backgroundColor: "white", borderRadius: "8px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>Sélectionnez un concours</h2>
        <select onChange={handleSelectCompetition} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}>
          <option value="">Choisissez un concours</option>
          {competitions.map((comp) => (
            <option key={comp.id} value={comp.id}>
              {comp.name}
            </option>
          ))}
        </select>
        {selectedComp && (
          <div style={{ marginTop: "16px", padding: "8px", backgroundColor: "#dbeafe", borderRadius: "4px", color: "#1e40af" }}>
            <p><strong>{selectedComp.name}</strong></p>
            <p>Numéro: {selectedComp.numero}</p>
            <p>Type: {selectedComp.type}</p>
            <h3 style={{ marginTop: "12px" }}>Épreuves :</h3>
            <ul>
              {selectedComp.epreuves.map(ep => (
                <li key={ep.id}>{ep.intitule} (Ordre: {ep.numero_ordre})</li>
              ))}
            </ul>
          </div>
        )}
        <button style={{ marginTop: "16px", width: "100%", padding: "10px", backgroundColor: "#3b82f6", color: "white", borderRadius: "4px", border: "none", cursor: "pointer" }} disabled={!selectedCompetition}>
          Accéder aux épreuves
        </button>
      </div>
    </div>
  );
}
