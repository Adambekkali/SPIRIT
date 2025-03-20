// @/components/auth-button.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const AuthButton = () => {
    const { user, isLoading } = useAuth();
    const pathname = usePathname();

    // Si on est dans une route d'auth on n'affiche rien
    if (isLoading) {
        return <div>Chargement...</div>;
    }

    if (!user) {
        return (
            <Link href="/auth/login">
                <button className="bg-black/50 text-white px-4 py-2 rounded-md hover:bg-black/70 hover:cursor-pointer">
                    Connexion
                </button>
            </Link>
        );
    }

    return (
        <div className="flex space-x-2">
            <Link href="/profil">
                <button className="bg-black/50 text-white px-4 py-2 rounded-md hover:bg-black/70 hover:cursor-pointer">
                    Profil
                </button>
            </Link>
        </div>
    );
};

export default AuthButton;