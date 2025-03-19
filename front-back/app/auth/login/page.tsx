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
        const response = await fetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, mot_de_passe: password }),
        })

        if (response.ok) {
            // Extraire les données JSON de la réponse
            const data = await response.json();
            
            // Le token est dans data.token
            const token = data.token;
            console.log("token: ", token);
            
            // Stocker le token dans localStorage ou cookies
            localStorage.setItem("token_spirit", token);
            
            setIsLoggedIn(true);
            router.push("/couples?isLoggedIn=true");

            // router.push("/couples?isLoggedIn=true");
        } else {
            setError("Email ou mot de passe incorrect");
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

