'use client';

//import { StatutParticipation } from "@prisma/client";
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
    numero_sire: string;
    numero_passage: string;

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
    const [newCouple, setNewCouple] = useState<Couple>({
        id: 0,
        numero_licence: "",
        nom_cavalier: "",
        prenom_cavalier: "",
        nom_cheval: "",
        coach: "",
        ecurie: "",
        statut: "Partant",
        numero_sire: "",
        numero_passage: ""
    });

    const [addCoupleModalOpen, setAddCoupleModalOpen] = useState(false);

    // Handle adding a new couple
    const handleAddCouple = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/couples", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newCouple),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Erreur lors de l'ajout du couple");
            }

            const addedCouple = await response.json();
            setCouples([...couples, addedCouple]);
            setAddCoupleModalOpen(false);
            setNewCouple({
                id: 0,
                numero_licence: "",
                nom_cavalier: "",
                prenom_cavalier: "",
                nom_cheval: "",
                coach: "",
                ecurie: "",
                statut: "Partant",
                numero_sire: "",
                numero_passage:""
            });
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'ajout du couple");
        }
    };

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

    if (loading) return <p className="text-center text-gray-500">Chargement des couples...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-6">Gestion des Couples</h1>

            {/* Table of couples */}
            <div className="bg-white shadow-md rounded-lg p-6">
            <div className="mb-6 flex justify-end">
                <button
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-blue-800 transition-all duration-300"
                    onClick={() => setAddCoupleModalOpen(true)}
                >
                    + Ajouter un couple
                </button>

                {addCoupleModalOpen && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
                            <div className="w-full bg-blue-600 text-white py-4 px-6 rounded-t-lg flex justify-center" style={{ width: "100%" }}>
                                <h3 className="text-2xl font-bold w-full text-center">Ajout d'un couple</h3>
                            </div>
                            <div className="mt-6">
                            </div>
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleAddCouple();
                                }}
                            >
                                {[
                                    { label: "Numéro de licence", value: newCouple.numero_licence, key: "numero_licence" },
                                    { label: "Nom du cavalier", value: newCouple.nom_cavalier, key: "nom_cavalier" },
                                    { label: "Prénom du cavalier", value: newCouple.prenom_cavalier, key: "prenom_cavalier" },
                                    { label: "Nom du cheval", value: newCouple.nom_cheval, key: "nom_cheval" },
                                    { label: "Coach", value: newCouple.coach, key: "coach" },
                                    { label: "Écurie", value: newCouple.ecurie, key: "ecurie" },
                                    { label: "Numéro de SIRE", value: newCouple.numero_sire, key: "numero_sire" },
                                    { label: "Numéro de passage", value: newCouple.numero_passage, key: "numero_passage" },
                                ].map(({ label, value, key }) => (
                                    <div className="mb-4" key={key}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            value={value}
                                            onChange={(e) =>
                                                setNewCouple({ ...newCouple, [key]: e.target.value })
                                            }
                                            required={key !== "numero_passage"}
                                        />
                                    </div>
                                ))}
                                <div className="flex justify-end mt-6">
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-300 mr-3"
                                        onClick={() => setAddCoupleModalOpen(false)}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300"
                                    >
                                        Ajouter
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
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
                                </tr>
                            ))}
                            {couples.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="border px-4 py-3 text-center text-gray-500">
                                        Aucun couple trouvé
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

export default Couples;

const Th = ({ children }: { children: React.ReactNode }) => (
    <th className="border-2 border-gray-300 px-4 py-2 text-center font-medium text-gray-700">{children}</th>
);

const Td = ({ children }: { children: React.ReactNode }) => (
    <td className="border-2 border-gray-300 px-4 py-2 text-center">{children}</td>
);
