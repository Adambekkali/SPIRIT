import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer toutes les participations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Paramètres optionnels de filtrage et pagination
    const epreuveId = searchParams.get('epreuve_id') || '';
    const coupleId = searchParams.get('couple_id') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    
    // Construction de la requête de filtrage
    const where: any = {};
    
    if (epreuveId) {
      where.epreuve_id = parseInt(epreuveId);
    }
    
    if (coupleId) {
      where.couple_id = parseInt(coupleId);
    }
    
    // Récupérer les participations avec pagination
    const participations = await prisma.participer.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { epreuve_id: 'asc' },
        { numero_passage: 'asc' }
      ],
      include: {
        epreuve: {
          include: {
            competition: true
          }
        },
        couple: true
      }
    });
    
    // Compter le nombre total pour la pagination
    const total = await prisma.participer.count({ where });
    
    return NextResponse.json({
      participations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des participations:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des participations" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle participation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    if (!body.epreuve_id || !body.couple_id || body.numero_passage === undefined) {
      return NextResponse.json(
        { error: "Les champs epreuve_id, couple_id et numero_passage sont obligatoires" },
        { status: 400 }
      );
    }
    
    // Vérifier si l'épreuve existe
    const epreuveExists = await prisma.epreuve.findUnique({
      where: { id: body.epreuve_id }
    });
    
    if (!epreuveExists) {
      return NextResponse.json(
        { error: "L'épreuve spécifiée n'existe pas" },
        { status: 404 }
      );
    }
    
    // Vérifier si le couple existe
    const coupleExists = await prisma.couple.findUnique({
      where: { id: body.couple_id }
    });
    
    if (!coupleExists) {
      return NextResponse.json(
        { error: "Le couple spécifié n'existe pas" },
        { status: 404 }
      );
    }
    
    // Vérifier si une participation existe déjà pour ce couple et cette épreuve
    const existingParticipation = await prisma.participer.findFirst({
      where: {
        epreuve_id: body.epreuve_id,
        couple_id: body.couple_id
      }
    });
    
    if (existingParticipation) {
      return NextResponse.json(
        { error: "Ce couple participe déjà à cette épreuve" },
        { status: 409 }
      );
    }
    
    // Vérifier si le numéro de passage est déjà utilisé dans cette épreuve
    const numeroPassageExists = await prisma.participer.findFirst({
      where: {
        epreuve_id: body.epreuve_id,
        numero_passage: body.numero_passage
      }
    });
    
    if (numeroPassageExists) {
      return NextResponse.json(
        { error: "Ce numéro de passage est déjà utilisé dans cette épreuve" },
        { status: 409 }
      );
    }
    
    // Création de la participation
    const newParticipation = await prisma.participer.create({
      data: {
        epreuve_id: body.epreuve_id,
        couple_id: body.couple_id,
        numero_passage: body.numero_passage,
        statut: body.statut || 'Partant', // Include statut field
        temps: body.temps || null,
        penalite: body.penalite || null,
        temps_total: body.temps_total || null,
        classement: body.classement || null
      }
    });
    
    return NextResponse.json(newParticipation, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la participation:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de la participation" },
      { status: 500 }
    );
  }
}