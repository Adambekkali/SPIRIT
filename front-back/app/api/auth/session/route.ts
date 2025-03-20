import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_pour_developpement';
const secret = new TextEncoder().encode(JWT_SECRET);

// récupérer le token de l'utilisateur
export async function GET(request: NextRequest) {
  const { cookies } = request;
  const token = cookies.get('token_spirit')?.value;

  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }
  return NextResponse.json({ isConnected: true }, { status: 200 });
}

// vérifier si le token est valide
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    // Vérifier que le token est valide
    try {
      await jose.jwtVerify(token, secret);
    } catch (error) {
      return NextResponse.json(
        { error: "Token invalide" },
        { status: 401 }
      );
    }
    
    // Créer une réponse
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );
    
    // Définir le cookie de manière sécurisée
    response.cookies.set({
      name: 'token_spirit',
      value: token,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      // Durée de vie du cookie (ajustez selon vos besoins)
      maxAge: 60 * 60 * 4 // 4 heures en secondes
    });
    
    return response;
  } catch (error) {
    console.error("Erreur lors de la création de la session:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}