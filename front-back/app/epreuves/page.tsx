"use client";
import Link from "next/link";
import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Types pour améliorer la sécurité et l'autocomplétion
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
    participations: any[];
}

// Fonction pour récupérer toutes les épreuves sans filtre
const getEpreuves = async () => {
    const res = await fetch(`http://localhost:3000/api/epreuves`);
    const data = await res.json();
    return data.epreuves;
};

// Fonction pour récupérer toutes les compétitions pour le filtre
const getCompetitions = async () => {
    const res = await fetch(`http://localhost:3000/api/competitions`);
    const data = await res.json();
    return data.competitions;
};

const Epreuves = () => {
    const [allEpreuves, setAllEpreuves] = useState<Epreuve[]>([]);
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Récupérer les paramètres d'URL
    const searchParams = useSearchParams();
    const competitionId = searchParams.get('competitionId');
    const router = useRouter();

    // Récupérer toutes les données une seule fois
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                // Récupérer les compétitions pour le filtre
                const compsData = await getCompetitions();
                setCompetitions(compsData);
                
                // Récupérer toutes les épreuves sans filtre
                const data = await getEpreuves();
                setAllEpreuves(data);
            } catch (err) {
                console.error("Erreur:", err);
                setError("Erreur lors du chargement des épreuves.");
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    // Filtrer les épreuves côté client en fonction du paramètre compétition
    const filteredEpreuves = useMemo(() => {
        if (!competitionId) return allEpreuves;
        return allEpreuves.filter(epreuve => 
            epreuve.competition.id.toString() === competitionId
        );
    }, [allEpreuves, competitionId]);

    // Fonction pour changer le filtre sans recharger la page
    const handleFilterChange = (newCompetitionId: string | null) => {
        if (newCompetitionId) {
            router.push(`/epreuves?competitionId=${newCompetitionId}`);
        } else {
            router.push('/epreuves');
        }
    };

    if (loading) return <p className="text-center text-gray-500">Chargement des épreuves...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="p-6 max-w-8xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-6">Liste des Épreuves</h1>

            {/* Filtre par compétition */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-3">Filtrer par compétition</h2>
                <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={() => handleFilterChange(null)}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${!competitionId 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                    >
                        Toutes
                    </button>
                    
                    {competitions.map(comp => (
                        <button 
                            key={comp.id}
                            onClick={() => handleFilterChange(comp.id.toString())}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                                competitionId === comp.id.toString() 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                            }`}
                        >
                            {comp.intitule}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tableau des épreuves avec largeur fixe */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto" style={{ width: '100%' }}>
                    <div style={{ minWidth: '1400px', minHeight: '400px' }}> {/* Largeur minimale fixe */}
                        {filteredEpreuves.length > 0 ? (
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <Th width="5%">#</Th>
                                        <Th width="20%">Intitulé</Th>
                                        <Th width="20%">Compétition</Th>
                                        <Th width="5%">Type</Th>
                                        <Th width="5%">Statut</Th>
                                        <Th width="5%">Couples</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEpreuves.map((epreuve, index) => (
                                        <tr 
                                            key={epreuve.id} 
                                            className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition"
                                            onClick={() => router.push(`/epreuves/${epreuve.id}`)}
                                        >
                                            <Td>{index + 1}</Td>
                                            <Td>{epreuve.intitule}</Td>
                                            <Td>{epreuve.competition?.intitule}</Td>
                                            <Td>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    epreuve.competition?.type === 'CSO' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                    {epreuve.competition?.type}
                                                </span>
                                            </Td>
                                            <Td>
                                                <StatusBadge status={epreuve.statut} />
                                            </Td>
                                            <Td>{epreuve.participations.length}</Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-gray-500">
                                    {competitionId 
                                        ? "Aucune épreuve trouvée pour cette compétition." 
                                        : "Aucune épreuve trouvée."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Epreuves;

// Composants pour styliser les cellules du tableau
const Th = ({ children, width }: { children: React.ReactNode; width?: string }) => (
    <th className="px-4 py-3 text-left font-medium text-gray-700" style={{ width: width || 'auto' }}>
        {children}
    </th>
);

const Td = ({ children }: { children: React.ReactNode }) => (
    <td className="px-4 py-3">{children}</td>
);

// Composant pour afficher un badge de statut avec des couleurs
const StatusBadge = ({ status }: { status: string }) => {
    const statusColors: Record<string, string> = {
        "A_venir": "bg-blue-100 text-blue-800 border border-blue-200",
        "En_cours": "bg-green-100 text-green-800 border border-green-200",
        "Terminee": "bg-purple-100 text-purple-800 border border-purple-200",
        "Cloturee": "bg-gray-100 text-gray-800 border border-gray-200",
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-100 text-gray-600"}`}>
            {status.replace(/_/g, ' ')}
        </span>
    );
};