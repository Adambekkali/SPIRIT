import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer une compétition par ID
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
    
    const competition = await prisma.competition.findUnique({
      where: { id },
      include: {
        epreuves: {
          include: {
            participations: {
              include: {
                couple: true
              }
            }
          }
        }
      }
    });
    
    if (!competition) {
      return NextResponse.json(
        { error: "Compétition non trouvée" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(competition);
  } catch (error) {
    console.error("Erreur lors de la récupération de la compétition:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération de la compétition" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une compétition
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
    
    // Vérifier si la compétition existe
    const existingCompetition = await prisma.competition.findUnique({
      where: { id }
    });
    
    if (!existingCompetition) {
      return NextResponse.json(
        { error: "Compétition non trouvée" },
        { status: 404 }
      );
    }
    
    // Vérifier si le nouveau numéro est déjà utilisé par une autre compétition
    if (body.numero && body.numero !== existingCompetition.numero) {
      const numeroExists = await prisma.competition.findUnique({
        where: { numero: body.numero }
      });
      
      if (numeroExists) {
        return NextResponse.json(
          { error: "Ce numéro de compétition est déjà utilisé" },
          { status: 409 }
        );
      }
    }
    
    // Mettre à jour la compétition
    const updatedCompetition = await prisma.competition.update({
      where: { id },
      data: {
        numero: body.numero,
        intitule: body.intitule,
        type: body.type
      }
    });
    
    return NextResponse.json(updatedCompetition);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la compétition:", error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Contrainte d'unicité violée. Vérifiez le numéro de compétition." },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour de la compétition" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une compétition
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
    
    // Vérifier si la compétition existe
    const existingCompetition = await prisma.competition.findUnique({
      where: { id }
    });
    
    if (!existingCompetition) {
      return NextResponse.json(
        { error: "Compétition non trouvée" },
        { status: 404 }
      );
    }
    
    // Supprimer la compétition (et ses épreuves + participations grâce à la cascade)
    await prisma.competition.delete({
      where: { id }
    });
    
    return NextResponse.json(
      { message: "Compétition supprimée avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de la compétition:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la suppression de la compétition" },
      { status: 500 }
    );
  }
}