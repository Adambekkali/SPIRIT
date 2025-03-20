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
    <div className="flex flex-col flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md p-4 shadow-lg bg-white rounded-lg">
        <h2 className="text-xl font-bold mb-4">Sélectionnez un concours</h2>
        <select onChange={handleSelectCompetition} className="w-full p-2 border border-gray-300 rounded-md">
          <option value="">Choisissez un concours</option>
          {competitions.map((comp) => (
            <option key={comp.id} value={comp.id}>
              {comp.name}
            </option>
          ))}
        </select>
        {selectedComp && (
          <div className="mt-4 p-3 bg-blue-100 rounded-md text-blue-900">
            <p className="font-bold">{selectedComp.name}</p>
            <p>Numéro: {selectedComp.numero}</p>
            <p>Type: {selectedComp.type}</p>
            <h3 className="mt-3 font-semibold">Épreuves :</h3>
            <ul className="list-disc list-inside">
              {selectedComp.epreuves.map(ep => (
                <li key={ep.id}>{ep.intitule} (Ordre: {ep.numero_ordre})</li>
              ))}
            </ul>
          </div>
        )}
        <button className="mt-4 w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition" disabled={!selectedCompetition}>
          Accéder aux épreuves
        </button>
      </div>
    </div>
  );
}
