// Toutes les fonctions d'authentification

// récupérer la session de l'utilisateur (email, nom, prenom, type, token)
// async function donc on peut l'utiliser dans un useEffect
export async function getSession() {
    const session = await fetch("/api/auth/session");
    const data = await session.json();
    return data;
}

