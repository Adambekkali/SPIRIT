import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer tous les couples
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Paramètres optionnels de filtrage et pagination
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Construction de la requête de filtrage
    const where = search 
      ? {
          OR: [
            { numero_licence: { contains: search, mode: 'insensitive' } },
            { nom_cavalier: { contains: search, mode: 'insensitive' } },
            { prenom_cavalier: { contains: search, mode: 'insensitive' } },
            { nom_cheval: { contains: search, mode: 'insensitive' } },
            { ecurie: { contains: search, mode: 'insensitive' } },
          ],
        } 
      : {};
    
    // Récupérer les couples avec pagination
    const couples = await prisma.couple.findMany({
      where:{},
      skip,
      take: limit,
      orderBy: { nom_cavalier: 'asc' },
      include: {
        participations: {
          include: {
            epreuve: {
              include: {
                competition: true
              }
            }
          }
        }
      }
    });
    
    // Compter le nombre total pour la pagination
    const total = await prisma.couple.count({ where:{} });
    
    return NextResponse.json({
      couples,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des couples:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des couples" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau couple
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    if (!body.numero_licence || !body.nom_cavalier || !body.prenom_cavalier || 
        !body.coach || !body.ecurie || !body.numero_sire || !body.nom_cheval || !body.numero_passage) {
      return NextResponse.json(
        { error: "Tous les champs sont obligatoires" },
        { status: 400 }
      );
    }
    
    // Vérification de l'unicité du numéro de licence
    const existingCouple = await prisma.couple.findUnique({
      where: { numero_licence: body.numero_licence }
    });
    
    if (existingCouple) {
      return NextResponse.json(
        { error: "Un couple avec ce numéro de licence existe déjà" },
        { status: 409 }
      );
    }
    
    // Création du couple
    const newCouple = await prisma.couple.create({
      data: {
        numero_licence: body.numero_licence,
        nom_cavalier: body.nom_cavalier,
        prenom_cavalier: body.prenom_cavalier,
        coach: body.coach,
        ecurie: body.ecurie,
        numero_sire: body.numero_sire,
        nom_cheval: body.nom_cheval,
        numero_passage: body.numero_passage,
        statut: body.statut || 'Partant'
      }
    });
    
    return NextResponse.json(newCouple, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du couple:", error);
    
    // Gestion des erreurs spécifiques
    if (error === 'P2002') {
      return NextResponse.json(
        { error: "Contrainte d'unicité violée. Vérifiez le numéro de licence ou le numéro SIRE." },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création du couple" },
      { status: 500 }
    );
  }
}