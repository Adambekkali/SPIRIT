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
      data.competitions.map(async (comp: Competition) => {
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

  // State for the new competition form
  const [newCompetition, setNewCompetition] = useState({
    numero: "",
    intitule: "",
    type: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteCompetition = async (competitionId: number) => {
    try {
        await fetch(`/api/competitions/${competitionId}`, { method: "DELETE" });
        setCompetitions((prev) => prev.filter((comp) => comp.id !== competitionId));
        setSelectedCompetition(null);
    } catch (err) {
        console.error("Erreur lors de la suppression de la compétition:", err);
    } finally {
        setConfirmDelete(false);
    }
  };

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

  const handleCreateCompetition = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!newCompetition.numero || !newCompetition.intitule || !newCompetition.type) {
      setFormError("Tous les champs sont obligatoires.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/competitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCompetition),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setFormError(errorData.error || "Erreur lors de la création de la compétition.");
        return;
      }

      const createdCompetition = await response.json();
      setCompetitions((prev) => [...prev, createdCompetition]);
      setNewCompetition({ numero: "", intitule: "", type: "" });
      setShowForm(false);
    } catch (err) {
      setFormError("Une erreur est survenue.");
      console.error(err);
    }
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
    <div className="flex flex-1">
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

          {/* Bouton pour afficher le formulaire */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
          >
            {showForm ? "Annuler" : "Créer une nouvelle compétition"}
          </button>

          {/* Formulaire de création de compétition */}
          {showForm && (
            <div className="mt-4">
              <form onSubmit={handleCreateCompetition} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Numéro</label>
                  <input
                    type="text"
                    value={newCompetition.numero}
                    onChange={(e) =>
                      setNewCompetition({ ...newCompetition, numero: e.target.value })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Intitulé</label>
                  <input
                    type="text"
                    value={newCompetition.intitule}
                    onChange={(e) =>
                      setNewCompetition({ ...newCompetition, intitule: e.target.value })
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                  value={newCompetition.type}
                  onChange={(e) =>
                    setNewCompetition({ ...newCompetition, type: e.target.value })
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  >
                  <option value="">Sélectionnez un type</option>
                  {competitions
                    .map((comp) => comp.type)
                    .filter((type, index, self) => self.indexOf(type) === index) // Remove duplicates
                    .map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                    ))}
                  </select>
                </div>
                {formError && <p className="text-red-500 text-sm">{formError}</p>}
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition"
                >
                  Créer
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Détails de la compétition - Colonne de droite */}
        <div className="p-6 fixed top-0 bottom-0 left-1/2 right-0 flex flex-col justify-center items-center">
          {selectedCompetition ? (
            <div className="fixed w-[40%]">
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
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition"
                    >
                      Supprimer la compétition
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="fixed flex items-center justify-center h-full">
              <p className="text-gray-500">Veuillez sélectionner une compétition</p>
            </div>
          )}
        </div>
      </div>
      {/* Modal de confirmation de suppression */}
      {confirmDelete && selectedCompetition && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h3 className="text-xl font-bold mb-4">Confirmer la suppression</h3>
                <p className="mb-6">Êtes-vous sûr de vouloir supprimer cette compétition ?</p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={() => setConfirmDelete(false)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={() => handleDeleteCompetition(selectedCompetition)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}