// @/app/profil/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilPage() {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();

    // Rediriger si non connecté (le middleware gère le cas où l'utilisateur n'est pas connecté)
    if (!isLoading && !user) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                    <p className="text-center">Chargement des données...</p>
                </div>
            </div>
        );
    }

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="flex flex-col items-center justify-center flex-1 p-4">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold mb-6 text-center">Mon Profil</h1>
                
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center mb-4">
                        <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-600">
                                {user?.prenom?.charAt(0) || ""}{user?.nom?.charAt(0) || ""}
                            </span>
                        </div>
                    </div>
                
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="font-semibold">Nom:</span>
                            <span>{user?.nom}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Prénom:</span>
                            <span>{user?.prenom}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Email:</span>
                            <span>{user?.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Rôle:</span>
                            <span className="capitalize">{user?.type}</span>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-3">
                    <Link href="/competitions" className="block w-full">
                        <button className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                            Accéder aux concours
                        </button>
                    </Link>
                    
                    <button 
                        onClick={handleLogout}
                        className="w-full p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                    >
                        Déconnexion
                    </button>
                </div>
            </div>
        </div>
    );
}