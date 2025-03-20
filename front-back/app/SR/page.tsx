"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

// Fonction pour récupérer les épreuves depuis l'API
const getEpreuves = async () => {
    const res = await fetch("http://localhost:3000/api/epreuves");
    const data = await res.json();
    return data.epreuves;
};

const Epreuves = () => {
    const [epreuves, setEpreuves] = useState<any[]>([]);
    const [selectedEpreuve, setSelectedEpreuve] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getEpreuves();
                setEpreuves(data);
            } catch (err) {
                setError("Erreur lors du chargement des épreuves.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <p className="text-center text-gray-500">Chargement des épreuves...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-center mb-4">Épreuves</h1>

            {/* Sélection d'épreuve */}
            <div className="mb-4">
                <label className="block text-gray-700 font-medium">Sélectionner une épreuve :</label>
                <select
                    className="w-full border rounded-lg p-2 mt-1"
                    onChange={(e) => {
                        const epreuveId = parseInt(e.target.value);
                        const selected = epreuves.find(ep => ep.id === epreuveId);
                        setSelectedEpreuve(selected || null);
                    }}
                >
                    <option value="">-- Choisir une épreuve --</option>
                    {epreuves.map((epreuve) => (
                        <option key={epreuve.id} value={epreuve.id}>
                            {epreuve.intitule} - {epreuve.competition?.intitule}
                        </option>
                    ))}
                </select>
            </div>

            {/* Affichage des informations de l'épreuve sélectionnée */}
            {selectedEpreuve && (
                <div>
                    <h2 className="text-xl font-semibold mb-2">{selectedEpreuve.intitule}</h2>
                    <p className="text-gray-700"><strong>Compétition :</strong> {selectedEpreuve.competition?.intitule}</p>
                    <p className="text-gray-700"><strong>Type :</strong> {selectedEpreuve.competition?.type}</p>
                    <p className="text-gray-700"><strong>Statut :</strong> {selectedEpreuve.statut}</p>

                    {/* Liste des couples engagés */}
                    <h3 className="text-lg font-semibold mt-4">Ordre de passage et résultats</h3>
                    <table className="w-full border-collapse border border-gray-300 mt-2">
                        <thead>
                            <tr className="bg-gray-100">
                                <Th>#</Th>
                                <Th>Licence</Th>
                                <Th>Nom Cavalier</Th>
                                <Th>Cheval</Th>
                                <Th>Ecurie</Th>
                                <Th>Coach</Th>
                                <Th>Passage</Th>
                                <Th>Temps</Th>
                                <Th>Pénalité</Th>
                                <Th>Total</Th>
                                <Th>Classement</Th>
                                <Th>Statut</Th>
                                <Th>Juger</Th>
                                <Th>Modifier</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedEpreuve.participations.map((part: any, index: number) => (
                                <tr key={index} className="border-t">
                                    <Td>{index + 1}</Td>
                                    <Td>{part.couple.numero_licence}</Td>
                                    <Td>{part.couple.nom_cavalier} {part.couple.prenom_cavalier}</Td>
                                    <Td>{part.couple.nom_cheval}</Td>
                                    <Td>{part.couple.ecurie}</Td>
                                    <Td>{part.couple.coach}</Td>
                                    <Td>{part.numero_passage}</Td>
                                    <Td>{part.temps} sec</Td>
                                    <Td>{part.penalite}</Td>
                                    <Td>{part.temps_total}</Td>
                                    <Td>{part.classement}</Td>
                                    <Td>
                                        <StatusBadge status={part.couple.statut} />
                                    </Td>
                                    <Td>
                                        <button
                                            className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 cursor-pointer"
                                            onClick={() => {
                                                const queryParams = new URLSearchParams({
                                                    participation_id: part.id,
                                                }).toString();
                                                window.location.href = `SR/evaluation?${queryParams}`;
                                            }}
                                        >
                                            Juger
                                        </button>
                                    </Td>
                                    <Td>
                                        <button
                                            className="bg-yellow-500 text-white px-4 py-1 rounded-md hover:bg-yellow-600 cursor-pointer"
                                            onClick={() => {
                                                const queryParams = new URLSearchParams({
                                                    id: part.couple.id,
                                                }).toString();
                                                window.location.href = `SR/modifier?${queryParams}`;
                                            }}
                                        >
                                            Modifier
                                        </button>
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Epreuves;

// Composants pour styliser les cellules du tableau
const Th = ({ children }: { children: React.ReactNode }) => (
    <th className="border-2 border-gray-300 px-4 py-2 text-left font-medium">{children}</th>
);

const Td = ({ children }: { children: React.ReactNode }) => (
    <td className="border-2 border-gray-300 px-4 py-2">{children}</td>
);

// Composant pour afficher un badge de statut avec des couleurs
const StatusBadge = ({ status }: { status: string }) => {
    const statusColors: Record<string, string> = {
        "Partant": "bg-blue-200 text-blue-800",
        "En piste": "bg-green-200 text-green-800",
        "En bord de piste": "bg-yellow-200 text-yellow-800",
        "Non Partant": "bg-gray-200 text-gray-800",
        "Fini": "bg-purple-200 text-purple-800",
        "Éliminé": "bg-red-200 text-red-800",
    };

    return (
        <span className={`px-2 py-1 rounded-md text-sm font-semibold ${statusColors[status] || "bg-gray-100 text-gray-600"}`}>
            {status}
        </span>
    );
};
