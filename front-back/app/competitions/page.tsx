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

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="m-auto text-center">
          <p>Chargement des compétitions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <div className="m-auto text-center text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="grid grid-cols-2 w-full">
        {/* Tableau des compétitions - Colonne de gauche */}
        <div className="border-r border-gray-300 p-6 overflow-auto">
          <h2 className="text-xl font-bold mb-4">Liste des compétitions</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Numéro</th>
                <th className="text-left p-2">Intitulé</th>
                <th className="text-left p-2">Type</th>
              </tr>
            </thead>
            <tbody>
              {competitions.map((comp) => (
                <tr 
                  key={comp.id} 
                  className={`cursor-pointer hover:bg-gray-100 ${
                    selectedCompetition === comp.id ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => setSelectedCompetition(comp.id)}
                >
                  <td className="p-2">{comp.numero}</td>
                  <td className="p-2">{comp.intitule}</td>
                  <td className="p-2">{comp.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Détails de la compétition - Colonne de droite */}
        <div className="p-6">
          {selectedCompetition ? (
            <div>
              <h2 className="text-xl font-bold mb-4">Détails de la compétition</h2>
              <div className="bg-white shadow-md rounded-lg p-6">
                <p className="text-lg font-semibold mb-4">Veuillez sélectionner une compétition</p>
                
                {/* Afficher les informations de la compétition sélectionnée */}
                {competitions.find(comp => comp.id === selectedCompetition) && (
                  <>
                    <div className="mb-4">
                      <h3 className="font-bold">Informations</h3>
                      <p>Numéro : {competitions.find(comp => comp.id === selectedCompetition)?.numero}</p>
                      <p>Intitulé : {competitions.find(comp => comp.id === selectedCompetition)?.intitule}</p>
                      <p>Type : {competitions.find(comp => comp.id === selectedCompetition)?.type}</p>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex gap-4 mt-6">
                      <Link 
                        href={`/epreuves?competitionId=${selectedCompetition}`}
                        className="flex-1 text-center p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                      >
                        Voir les épreuves
                      </Link>
                      
                      {/* Bouton pour la première épreuve (si disponible) */}
                      {(() => {
                        const competition = competitions.find(comp => comp.id === selectedCompetition);
                        return competition?.epreuves.length ? (
                          <Link 
                            href={`/epreuves/${competition.epreuves[0].id}`}
                            className="flex-1 text-center p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                          >
                            Première épreuve
                          </Link>
                        ) : null;
                      })()}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Veuillez sélectionner une compétition</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}