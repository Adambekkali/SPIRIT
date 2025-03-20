// app/contexts/AuthContext.tsx
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    type: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Vérifier si l'utilisateur est déjà connecté au chargement
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Vérifier la validité du cookie de session
                const response = await fetch("/api/auth/verify", {
                    credentials: 'include'  // Important pour envoyer les cookies
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData.user);
                }
            } catch (error) {
                console.error("Erreur de vérification de l'authentification:", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include',  // Important pour recevoir les cookies
                body: JSON.stringify({ email, mot_de_passe: password })
            });

            if (!response.ok) {
                return false;
            }

            const data = await response.json();
            setUser(data.user);
            
            return true;
        } catch (error) {
            console.error("Erreur de connexion:", error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            setUser(null);
            router.push("/auth/login");
        } catch (error) {
            console.error("Erreur lors de la déconnexion:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
    }
    return context;
};