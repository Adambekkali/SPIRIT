// app/api/couples/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Route GET pour lister tous les couples
export async function GET() {
  try {
    const couples = await prisma.couple.findMany({
      include: {
        participations: {
          include: {
            epreuve: true
          }
        }
      }
    });

    return NextResponse.json(couples, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des couples:", error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des couples.' }, { status: 500 });
  }
}

// Route POST pour créer un nouveau couple
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validation des données requises
    if (!body.numero_licence || !body.nom_cavalier || !body.prenom_cavalier || 
        !body.coach || !body.ecurie || !body.numero_sire || !body.nom_cheval || !body.numero_passage) {
      return NextResponse.json(
        { error: "Tous les champs sont obligatoires" },
        { status: 400 }
      );
    }
    
    const couple = await prisma.couple.create({
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

    return NextResponse.json(couple, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du couple:", error);
    return NextResponse.json({ error: 'Erreur lors de la création du couple.' }, { status: 500 });
  }
}