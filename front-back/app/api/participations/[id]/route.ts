import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer une participation par ID
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
    
    const participation = await prisma.participer.findUnique({
      where: { id },
      include: {
        epreuve: {
          include: {
            competition: true
          }
        },
        couple: true
      }
    });
    
    if (!participation) {
      return NextResponse.json(
        { error: "Participation non trouvée" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(participation);
  } catch (error) {
    console.error("Erreur lors de la récupération de la participation:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération de la participation" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une participation
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
    
    // Vérifier si la participation existe
    const existingParticipation = await prisma.participer.findUnique({
      where: { id }
    });
    
    if (!existingParticipation) {
      return NextResponse.json(
        { error: "Participation non trouvée" },
        { status: 404 }
      );
    }
    
    // Vérifier si le numéro de passage est modifié et déjà utilisé
    if (body.numero_passage !== undefined && 
        body.numero_passage !== existingParticipation.numero_passage) {
      const numeroPassageExists = await prisma.participer.findFirst({
        where: {
          epreuve_id: existingParticipation.epreuve_id,
          numero_passage: body.numero_passage,
          id: { not: id }
        }
      });
      
      if (numeroPassageExists) {
        return NextResponse.json(
          { error: "Ce numéro de passage est déjà utilisé dans cette épreuve" },
          { status: 409 }
        );
      }
    }
    
    // Mettre à jour la participation
    const updatedParticipation = await prisma.participer.update({
      where: { id },
      data: {
        numero_passage: body.numero_passage,
        temps: body.temps,
        penalite: body.penalite,
        temps_total: body.temps_total,
        classement: body.classement,
        statut: body.statut, // Update the statut field in Participer
      }
    });
    
    return NextResponse.json(updatedParticipation);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la participation:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour de la participation" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une participation
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
    
    // Vérifier si la participation existe
    const existingParticipation = await prisma.participer.findUnique({
      where: { id }
    });
    
    if (!existingParticipation) {
      return NextResponse.json(
        { error: "Participation non trouvée" },
        { status: 404 }
      );
    }
    
    // Supprimer la participation
    await prisma.participer.delete({
      where: { id }
    });
    
    return NextResponse.json(
      { message: "Participation supprimée avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de la participation:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la suppression de la participation" },
      { status: 500 }
    );
  }
}