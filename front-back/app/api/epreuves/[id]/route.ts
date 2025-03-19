import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer une épreuve par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID invalide" },
        { status: 400 }
      );
    }
    
    const epreuve = await prisma.epreuve.findUnique({
      where: { id },
      include: {
        competition: true,
        participations: {
          include: {
            couple: true
          },
          orderBy: {
            classement: 'asc'
          }
        }
      }
    });
    
    if (!epreuve) {
      return NextResponse.json(
        { error: "Épreuve non trouvée" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(epreuve);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'épreuve:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération de l'épreuve" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une épreuve
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID invalide" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Vérifier si l'épreuve existe
    const existingEpreuve = await prisma.epreuve.findUnique({
      where: { id }
    });
    
    if (!existingEpreuve) {
      return NextResponse.json(
        { error: "Épreuve non trouvée" },
        { status: 404 }
      );
    }
    
    // Si la compétition est modifiée, vérifier qu'elle existe
    if (body.competition_id && body.competition_id !== existingEpreuve.competition_id) {
      const competitionExists = await prisma.competition.findUnique({
        where: { id: body.competition_id }
      });
      
      if (!competitionExists) {
        return NextResponse.json(
          { error: "La compétition spécifiée n'existe pas" },
          { status: 404 }
        );
      }
    }
    
    // Mettre à jour l'épreuve
    const updatedEpreuve = await prisma.epreuve.update({
      where: { id },
      data: {
        competition_id: body.competition_id,
        intitule: body.intitule,
        numero_ordre: body.numero_ordre,
        statut: body.statut
      }
    });
    
    return NextResponse.json(updatedEpreuve);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'épreuve:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour de l'épreuve" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une épreuve
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "ID invalide" },
        { status: 400 }
      );
    }
    
    // Vérifier si l'épreuve existe
    const existingEpreuve = await prisma.epreuve.findUnique({
      where: { id }
    });
    
    if (!existingEpreuve) {
      return NextResponse.json(
        { error: "Épreuve non trouvée" },
        { status: 404 }
      );
    }
    
    // Supprimer l'épreuve (et ses participations grâce à la cascade)
    await prisma.epreuve.delete({
      where: { id }
    });
    
    return NextResponse.json(
      { message: "Épreuve supprimée avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de l'épreuve:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la suppression de l'épreuve" },
      { status: 500 }
    );
  }
}