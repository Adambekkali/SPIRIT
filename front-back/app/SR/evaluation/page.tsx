"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

const EvaluationPage: React.FC = () => {

  const searchParams = useSearchParams();
  const participation_id = searchParams.get("participation_id") || undefined;
  const [participation, setParticipation] = useState<any>(null);
  const getParticipation = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/participations/${participation_id}`);
      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des données.");
      }
      const data = await res.json();
      setParticipation(data);
    }
    catch (err) {
      setError("Impossible de charger les données de la participation.");
      console.error(err);
    }
  }

  const [isJudging, setIsJudging] = useState(false);
  const [penalite, SetPenalite] = useState(0);
  const [temps, setTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (participation_id) {
      getParticipation();
    }
  }, [participation_id]);

  const startTimer = () => {
    if (!timerRunning) {
      setTimerRunning(true);
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
  };

  const stopTimer = () => {
    if (timerRunning && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setTimerRunning(false);
    }
  };

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTime(0);
    SetPenalite(0);
    setTimerRunning(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleAddPenalty = () => {
    SetPenalite((prevPenalties) => prevPenalties + 1);
  };

  const handleSaveResults = async () => {
    
    const results = {
      temps,
      penalite,
      couple_id: participation?.couple?.id || "echec recup id couple",
      type_compete : participation.epreuve?.competition?.type || "echec recup type competition",
      temps_total : temps,
      
    };

    if (participation.epreuve?.competition?.type === "Equifun") {
      results.temps_total += penalite;
    }


    console.log("Résultats:", results);
    resetTimer();
    setIsJudging(false);
    try {
      const response = await fetch(`http://localhost:3000/api/participations/${participation?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(results),
      });
      const classage = await fetch(`http://localhost:3000/api/epreuves/${participation?.epreuve_id}/classement`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });
      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement des résultats.");
      }
      if (!classage.ok) {
        throw new Error("Erreur lors du classement.");
      }
      console.log("Résultats enregistrés avec succès.");
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f9f9f9",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          marginBottom: "20px",
          width: "80%",
          maxWidth: "600px",
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <tbody>
            <tr>
              <td style={{ fontWeight: "bold", padding: "10px", borderBottom: "1px solid #ddd" }}>
                Nom cavalier
              </td>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                {participation?.couple?.nom_cavalier || "Chargement..."}
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: "bold", padding: "10px", borderBottom: "1px solid #ddd" }}>
                Nom cheval
              </td>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                {participation?.couple?.nom_cheval || "Chargement..."}
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: "bold", padding: "10px", borderBottom: "1px solid #ddd" }}>
                Coach
              </td>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                {participation?.couple?.coach || "Chargement..."}
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: "bold", padding: "10px", borderBottom: "1px solid #ddd" }}>
                Ecurie
              </td>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                {participation?.couple?.ecurie || "Chargement..."}
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: "bold", padding: "10px", borderBottom: "1px solid #ddd" }}>
                Numéro de licence
              </td>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                {participation?.couple?.numero_licence || "Chargement..."}
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: "bold", padding: "10px" }}>Numéro de passage</td>
              <td style={{ padding: "10px" }}>
                {participation?.couple?.numero_passage || "Chargement..."}
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: "bold", padding: "10px" }}>Type Compétition</td>
              <td style={{ padding: "10px" }}>
                {participation?.epreuve?.competition?.type || "Chargement..."}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {!isJudging ? (
        <button
          onClick={() => setIsJudging(true)}
          style={{
            padding: "15px 30px",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#fff",
            backgroundColor: "#007BFF",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "transform 0.2s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Juger
        </button>
      ) : (
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "48px", margin: "20px 0" }}>Chrono : {temps}s</h1>
          <button
            onClick={timerRunning ? stopTimer : startTimer}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              fontWeight: "bold",
              color: "#fff",
              backgroundColor: timerRunning ? "#dc3545" : "#28a745",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              marginBottom: "20px",
              transition: "transform 0.2s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {timerRunning ? "Pause" : "Démarrer"}
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            {participation?.epreuve?.competition?.type === "CSO" ? (
              <div>
                <button
                  onClick={handleAddPenalty}
                  style={{
                    padding: "10px",
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#fff",
                    backgroundColor: "#ffc107",
                    border: "none",
                    borderRadius: "50%",
                    cursor: "pointer",
                    width: "50px",
                    height: "50px",
                    transition: "transform 0.2s ease",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
                  onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  +
                </button>
                <button
                  onClick={() => SetPenalite((prev) => Math.max(prev - 1, 0))}
                  style={{
                    padding: "10px",
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#fff",
                    backgroundColor: "#ffc107",
                    border: "none",
                    borderRadius: "50%",
                    cursor: "pointer",
                    width: "50px",
                    height: "50px",
                    transition: "transform 0.2s ease",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
                  onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  -
                </button>
                <p
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            Pénalités: {penalite}
          </p>
              </div>
            ) : (
              <div>

                <p
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            Pénalités en secondes : 
          </p> 
                <input
                  type="number"
                  value={penalite}
                  onChange={(e) => SetPenalite(Math.max(0, parseInt(e.target.value) || 0))}
                  style={{
                    padding: "10px",
                    fontSize: "18px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    width: "80px",
                    textAlign: "center",
                  }}
                />
              </div>
            )}
          </div>

          <button
            onClick={handleSaveResults}
            style={{
              padding: "15px 30px",
              fontSize: "18px",
              fontWeight: "bold",
              color: "#fff",
              backgroundColor: "#007BFF",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "transform 0.2s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Enregistrer les résultats
          </button>
        </div>
      )}
    </div>
  );
};

export default EvaluationPage;
