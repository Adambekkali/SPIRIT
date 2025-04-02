"use client";
import React, { useEffect, useState } from "react";

import { Competition, Epreuve } from "@/prisma/types";

export default function Home() {
  const [epreuves, setEpreuves] = useState<Epreuve[]>([]);
  const [filteredEpreuves, setFilteredEpreuves] = useState<Epreuve[]>([]);
  const [selectedEpreuve, setSelectedEpreuve] = useState<Epreuve | null>(null);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] =
    useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [epreuvesRes, competitionsRes] = await Promise.all([
          fetch("/api/epreuves"),
          fetch("/api/competitions"),
        ]);

        if (!epreuvesRes.ok || !competitionsRes.ok) {
          throw new Error("Erreur lors de la récupération des données.");
        }

        const epreuvesData = await epreuvesRes.json();
        const competitionsData = await competitionsRes.json();

        setEpreuves(epreuvesData.epreuves || []);
        setCompetitions(competitionsData.competitions || []);
      } catch (err) {
        setError("Impossible de charger les données.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    // Filtrer les épreuves "À venir", "En cours", "Terminée", et "Clôturée"
    const filtered = epreuves.filter(
      (epreuve) =>
        epreuve.statut === "A_venir" ||
        epreuve.statut === "En_cours" ||
        epreuve.statut === "Terminee" ||
        epreuve.statut === "Cloturee"
    );
    setFilteredEpreuves(filtered);
  }, [epreuves]);

  if (loading)
    return <p className="text-center text-gray-500">Chargement...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold">Bienvenue sur SPIRIT</h1>
        <p className="text-lg text-gray-600 mt-2">
          Découvrez les compétitions, épreuves et participants en cours.
        </p>
      </header>

      {/* Liste des compétitions */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Compétitions</h2>
        <ul className="space-y-3">
          {competitions.length > 0 ? (
            competitions.map((competition) => (
              <li
                key={competition.id}
                className={`border-b pb-2 cursor-pointer hover:bg-gray-100 ${
                  selectedCompetition?.id === competition.id
                    ? "bg-gray-200"
                    : ""
                }`}
                onClick={() => setSelectedCompetition(competition)}
              >
                <strong>{competition.intitule}</strong> - {competition.type}
              </li>
            ))
          ) : (
            <li>Aucune compétition disponible</li>
          )}
        </ul>
      </section>

      {/* Liste des épreuves */}
      {selectedCompetition && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Épreuves de la compétition : {selectedCompetition.intitule}
            </h2>
            <ul className="space-y-3">
              {filteredEpreuves.length > 0 ? (
                filteredEpreuves
                  .filter(
                    (epreuve) =>
                      epreuve.competition?.intitule ===
                      selectedCompetition.intitule
                  )
                  .map((epreuve) => (
                    <li
                      key={epreuve.id}
                      className="border-b pb-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => setSelectedEpreuve(epreuve)}
                    >
                      <strong>{epreuve.intitule}</strong>{" "}
                      <StatusBadge status={epreuve.statut} />
                      <p className="text-sm text-gray-600">
                        Nombre de participations :{" "}
                        {epreuve.participations?.length || 0}
                      </p>
                    </li>
                  ))
              ) : (
                <li>Aucune épreuve disponible</li>
              )}
            </ul>
          </div>

          {/* Participants de l'épreuve sélectionnée */}
          {selectedEpreuve && (
            <div className="bg-white shadow-md rounded-lg p-6 col-span-2">
              <h2 className="text-2xl font-semibold mb-4">
                {`Participants de l'épreuve : ${selectedEpreuve.intitule}`}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Compétition : {selectedEpreuve.competition?.intitule} (
                {selectedEpreuve.competition?.type})
              </p>
              <ul className="space-y-3">
                {(selectedEpreuve.participations?.length ?? 0) > 0 ? (
                  selectedEpreuve.participations?.map(
                    (participation, index) => (
                      <li key={index} className="border-b pb-2">
                        <strong>
                          {participation.couple?.nom_cavalier}{" "}
                          {participation.couple?.prenom_cavalier}
                        </strong>{" "}
                        - {participation.couple?.nom_cheval}
                        <p className="text-sm text-gray-600">
                          Écurie : {participation.couple?.ecurie}
                        </p>
                      </li>
                    )
                  )
                ) : (
                  <li>Aucun participant pour cette épreuve</li>
                )}
              </ul>
            </div>
          )}
        </section>
      )}

      <footer className="text-center mt-12">
        <p className="text-gray-500">© 2025 SPIRIT. Tous droits réservés.</p>
      </footer>
    </div>
  );
}

// Composant pour afficher un badge de statut avec des couleurs
const StatusBadge = ({ status }: { status: string }) => {
  // Couleurs des statuts
  const statusColors: Record<string, string> = {
    A_venir: "bg-blue-100 text-blue-800 border border-blue-200",
    En_cours: "bg-green-100 text-green-800 border border-green-200",
    Terminee: "bg-purple-100 text-purple-800 border border-purple-200",
    Cloturee: "bg-gray-100 text-gray-800 border border-gray-200",
  };

  return (
    <span
      className={`px-2 py-1 rounded-md text-sm font-semibold ${
        statusColors[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
};
