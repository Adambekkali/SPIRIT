import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { HttpException, HttpStatus } from '@nestjs/common';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    const epreuveId = id ? Number(id) : NaN;
    if (isNaN(epreuveId)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 500 });
    }

    // Récupérer l'épreuve et son type
    const epreuve = await prisma.epreuve.findUnique({
      where: { id: epreuveId },
      include: { competition: true },
    });

    if (!epreuve) {
      return NextResponse.json({ error: "Épreuve non trouvée" }, { status: 404 });
    }

    // Récupérer les participants avec les champs nécessaires
    const participants = await prisma.participer.findMany({
      where: { epreuve_id: epreuveId },
      select: { 
        id: true, 
        penalite: true,  
        temps: true, 
        temps_total: true 
      }
    });

    if (participants.length === 0) {
      return NextResponse.json({ message: "Aucun participant à classer" }, { status: 200 });
    }

    // Trier selon le type d'épreuve
    if (epreuve.competition.type === 'CSO') {
      participants.sort((a, b) => 
        (a.penalite ?? 0) - (b.penalite ?? 0) || 
        (Number(a.temps) ?? 0) - (Number(b.temps) ?? 0)
      );
    } else if (epreuve.competition.type === 'Equifun') {
      participants.sort((a, b) => (Number(a.temps_total) || 0) - (Number(b.temps_total) || 0));
    } else {
      return NextResponse.json({ error: "Type d'épreuve non reconnu" }, { status: 400 });
    }

    // Mettre à jour le classement
    for (let i = 0; i < participants.length; i++) {
      await prisma.participer.update({
        where: { id: participants[i].id },
        data: { classement: i + 1 },
      });
    }

    return NextResponse.json({ message: "Classement mis à jour avec succès", classement: participants }, { status: 200 });

  } catch (error) {
    console.error("Erreur lors du recalcul du classement:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
