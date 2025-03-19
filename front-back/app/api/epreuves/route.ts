import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer toutes les épreuves
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Paramètres optionnels de filtrage et pagination
    const search = searchParams.get('search') || '';
    const competitionId = searchParams.get('competition_id') || '';
    const statut = searchParams.get('statut') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Construction de la requête de filtrage
    const where: any = {};
    
    if (search) {
      where.intitule = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    if (competitionId) {
      where.competition_id = parseInt(competitionId);
    }
    
    if (statut) {
      where.statut = statut;
    }
    
    // Récupérer les épreuves avec pagination
    const epreuves = await prisma.epreuve.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { competition_id: 'asc' },
        { numero_ordre: 'asc' }
      ],
      include: {
        competition: true,
        participations: {
          include: {
            couple: true
          }
        }
      }
    });
    
    // Compter le nombre total pour la pagination
    const total = await prisma.epreuve.count({ where });
    
    return NextResponse.json({
      epreuves,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des épreuves:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des épreuves" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle épreuve
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    if (!body.competition_id || !body.intitule || body.numero_ordre === undefined) {
      return NextResponse.json(
        { error: "Tous les champs sont obligatoires" },
        { status: 400 }
      );
    }
    
    // Vérifier si la compétition existe
    const competitionExists = await prisma.competition.findUnique({
      where: { id: body.competition_id }
    });
    
    if (!competitionExists) {
      return NextResponse.json(
        { error: "La compétition spécifiée n'existe pas" },
        { status: 404 }
      );
    }
    
    // Création de l'épreuve
    const newEpreuve = await prisma.epreuve.create({
      data: {
        competition_id: body.competition_id,
        intitule: body.intitule,
        numero_ordre: body.numero_ordre,
        statut: body.statut || 'A_venir'
      }
    });
    
    return NextResponse.json(newEpreuve, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'épreuve:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de l'épreuve" },
      { status: 500 }
    );
  }
}