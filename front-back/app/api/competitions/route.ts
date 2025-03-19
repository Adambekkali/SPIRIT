import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer toutes les compétitions
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
        { numero: { contains: search, mode: 'insensitive' } },
        { intitule: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (type) {
      where.type = type;
    }
    
    // Récupérer les compétitions avec pagination
    const competitions = await prisma.competition.findMany({
      where,
      skip,
      take: limit,
      orderBy: { intitule: 'asc' },
      include: {
        epreuves: true
      }
    });
    
    // Compter le nombre total pour la pagination
    const total = await prisma.competition.count({ where });
    
    return NextResponse.json({
      competitions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des compétitions:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des compétitions" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle compétition
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    if (!body.numero || !body.intitule || !body.type) {
      return NextResponse.json(
        { error: "Tous les champs sont obligatoires" },
        { status: 400 }
      );
    }
    
    // Vérification de l'unicité du numéro de compétition
    const existingCompetition = await prisma.competition.findUnique({
      where: { numero: body.numero }
    });
    
    if (existingCompetition) {
      return NextResponse.json(
        { error: "Une compétition avec ce numéro existe déjà" },
        { status: 409 }
      );
    }
    
    // Création de la compétition
    const newCompetition = await prisma.competition.create({
      data: {
        numero: body.numero,
        intitule: body.intitule,
        type: body.type
      }
    });
    
    return NextResponse.json(newCompetition, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la compétition:", error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Contrainte d'unicité violée. Vérifiez le numéro de compétition." },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de la compétition" },
      { status: 500 }
    );
  }
}