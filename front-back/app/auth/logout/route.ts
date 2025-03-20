import { NextResponse } from 'next/server';

export async function GET() {
  // Créer une réponse qui redirige vers la page d'accueil
  const response = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  
  // Supprimer le cookie token_spirit en le remplaçant par un cookie vide avec une date d'expiration passée
  response.cookies.set({
    name: 'token_spirit',
    value: '',
    path: '/',
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  
  return response;
}
