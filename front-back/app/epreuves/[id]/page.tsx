"use client";
import Link from "next/link";
import React, { Usable, useEffect, useState } from "react";

// Types pour renforcer la sécurité du typage
interface Couple {
  id: number;
  nom_cavalier: string;
  prenom_cavalier: string;
  statut: string;
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

// Fonction pour récupérer les données de façon plus robuste
async function fetchWithErrorHandling(url: string) {
  try {
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`Erreur HTTP: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error(`Erreur de récupération depuis ${url}:`, error);
    throw error;
  }
}

const Epreuves = ({ params }: { params: Usable<{ id: string; }> }) => {
  const [epreuve, setEpreuve] = useState<Epreuve | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { id } = React.use(params);

  useEffect(() => {
    async function fetchData() {
      try {
        // Récupérer directement l'épreuve avec ses participations
        const data = await fetchWithErrorHandling(`http://localhost:3000/api/epreuves/${id}`);
        setEpreuve(data);
      } catch (err) {
        setError("Erreur lors du chargement des données: " + (err instanceof Error ? err.message : "Erreur inconnue"));
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [id]);

  if (loading) return <p className="text-center text-gray-500">Chargement des données...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!epreuve) return <p className="text-center text-amber-500">Aucune épreuve trouvée</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
        <Link href={`/epreuves`} className="mb-4 inline-block bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 hover:cursor-pointer">
            Voir toutes les épreuves
        </Link>
        <h1 className="text-2xl font-bold text-center mb-6">Détails de l'épreuve</h1>

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-3">{epreuve.intitule}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <p className="text-gray-700"><strong>Compétition :</strong> {epreuve.competition?.intitule}</p>
            <p className="text-gray-700"><strong>Type :</strong> {epreuve.competition?.type}</p>
            <p className="text-gray-700"><strong>Statut :</strong> <StatusBadge status={epreuve.statut} /></p>
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-3">Ordre de passage et résultats</h3>
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
                    <Th>Statut</Th>
                </tr>
                </thead>
                <tbody>
                {epreuve.participations
                    .sort((a, b) => a.numero_passage - b.numero_passage)
                    .map((participation) => (
                    <tr key={participation.id} className="border-t hover:bg-gray-50">
                        <Td>{participation.numero_passage}</Td>
                        <Td>{participation.couple.nom_cavalier} {participation.couple.prenom_cavalier}</Td>
                        <Td>{participation.temps ? `${participation.temps} sec` : "-"}</Td>
                        <Td>{participation.penalite ?? "-"}</Td>
                        <Td>{participation.temps_total ? `${participation.temps_total} sec` : "-"}</Td>
                        <Td>{participation.classement ?? "-"}</Td>
                        <Td>
                        <StatusBadge status={participation.couple.statut} />
                        </Td>
                    </tr>
                ))}
                {epreuve.participations.length === 0 && (
                    <tr>
                    <td colSpan={7} className="border px-4 py-3 text-center text-gray-500">
                        Aucun couple inscrit à cette épreuve
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        </div>
    </div>
  );
};

// Composants d'UI extraits et améliorés
const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="border-2 border-gray-300 px-4 py-2 text-center font-medium text-gray-700">{children}</th>
);

const Td = ({ children }: { children: React.ReactNode }) => (
  <td className="border-2 border-gray-300 px-4 py-2 text-center">{children}</td>
);

const StatusBadge = ({ status }: { status: string }) => {
  const statusColors: Record<string, string> = {
    "Partant": "bg-blue-100 text-blue-800 border border-blue-200",
    "En piste": "bg-green-100 text-green-800 border border-green-200",
    "En bord de piste": "bg-yellow-100 text-yellow-800 border border-yellow-200",
    "Non Partant": "bg-gray-100 text-gray-800 border border-gray-200",
    "Fini": "bg-purple-100 text-purple-800 border border-purple-200",
    "Éliminé": "bg-red-100 text-red-800 border border-red-200",
    "A venir": "bg-indigo-100 text-indigo-800 border border-indigo-200",
    "En cours": "bg-teal-100 text-teal-800 border border-teal-200",
    "Terminée": "bg-emerald-100 text-emerald-800 border border-emerald-200",
    "Cloturée": "bg-slate-100 text-slate-800 border border-slate-200",
  };

  return (
    <span className={`px-2 py-1 rounded-md text-sm font-medium ${statusColors[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

export default Epreuves;