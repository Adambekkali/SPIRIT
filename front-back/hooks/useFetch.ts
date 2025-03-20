// app/hooks/useFetch.ts
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function useFetch() {
    const { logout } = useAuth();
    const router = useRouter();

    const fetchWithAuth = useCallback(
        async (url: string, options: RequestInit = {}) => {
            try {
                // Inclure les cookies dans les requêtes
                const fetchOptions: RequestInit = {
                    ...options,
                    headers: {
                        "Content-Type": "application/json",
                        ...options.headers,
                    },
                    credentials: 'include',
                };

                const response = await fetch(url, fetchOptions);

                if (response.status === 401) {
                    // Session expirée, déconnecter l'utilisateur
                    await logout();
                    router.push('/auth/login');
                    throw new Error("Session expirée");
                }

                if (!response.ok) {
                    const error = await response.json().catch(() => ({
                        message: `Erreur HTTP ${response.status}`,
                    }));
                    throw new Error(error.message || `Erreur HTTP ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                console.error("Erreur fetch:", error);
                throw error;
            }
        },
        [logout, router]
    );

    return { fetchWithAuth };
}