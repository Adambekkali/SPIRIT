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
