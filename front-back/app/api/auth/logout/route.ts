import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ success: true });
    
    // Supprimer le cookie d'authentification
    response.cookies.delete('token_spirit');
    
    return response;
}