"use client";

import React, { Usable, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Couple {
  id: number;
  nom_cavalier: string;
  prenom_cavalier: string;
  coach: string;
  ecurie: string;
}

interface Participation {
  id: number;
  couple: Couple;
  temps: number | null;
  penalite: number | null;
  temps_total: number | null;
  classement: number | null;
  numero_passage: number;
}

interface Competition {
  id: number;
  intitule: string;
  type: string;
}

interface Epreuve {
  id: number;
  intitule: string;
  statut: string;
  competition: Competition;
  participations: Participation[];
}

const Epreuves = ({ params }: { params: Usable<{ id: string }> }) => {
  const [epreuve, setEpreuve] = useState<Epreuve | null>(null);
  const [couples, setCouples] = useState<Couple[]>([]);
  const [showCouples, setShowCouples] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const { id } = React.use(params);

  useEffect(() => {
    async function fetchData() {
      try {
        const epreuveRes = await fetch(`http://localhost:3000/api/epreuves/${id}`);
        if (!epreuveRes.ok) throw new Error("Erreur lors du chargement de l'épreuve.");
        const epreuveData = await epreuveRes.json();
        setEpreuve(epreuveData);

        const couplesRes = await fetch("http://localhost:3000/api/couples");
        if (!couplesRes.ok) throw new Error("Erreur lors du chargement des couples.");
        const couplesData = await couplesRes.json();

        // Filtrer les couples pour exclure ceux déjà participants
        const participantIds = new Set(epreuveData.participations.map((p: Participation) => p.couple.id));
        const availableCouples = couplesData.filter((couple: Couple) => !participantIds.has(couple.id));
        setCouples(availableCouples);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleRetour = () => {
    // Revenir à la page des épreuves avec l'ID de la compétition
    if (epreuve && epreuve.competition) {
      router.push(`/epreuves?competitionId=${epreuve.competition.id}`);
    } else {
      // Fallback si pas de compétition trouvée
      router.push('/epreuves');
    }
  };

  const handleAddParticipant = async (coupleId: number) => {
    try {
      const res = await fetch(`http://localhost:3000/api/participations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          epreuve_id: parseInt(id),
          couple_id: coupleId,
          numero_passage: (epreuve?.participations?.length ?? 0) + 1,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur lors de l'ajout du participant.");
      }

      const updatedEpreuve = await fetch(`http://localhost:3000/api/epreuves/${id}`).then((res) => res.json());
      setEpreuve(updatedEpreuve);

      // Mettre à jour la liste des couples disponibles
      setCouples((prevCouples) => prevCouples.filter((couple) => couple.id !== coupleId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  const handleRemoveParticipant = async (participationId: number) => {
    try {
      const res = await fetch(`http://localhost:3000/api/participations/${participationId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur lors de la suppression du participant.");
      }

      // Trouver le participant supprimé pour le réintégrer dans la liste des couples disponibles
      const removedParticipant = epreuve?.participations.find((p) => p.id === participationId)?.couple;
      if (removedParticipant) {
        setCouples((prevCouples) => [...prevCouples, removedParticipant]);
      }

      const updatedEpreuve = await fetch(`http://localhost:3000/api/epreuves/${id}`).then((res) => res.json());
      setEpreuve(updatedEpreuve);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  if (loading) return <p className="text-center text-gray-500">Chargement des données...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!epreuve) return <p className="text-center text-amber-500">Aucune épreuve trouvée</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
        <button 
          onClick={handleRetour} 
          className="mb-4 inline-block bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 hover:cursor-pointer"
        >
            Retour aux épreuves
        </button>
        <h1 className="text-2xl font-bold text-center mb-6">Détails de l'épreuve</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">{epreuve.intitule}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <p className="text-gray-700"><strong>Compétition :</strong> {epreuve.competition?.intitule}</p>
          <p className="text-gray-700"><strong>Type :</strong> {epreuve.competition?.type}</p>
          <p className="text-gray-700"><strong>Statut :</strong> {epreuve.statut}</p>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-3">Participants</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <Th>Ordre</Th>
                <Th>Couple</Th>
                <Th>Temps</Th>
                <Th>Pénalité</Th>
                <Th>Total</Th>
                <Th>Classement</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {epreuve.participations.map((participation) => (
                <tr key={participation.id} className="border-t hover:bg-gray-50">
                  <Td>{participation.numero_passage}</Td>
                  <Td>{participation.couple.nom_cavalier} {participation.couple.prenom_cavalier}</Td>
                  <Td>{participation.temps ? `${participation.temps} sec` : "-"}</Td>
                  <Td>{participation.penalite ?? "-"}</Td>
                  <Td>{participation.temps_total ? `${participation.temps_total} sec` : "-"}</Td>
                  <Td>{participation.classement ?? "-"}</Td>
                  <Td>
                    <button
                      onClick={() => handleRemoveParticipant(participation.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                    >
                      Supprimer
                    </button>
                  </Td>
                </tr>
              ))}
              {epreuve.participations.length === 0 && (
                <tr>
                  <td colSpan={7} className="border px-4 py-3 text-center text-gray-500">
                    Aucun participant inscrit
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <button
          onClick={() => setShowCouples(!showCouples)}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          {showCouples ? "Masquer la liste des couples" : "Afficher la liste des couples"}
        </button>
        {showCouples && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <Th>Nom du cavalier</Th>
                  <Th>Prénom du cavalier</Th>
                  <Th>Coach</Th>
                  <Th>Écurie</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {couples.map((couple) => (
                  <tr key={couple.id} className="border-t hover:bg-gray-50">
                    <Td>{couple.nom_cavalier}</Td>
                    <Td>{couple.prenom_cavalier}</Td>
                    <Td>{couple.coach}</Td>
                    <Td>{couple.ecurie}</Td>
                    <Td>
                      <button
                        onClick={() => handleAddParticipant(couple.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                      >
                        Ajouter
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="border-2 border-gray-300 px-4 py-2 text-center font-medium text-gray-700">{children}</th>
);

const Td = ({ children }: { children: React.ReactNode }) => (
  <td className="border-2 border-gray-300 px-4 py-2 text-center">{children}</td>
);

export default Epreuves;