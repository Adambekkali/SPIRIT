import { NextRequest, NextResponse } from 'next/server';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_pour_developpement';

// Routes protégées qui nécessitent une authentification
const PROTECTED_ROUTES = [
  '/api/competitions',
  '/api/epreuves',
  '/api/couples',
  '/api/participations',
  '/api/utilisateurs',
];

// Routes nécessitant des privilèges administrateur
const ADMIN_ROUTES = [
  '/api/utilisateurs'
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Vérifier si la route est protégée
  const isProtectedRoute = PROTECTED_ROUTES.some(route => path.startsWith(route));
  
  // Ne vérifier l'authentification que pour les routes protégées
  if (isProtectedRoute) {
    // Récupérer le token d'authentification
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;
    
    // Si pas de token et que ce n'est pas une requête GET
    if (!token && request.method !== 'GET') {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }
    
    // Si on a un token, le vérifier
    if (token) {
      try {
        // Vérifier et décoder le token
        const decoded: any = jwt.verify(token, JWT_SECRET);
        
        // Vérifier les permissions pour les routes administrateur
        const isAdminRoute = ADMIN_ROUTES.some(route => path.startsWith(route));
        
        if (isAdminRoute && decoded.type !== 'administrateur') {
          return NextResponse.json(
            { error: "Accès non autorisé" },
            { status: 403 }
          );
        }
        
        // Pour les méthodes d'écriture, vérifier les permissions par type d'utilisateur
        if (request.method !== 'GET') {
          // Jury: peut modifier les participations (résultats)
          if (decoded.type === 'jury' && !path.startsWith('/api/participations')) {
            return NextResponse.json(
              { error: "Accès non autorisé" },
              { status: 403 }
            );
          }
          
          // Entrée de piste: peut modifier le statut des couples
          if (decoded.type === 'entree_de_piste' && !path.startsWith('/api/couples')) {
            return NextResponse.json(
              { error: "Accès non autorisé" },
              { status: 403 }
            );
          }
          
          // Lecteur: n'a accès qu'à la lecture
          if (decoded.type === 'lecteur') {
            return NextResponse.json(
              { error: "Accès non autorisé" },
              { status: 403 }
            );
          }
        }
        
        // Ajouter l'utilisateur décodé aux headers pour les routes protégées
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', decoded.userId.toString());
        requestHeaders.set('x-user-role', decoded.type);
        
        // Continuer avec la requête modifiée
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      } catch (error) {
        // Token invalide ou expiré
        return NextResponse.json(
          { error: "Session invalide ou expirée" },
          { status: 401 }
        );
      }
    }
  }
  
  // Pour les routes non protégées ou les requêtes GET sur routes protégées, continuer normalement
  return NextResponse.next();
}

// Configurer les chemins où le middleware doit s'exécuter
export const config = {
  matcher: [
    '/api/:path*',
  ],
};