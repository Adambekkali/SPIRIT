"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// Définition des types
interface Epreuve {
  id: number;
  intitule: string;
  numero_ordre: number;
  statut: string;
}

interface Competition {
  id: number;
  numero: string;
  intitule: string;
  type: string;
  epreuves: Epreuve[];
}

// Fonction pour récupérer les données depuis l'API
const fetchCompetitions = async (): Promise<Competition[]> => {
  try {
    // Récupérer toutes les compétitions
    const response = await fetch("http://localhost:3000/api/competitions");
    
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des compétitions");
    }
    
    const data = await response.json();
    
    // Pour chaque compétition, récupérer ses épreuves
    const competitionsWithEpreuves = await Promise.all(
      data.competitions.map(async (comp: any) => {
        const epreuvesResponse = await fetch(
          `http://localhost:3000/api/epreuves?competition_id=${comp.id}`
        );
        
        if (!epreuvesResponse.ok) {
          return {
            ...comp,
            epreuves: []
          };
        }
        
        const epreuvesData = await epreuvesResponse.json();
        
        return {
          id: comp.id,
          numero: comp.numero,
          intitule: comp.intitule,
          type: comp.type,
          epreuves: epreuvesData.epreuves || []
        };
      })
    );
    
    return competitionsWithEpreuves;
  } catch (error) {
    console.error("Erreur:", error);
    return [];
  }
};

// Composant de sélection de compétition
export default function SelectCompetition() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les compétitions depuis l'API
  useEffect(() => {
    const loadCompetitions = async () => {
      try {
        setLoading(true);
        const data = await fetchCompetitions();
        setCompetitions(data);
      } catch (err) {
        setError("Erreur lors du chargement des compétitions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCompetitions();
  }, []);

  const handleSelectCompetition = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedCompetition(value ? Number(value) : null);
  };

  const selectedComp = competitions.find(comp => comp.id === selectedCompetition);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md p-4 shadow-lg bg-white rounded-lg text-center">
          <p>Chargement des compétitions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md p-4 shadow-lg bg-white rounded-lg text-center text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md p-4 shadow-lg bg-white rounded-lg">
        <h2 className="text-xl font-bold mb-4">Sélectionnez un concours</h2>
        <select 
          onChange={handleSelectCompetition} 
          className="w-full p-2 border border-gray-300 rounded-md"
          value={selectedCompetition || ""}
        >
          <option value="">Choisissez un concours</option>
          {competitions.map((comp) => (
            <option key={comp.id} value={comp.id}>
              {comp.intitule}
            </option>
          ))}
        </select>
        {selectedComp && (
          <div className="mt-4 p-3 bg-blue-100 rounded-md text-blue-900">
            <p className="font-bold">{selectedComp.intitule}</p>
            <p>Numéro: {selectedComp.numero}</p>
            <p>Type: {selectedComp.type}</p>
            <h3 className="mt-3 font-semibold">Épreuves :</h3>
            {selectedComp.epreuves.length > 0 ? (
              <ul className="list-disc list-inside">
                {selectedComp.epreuves.map(ep => (
                  <li key={ep.id}>{ep.intitule} (Ordre: {ep.numero_ordre})</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm italic">Aucune épreuve pour cette compétition</p>
            )}
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <Link 
            href={selectedCompetition ? `/epreuves?competitionId=${selectedCompetition}` : "#"}
            className={`flex-1 text-center p-2 rounded-md transition ${
              selectedCompetition
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Voir les épreuves
          </Link>
          
          {selectedComp && selectedComp.epreuves.length > 0 && (
            <Link 
              href={`/epreuves/${selectedComp.epreuves[0].id}`}
              className="flex-1 text-center p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
            >
              Première épreuve
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}