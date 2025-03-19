import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_pour_developpement';
const secret = new TextEncoder().encode(JWT_SECRET);

// Liste des chemins publics qui ne nécessitent pas d'authentification
const PUBLIC_PATHS = [
  '/auth/login',
  '/api/auth/login',
  '/api/auth/session',
  '/_next',
  '/favicon.ico',
  '/images',
  '/styles'
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Vérifier si le chemin est public
  const isPublicPath = PUBLIC_PATHS.some(publicPath => 
    path.startsWith(publicPath)
  );
  
  // Autoriser l'accès aux chemins publics
  if (isPublicPath || path === '/') {
    return NextResponse.next();
  }

  // Récupérer le token depuis le cookie
  const cookieToken = request.cookies.get('token_spirit')?.value;

  // Si le token de connexion n'est pas présent, renvoyer vers la page de login
  if (!cookieToken) {
    console.log("Aucun token dans les cookies, redirection vers login");
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    // Vérifier et décoder le token avec jose
    const { payload } = await jose.jwtVerify(cookieToken, secret);
    
    // Ajouter les informations de l'utilisateur aux headers pour les API
    if (path.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId?.toString() || "");
      requestHeaders.set('x-user-role', payload.type?.toString() || "");
      
      // Continuer avec la requête modifiée
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
    
    // Si ce n'est pas une API, simplement autoriser l'accès
    return NextResponse.next();
  } catch (error: any) {
    console.error("Token invalide ou expiré:", error);
    
    // Pour les API, renvoyer une erreur JSON
    if (path.startsWith('/api/')) {
      return NextResponse.json(
        { error: "Session invalide ou expirée", details: error.message },
        { status: 401 }
      );
    }
    
    // Pour les pages, rediriger vers login
    console.log("Token invalide, redirection vers login");
    // Supprimer le cookie invalide
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('token_spirit');
    return response;
  }
}

// Configurer les chemins sur lesquels le middleware s'applique
export const config = {
  matcher: [
    // Appliquer à tous les chemins sauf les fichiers statiques
    '/((?!_next/static|_next/image).*)'
  ],
};