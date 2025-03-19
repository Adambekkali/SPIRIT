"use client";

import { useState, useEffect } from "react";

// Composant de sélection de compétition
export default function SelectCompetition() {
  const [competitions, setCompetitions] = useState<{ id: number; name: string }[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null);

  // Charger les compétitions depuis l'API
  useEffect(() => {
    const fetchedData = {
      competitions: [
        { id: 2, name: "Challenge National Junior" },
        { id: 1, name: "Grand Prix Équestre de Paris" },
        { id: 3, name: "Tournoi Régional Équifun" }
      ]
    };
    setCompetitions(fetchedData.competitions);
  }, []);

  const handleSelectCompetition = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCompetition(event.target.value);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#f3f4f6", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "400px", padding: "16px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", backgroundColor: "white", borderRadius: "8px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>Sélectionnez un concours</h2>
        <select onChange={handleSelectCompetition} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}>
          <option value="">Choisissez un concours</option>
          {competitions.map((comp) => (
            <option key={comp.id} value={comp.name}>
              {comp.name}
            </option>
          ))}
        </select>
        {selectedCompetition && (
          <div style={{ marginTop: "16px", padding: "8px", backgroundColor: "#dbeafe", borderRadius: "4px", color: "#1e40af" }}>
            <p>Vous avez sélectionné : <strong>{selectedCompetition}</strong></p>
          </div>
        )}
        <button style={{ marginTop: "16px", width: "100%", padding: "10px", backgroundColor: "#3b82f6", color: "white", borderRadius: "4px", border: "none", cursor: "pointer" }} disabled={!selectedCompetition}>
          Accéder aux épreuves
        </button>
      </div>
    </div>
  );
}
