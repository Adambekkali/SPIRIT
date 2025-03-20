"use client";

import Link from "next/link";
// vérifier si l'utilisateur est connecté
// si oui, afficher le bouton de profil
// si non, afficher le bouton de connexion

import { useState, useEffect } from "react";

const AuthButton = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch("/api/auth/session");
            const data = await response.json();
            if (data.isConnected) {
                setIsConnected(true);
                setIsLoading(false);
            } else {
                setIsConnected(false);
                setIsLoading(false);
            }
        };
        fetchData();
    }, [isConnected]);

    if (isLoading) {
        return <div>Chargement...</div>;
    }

    if (isConnected) {
        return <div>Profil</div>;
    }

    return (
        <Link href="/auth/login">
            <button className="bg-black/50 text-white px-4 py-2 rounded-md hover:bg-black/70 hover:cursor-pointer">
                Connexion
            </button>
        </Link>
    );
};

export default AuthButton;
