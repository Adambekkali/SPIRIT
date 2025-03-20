import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_pour_developpement';
const secret = new TextEncoder().encode(JWT_SECRET);

// Routes publiques
const PRIVATE_PATHS = [
    "/profil",
    "/admin",
    "/couples",
];

// Routes accessibles en lecture seule sans authentification
const PUBLIC_READ_PATHS = [
    '/api/competitions',
    '/api/epreuves',
    '/api/couples',
];

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    
    // Vérifier si le chemin est public
    const isPublicPath = !PRIVATE_PATHS.some(publicPath => 
        path.startsWith(publicPath)
    );
    
    // Autoriser l'accès aux chemins publics
    if (isPublicPath || path === '/') {
        return NextResponse.next();
    }
    
    // Autoriser les requêtes GET pour les chemins en lecture seule publics
    const isPublicReadPath = PUBLIC_READ_PATHS.some(publicPath => 
        path.startsWith(publicPath)
    );
    
    if (isPublicReadPath && request.method === 'GET') {
        return NextResponse.next();
    }
    
    // Récupérer le token depuis le cookie
    const token = request.cookies.get('token_spirit')?.value;
    
    if (!token) {
        // API => erreur 401, Pages => redirection login
        if (path.startsWith('/api/')) {
            return NextResponse.json(
                { error: "Authentification requise" },
                { status: 401 }
            );
        } else {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }
    
    try {
        // Vérifier le token
        const { payload } = await jose.jwtVerify(token, secret);
        
        // Ajouter les infos utilisateur aux en-têtes pour les API
        if (path.startsWith('/api/')) {
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set('x-user-id', String(payload.userId));
            requestHeaders.set('x-user-role', String(payload.type));
            
            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });
        }
        
        // Pour les pages, simplement autoriser l'accès
        return NextResponse.next();
    } catch (error) {
        console.error("Erreur JWT:", error);
        
        // Token invalide => supprimer le cookie
        const response = path.startsWith('/api/')
            ? NextResponse.json({ error: "Session invalide ou expirée" }, { status: 401 })
            : NextResponse.redirect(new URL('/auth/login', request.url));
            
        response.cookies.delete('token_spirit');
        return response;
    }
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image).*)'
    ],
};