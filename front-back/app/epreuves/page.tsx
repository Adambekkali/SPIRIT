"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";

// Fonction pour récupérer les épreuves depuis l'API
const getEpreuves = async () => {

    const res = await fetch(`http://localhost:3000/api/epreuves`);
    const data = await res.json();
    return data.epreuves;
};

const Epreuves = ({ params }: { params: { id: string } }) => {
    const [epreuves, setEpreuves] = useState<any[]>([]);
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
        <>
            <h1 className="text-2xl font-bold text-center mb-4">Épreuves</h1>

            {/* Affichage des informations de l'épreuve sélectionnée */}
            {epreuves && (
                <div>
                    {/* Liste des épreuves */}
                    <h3 className="text-lg font-semibold mt-4">Ordre de passage et résultats</h3>
                    <table className="w-full border-collapse border border-gray-300 mt-2">
                        <thead>
                            <tr className="bg-gray-100">
                                <Th>#</Th>
                                <Th>Intitulé</Th>
                                <Th>Compétition</Th>
                                <Th>Type</Th>
                                <Th>Statut</Th>
                                <Th>Couples</Th>
                                <Th>Action</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {epreuves.map((epreuve: any, index: number) => (
                                <tr key={index} className="border-t">
                                    <Td>{index + 1}</Td>
                                    <Td>{epreuve.intitule}</Td>
                                    <Td>{epreuve.competition?.intitule}</Td>
                                    <Td>{epreuve.competition?.type}</Td>
                                    <Td>{epreuve.statut}</Td>
                                    <Td>{epreuve.participations.length}</Td>
                                    <Td>
                                        <div className="flex justify-center">
                                            <Link href={`/epreuves/${epreuve.id}`}
                                                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                                            >
                                                Ouvrir
                                            </Link>
                                        </div>
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
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