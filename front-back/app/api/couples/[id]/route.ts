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
    const statutOptions = ["Partant", "En piste", "En bord de piste", "Non Partant", "Fini", "Éliminé"];

    if (!body.statut || !statutOptions.includes(body.statut)) {
      return NextResponse.json({ error: "Le champ statut est obligatoire et doit être une valeur valide" }, { status: 400 });
    }

    const updatedCouple = await prisma.couple.update({
      where: { id },
      data: { statut: body.statut },
    });

    return NextResponse.json(updatedCouple);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut du couple:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour du statut du couple" },
      { status: 500 }
    );
  }
}
