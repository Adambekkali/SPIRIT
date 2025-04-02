"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const ModifierPage: React.FC = () => {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const [couple, setCouple] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<string | null>(null);

    useEffect(() => {
        const fetchCouple = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/couples/${id}`);
                if (!res.ok) throw new Error("Erreur lors de la récupération des données.");
                const data = await res.json();
                setCouple(data);
            } catch (err) {
                setError("Impossible de charger les données du couple.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchCouple();
    }, [id]);

    const handleInputChange = (field: string, value: string) => {
        setCouple((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            const updatedData = {
                nom_cavalier: couple.nom_cavalier,
                prenom_cavalier: couple.prenom_cavalier,
                nom_cheval: couple.nom_cheval,
                coach: couple.coach,
                ecurie: couple.ecurie,
            };

            const res = await fetch(`http://localhost:3000/api/couples/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Erreur lors de la mise à jour des données.");
            }

            setNotification("Les modifications ont été enregistrées avec succès !");
        } catch (err) {
            console.error("Erreur lors de la sauvegarde :", err);
            setNotification(err instanceof Error ? err.message : "Erreur lors de la sauvegarde des modifications.");
        }
    };

    if (loading) return <p>Chargement...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded-md">
            <h1 className="text-2xl font-bold mb-4">Modifier les informations du couple</h1>
            {notification && (
                <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
                    {notification}
                </div>
            )}
            <div className="space-y-4">
                <div>
                    <label className="block font-medium">Nom du cavalier</label>
                    <input
                        type="text"
                        value={couple.nom_cavalier || ""}
                        onChange={(e) => handleInputChange("nom_cavalier", e.target.value)}
                        className="w-full border rounded-lg p-2"
                    />
                </div>
                <div>
                    <label className="block font-medium">Prénom du cavalier</label>
                    <input
                        type="text"
                        value={couple.prenom_cavalier || ""}
                        onChange={(e) => handleInputChange("prenom_cavalier", e.target.value)}
                        className="w-full border rounded-lg p-2"
                    />
                </div>
                <div>
                    <label className="block font-medium">Nom du cheval</label>
                    <input
                        type="text"
                        value={couple.nom_cheval || ""}
                        onChange={(e) => handleInputChange("nom_cheval", e.target.value)}
                        className="w-full border rounded-lg p-2"
                    />
                </div>
                <div>
                    <label className="block font-medium">Coach</label>
                    <input
                        type="text"
                        value={couple.coach || ""}
                        onChange={(e) => handleInputChange("coach", e.target.value)}
                        className="w-full border rounded-lg p-2"
                    />
                </div>
                <div>
                    <label className="block font-medium">Écurie</label>
                    <input
                        type="text"
                        value={couple.ecurie || ""}
                        onChange={(e) => handleInputChange("ecurie", e.target.value)}
                        className="w-full border rounded-lg p-2"
                    />
                </div>
            </div>
            <div className="flex justify-between mt-4">
                <button
                    onClick={() => window.location.href = "/SR"}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                    Retour
                </button>
                <button
                    onClick={handleSave}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                    Enregistrer
                </button>
            </div>
        </div>
    );
};

export default ModifierPage;
