import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as jose from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_pour_developpement';
const secret = new TextEncoder().encode(JWT_SECRET);

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token_spirit')?.value;
        
        if (!token) {
            return NextResponse.json({ authenticated: false, user: null });
        }
        
        // Vérifier le token
        try {
            const { payload } = await jose.jwtVerify(token, secret);
            
            // Récupérer l'utilisateur sans le mot de passe
            const user = await prisma.utilisateur.findUnique({
                where: { id: Number(payload.userId) },
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    email: true,
                    type: true,
                    mot_de_passe: false
                }
            });
            
            if (!user) {
                return NextResponse.json(
                    { error: "Utilisateur non trouvé" },
                    { status: 404 }
                );
            }
            
            return NextResponse.json({ user });
        } catch (error) {
            // Token invalide ou expiré, supprimer le cookie
            const response = NextResponse.json(
                { error: "Session invalide ou expirée" },
                { status: 401 }
            );
            response.cookies.delete('token_spirit');
            return response;
        }
    } catch (error) {
        console.error("Erreur lors de la vérification:", error);
        return NextResponse.json(
            { error: "Une erreur est survenue lors de la vérification" },
            { status: 500 }
        );
    }
}