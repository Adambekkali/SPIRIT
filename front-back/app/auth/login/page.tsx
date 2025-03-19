"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            // 1. Authentification
            const loginResponse = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, mot_de_passe: password }),
            });
    
            if (loginResponse.ok) {
                const data = await loginResponse.json();
                const token = data.token;
                
                // 2. Création de session sécurisée
                const sessionResponse = await fetch("/api/auth/session", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ token }),
                });
                
                if (sessionResponse.ok) {
                    setIsLoggedIn(true);
                    router.push("/?hasLoggedIn=true");
                } else {
                    setError("Erreur lors de la création de la session");
                }
            } else {
                const errorData = await loginResponse.json();
                setError(errorData.error || "Email ou mot de passe incorrect");
            }
        } catch (err) {
            console.error("Erreur:", err);
            setError("Une erreur s'est produite");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center pb-24">
            <h1 className="text-2xl font-bold pb-8">Login</h1>
            {
                isLoading ? (
                    <div>Loading...</div>
                ) : (
                    <form onSubmit={handleSubmit}
                        className="flex flex-col gap-4"
                    >
                        <input
                            className="border-2 border-gray-300 rounded-md p-2"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            className="border-2 border-gray-300 rounded-md p-2"
                            placeholder="Password"
                            type="password" value={password} onChange={(e) => setPassword(e.target.value)} 
                        />
                        <button 
                            className="bg-blue-500 text-white rounded-md p-2 
                                hover:bg-blue-600 hover:scale-95 transition-all duration-300 hover:cursor-pointer"
                            type="submit">Login</button>
                    </form>
                )
            }
        </div>
    )
}

