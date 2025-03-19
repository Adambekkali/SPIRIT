import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_pour_developpement';
const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Récupérer le token d'authentification
  const authHeader = request.headers.get('authorization');
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;
  
  if (!token && request.method !== 'GET') {
    return NextResponse.json(
      { error: "Authentification requise" },
      { status: 401 }
    );
  }
  
  if (token) {
    try {
      // Vérifier et décoder le token avec jose
      const { payload } = await jose.jwtVerify(token, secret);
      
      // Ajouter les informations de l'utilisateur aux headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId?.toString() || "");
      requestHeaders.set('x-user-role', payload.type?.toString() || "");
      
      // Continuer avec la requête modifiée
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error: any) {
      console.error("Erreur JWT:", error);
      return NextResponse.json(
        { error: "Session invalide ou expirée", details: error.message },
        { status: 401 }
      );
    }
  }
  
  // Pour les routes non protégées ou les requêtes GET
  return NextResponse.next();
}