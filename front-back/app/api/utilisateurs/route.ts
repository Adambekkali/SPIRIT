import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// GET - Récupérer tous les utilisateurs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Paramètres optionnels de filtrage et pagination
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Construction de la requête de filtrage
    const where: any = {};
    
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (type) {
      where.type = type;
    }
    
    // Récupérer les utilisateurs avec pagination
    const utilisateurs = await prisma.utilisateur.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nom: 'asc' },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        type: true,
        // Ne pas renvoyer le mot de passe, même hashé
        mot_de_passe: false
      }
    });
    
    // Compter le nombre total pour la pagination
    const total = await prisma.utilisateur.count({ where });
    
    return NextResponse.json({
      utilisateurs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des utilisateurs" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouvel utilisateur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    if (!body.nom || !body.prenom || !body.email || !body.mot_de_passe || !body.type) {
      return NextResponse.json(
        { error: "Tous les champs sont obligatoires" },
        { status: 400 }
      );
    }
    
    // Vérification de l'unicité de l'email
    const emailExists = await prisma.utilisateur.findUnique({
      where: { email: body.email }
    });
    
    if (emailExists) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 409 }
      );
    }
    
    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(body.mot_de_passe, 10);
    
    // Création de l'utilisateur
    const newUtilisateur = await prisma.utilisateur.create({
      data: {
        nom: body.nom,
        prenom: body.prenom,
        email: body.email,
        mot_de_passe: hashedPassword,
        type: body.type
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        type: true,
        // Ne pas renvoyer le mot de passe, même hashé
        mot_de_passe: false
      }
    });
    
    return NextResponse.json(newUtilisateur, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    
    if (error === 'P2002') {
      return NextResponse.json(
        { error: "Contrainte d'unicité violée. Vérifiez l'email." },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de l'utilisateur" },
      { status: 500 }
    );
  }
}