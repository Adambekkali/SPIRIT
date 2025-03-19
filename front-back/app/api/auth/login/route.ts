import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_pour_developpement';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
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
    
    // Générer un token JWT
    const token = jwt.sign(
      { 
        userId: utilisateur.id,
        email: utilisateur.email,
        type: utilisateur.type
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Renvoyer l'utilisateur sans le mot de passe et avec le token
    return NextResponse.json({
      user: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        type: utilisateur.type
      },
      token
    });
  } catch (error) {
    console.error("Erreur lors de l'authentification:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'authentification" },
      { status: 500 }
    );
  }
}