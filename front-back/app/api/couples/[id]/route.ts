import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Vérifier si l'ID est fourni et valide
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "L'ID est requis et doit être un nombre valide" },
        { status: 400 }
      );
    }

    // Récupérer le couple correspondant à l'ID
    const couple = await prisma.couple.findUnique({
      where: { id: Number(id) },
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

    // Vérifier si le couple existe
    if (!couple) {
      return NextResponse.json(
        { error: "Couple non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(couple);
  } catch (error) {
    console.error("Erreur lors de la récupération du couple:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération du couple" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    const body = await request.json();

    // Vérifier si le couple existe
    const existingCouple = await prisma.couple.findUnique({
      where: { id },
    });

    if (!existingCouple) {
      return NextResponse.json({ error: "Couple non trouvé" }, { status: 404 });
    }

    // Mettre à jour les informations du couple (sans statut)
    const updatedCouple = await prisma.couple.update({
      where: { id },
      data: {
        nom_cavalier: body.nom_cavalier,
        prenom_cavalier: body.prenom_cavalier,
        nom_cheval: body.nom_cheval,
        coach: body.coach,
        ecurie: body.ecurie,
        numero_sire: body.numero_sire,
        numero_passage: body.numero_passage,
      },
    });

    return NextResponse.json(updatedCouple);
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour du couple:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Couple non trouvé ou déjà supprimé" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour du couple" },
      { status: 500 }
    );
  }
}
