import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jose from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_pour_developpement';
const secret = new TextEncoder().encode(JWT_SECRET);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        if (!body.email || !body.mot_de_passe) {
            return NextResponse.json(
                { error: "L'email et le mot de passe sont requis" },
                { status: 400 }
            );
        }
        
        // Rechercher l'utilisateur par email
        const utilisateur = await prisma.utilisateur.findUnique({
            where: { email: body.email }
        });
        
        if (!utilisateur) {
            return NextResponse.json(
                { error: "Identifiants invalides" },
                { status: 401 }
            );
        }
        
        // Vérifier le mot de passe
        const passwordMatch = await bcrypt.compare(body.mot_de_passe, utilisateur.mot_de_passe);
        
        if (!passwordMatch) {
            return NextResponse.json(
                { error: "Identifiants invalides" },
                { status: 401 }
            );
        }
        
        // Générer un token JWT avec jose
        const token = await new jose.SignJWT({ 
            userId: utilisateur.id,
            email: utilisateur.email,
            type: utilisateur.type 
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(secret);
        
        // Préparer la réponse avec les données utilisateur
        const response = NextResponse.json({
            user: {
                id: utilisateur.id,
                nom: utilisateur.nom,
                prenom: utilisateur.prenom,
                email: utilisateur.email,
                type: utilisateur.type
            }
        });
        
        // Définir le cookie sécurisé avec le token JWT
        response.cookies.set({
            name: 'token_spirit',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 24 heures
            path: '/'
        });
        
        return response;
    } catch (error) {
        console.error("Erreur lors de l'authentification:", error);
        return NextResponse.json(
            { error: "Une erreur est survenue lors de l'authentification" },
            { status: 500 }
        );
    }
}