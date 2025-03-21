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
            epreuve: true,
          },
        },
      },
    });

    // Retourner les couples sous forme de réponse JSON
    return NextResponse.json(couples, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des couples:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des couples." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}


// Route POST pour créer un nouveau couple
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    const requiredFields = [
      "numero_licence",
      "nom_cavalier",
      "prenom_cavalier",
      "nom_cheval",
      "coach",
      "ecurie",
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Le champ ${field} est obligatoire.` },
          { status: 400 }
        );
      }
    }

    // Check if the license number is unique
    const existingCouple = await prisma.couple.findUnique({
      where: { numero_licence: body.numero_licence },
    });
    if (existingCouple) {
      return NextResponse.json(
        { error: "Un couple avec ce numéro de licence existe déjà." },
        { status: 409 }
      );
    }

    // Create the couple
    const couple = await prisma.couple.create({
      data: {
        numero_licence: body.numero_licence,
        nom_cavalier: body.nom_cavalier,
        prenom_cavalier: body.prenom_cavalier,
        nom_cheval: body.nom_cheval,
        coach: body.coach,
        ecurie: body.ecurie,
        numero_sire: body.numero_sire || null, // Optional field
        numero_passage: body.numero_passage || null, // Optional field
      },
    });

    return NextResponse.json(couple, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du couple:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue lors de la création du couple." },
      { status: 500 }
    );
  }
}