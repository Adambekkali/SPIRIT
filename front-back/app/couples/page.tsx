'use client';

import React, { useState, useEffect } from "react";

// Types
interface Couple {
    id: number;
    numero_licence: string;
    nom_cavalier: string;
    prenom_cavalier: string;
    nom_cheval: string;
    coach: string;
    ecurie: string;
    statut: string;
}

// Statut options
const statutOptions = [
    { value: "Partant", label: "Partant", color: "#3B82F6" },
    { value: "En piste", label: "En piste", color: "#10B981" },
    { value: "En bord de piste", label: "En bord de piste", color: "#FBBF24" },
    { value: "Non Partant", label: "Non Partant", color: "#9CA3AF" },
    { value: "Fini", label: "Fini", color: "#8B5CF6" },
    { value: "Éliminé", label: "Éliminé", color: "#EF4444" },
];

const Couples = () => {
    const [couples, setCouples] = useState<Couple[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [selectedCouple, setSelectedCouple] = useState<Couple | null>(null);
    const [statusModalOpen, setStatusModalOpen] = useState(false);

    // Fetch couples
    const fetchCouples = async () => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:3000/api/couples");
            if (!res.ok) throw new Error("Erreur lors du chargement des couples.");
            const data = await res.json();
            setCouples(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur inconnue");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCouples();
    }, []);

    // Update couple status
    const updateCoupleStatut = async (coupleId: number, newStatut: string) => {
        try {
            setUpdatingId(coupleId);
            const response = await fetch(`/api/couples/${coupleId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ statut: newStatut }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Erreur lors de la mise à jour du statut");
            }

            setCouples(couples.map((c) => (c.id === coupleId ? { ...c, statut: newStatut } : c)));
            closeStatusModal();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la mise à jour du statut");
        } finally {
            setUpdatingId(null);
        }
    };

    // Open status modal
    const openStatusModal = (couple: Couple) => {
        setSelectedCouple(couple);
        setStatusModalOpen(true);
    };

    // Close status modal
    const closeStatusModal = () => {
        setSelectedCouple(null);
        setStatusModalOpen(false);
    };

    // Get badge color for status
    const getStatutBadgeColor = (statut: string) => {
        const option = statutOptions.find((opt) => opt.value === statut);
        return option?.color || "#9CA3AF";
    };

    if (loading) return <p className="text-center text-gray-500">Chargement des couples...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-6">Gestion des Couples</h1>

            {/* Table of couples */}
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Liste des Couples</h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <Th>Numéro de licence</Th>
                                <Th>Nom du cavalier</Th>
                                <Th>Prénom du cavalier</Th>
                                <Th>Nom du cheval</Th>
                                <Th>Coach</Th>
                                <Th>Écurie</Th>
                                <Th>Statut</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {couples.map((couple) => (
                                <tr key={couple.id} className="border-t hover:bg-gray-50">
                                    <Td>{couple.numero_licence}</Td>
                                    <Td>{couple.nom_cavalier}</Td>
                                    <Td>{couple.prenom_cavalier}</Td>
                                    <Td>{couple.nom_cheval}</Td>
                                    <Td>{couple.coach}</Td>
                                    <Td>{couple.ecurie}</Td>
                                    <Td>
                                        <button
                                            className="px-2 py-1 rounded-full text-sm font-medium text-white"
                                            style={{ backgroundColor: getStatutBadgeColor(couple.statut) }}
                                            onClick={() => openStatusModal(couple)}
                                            disabled={updatingId === couple.id}
                                        >
                                            {couple.statut}
                                        </button>
                                    </Td>
                                </tr>
                            ))}
                            {couples.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="border px-4 py-3 text-center text-gray-500">
                                        Aucun couple trouvé
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Status Modal */}
            {statusModalOpen && selectedCouple && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Modifier le statut</h3>
                        <p className="mb-4">
                            <span className="font-semibold">Couple:</span> {selectedCouple.nom_cavalier} {selectedCouple.prenom_cavalier}
                        </p>
                        <p className="mb-6">
                            <span className="font-semibold">Statut actuel:</span> {selectedCouple.statut}
                        </p>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {statutOptions.map((option) => (
                                <button
                                    key={option.value}
                                    className={`p-2 rounded-lg text-sm font-medium text-white`}
                                    style={{ backgroundColor: option.color }}
                                    onClick={() => updateCoupleStatut(selectedCouple.id, option.value)}
                                    disabled={updatingId === selectedCouple.id}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end">
                            <button
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                                onClick={closeStatusModal}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Couples;

const Th = ({ children }: { children: React.ReactNode }) => (
    <th className="border-2 border-gray-300 px-4 py-2 text-center font-medium text-gray-700">{children}</th>
);

const Td = ({ children }: { children: React.ReactNode }) => (
    <td className="border-2 border-gray-300 px-4 py-2 text-center">{children}</td>
);
