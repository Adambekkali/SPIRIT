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
}

const Couples = () => {
    const [couples, setCouples] = useState<Couple[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
