"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

const EvaluationPage: React.FC = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || undefined;
  const [couple, setCouple] = useState<any>(null);
  const [isJudging, setIsJudging] = useState(false);
  const [penalties, setPenalties] = useState(0);
  const [time, setTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null); // Utiliser useRef pour stocker le timer

  // Fonction pour récupérer les données du couple
  const getCouple = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/couples/${id}`);
      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des données.");
      }
      const data = await res.json();
      setCouple(data); // Stocker les données du couple
    } catch (err) {
      setError("Impossible de charger les données du couple.");
      console.error(err);
    }
  };

  // Utiliser useEffect pour appeler l'API une seule fois
  useEffect(() => {
    if (id) {
      getCouple();
    }
  }, [id]); // Dépendance : l'ID

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
      timerRef.current = null; // Réinitialiser la référence du timer
      setTimerRunning(false);
    }
  };

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTime(0);
    setPenalties(0);
    setTimerRunning(false);
  };

  useEffect(() => {
    // Nettoyer le timer lorsque le composant est démonté
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleAddPenalty = () => {
    setPenalties((prevPenalties) => prevPenalties + 1);
  };

  const handleSaveResults = () => {
    const results = {
      time,
      penalties,
    };
    console.log("Results saved:", results);
    resetTimer();
    setIsJudging(false);
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
              {couple?.nom_cavalier || "Chargement..."}
            </td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", padding: "10px", borderBottom: "1px solid #ddd" }}>
              Nom cheval
            </td>
            <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
              {couple?.nom_cheval || "Chargement..."}
            </td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", padding: "10px", borderBottom: "1px solid #ddd" }}>
              Coach
            </td>
            <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
              {couple?.coach || "Chargement..."}
            </td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", padding: "10px", borderBottom: "1px solid #ddd" }}>
              Ecurie
            </td>
            <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
              {couple?.ecurie || "Chargement..."}
            </td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", padding: "10px", borderBottom: "1px solid #ddd" }}>
              Numéro de licence
            </td>
            <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
              {couple?.numero_licence || "Chargement..."}
            </td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold", padding: "10px" }}>Numéro de passage</td>
            <td style={{ padding: "10px" }}>
              {couple?.numero_passage || "Chargement..."}
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
          <h1 style={{ fontSize: "48px", margin: "20px 0" }}>Chrono: {time}s</h1>
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
              onClick={() => setPenalties((prev) => Math.max(prev - 1, 0))}
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
          </div>
          <p
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            Pénalités: {penalties}
          </p>
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