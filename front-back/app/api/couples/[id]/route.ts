import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer un couple par ID
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
    
    const couple = await prisma.couple.findUnique({
      where: { id },
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

// PUT - Mettre à jour un couple
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
    
    // Vérifier si le couple existe
    const existingCouple = await prisma.couple.findUnique({
      where: { id }
    });
    
    if (!existingCouple) {
      return NextResponse.json(
        { error: "Couple non trouvé" },
        { status: 404 }
      );
    }
    
    // Vérifier si le nouveau numéro de licence est déjà utilisé par un autre couple
    if (body.numero_licence && body.numero_licence !== existingCouple.numero_licence) {
      const licenceExists = await prisma.couple.findUnique({
        where: { numero_licence: body.numero_licence }
      });
      
      if (licenceExists) {
        return NextResponse.json(
          { error: "Ce numéro de licence est déjà utilisé" },
          { status: 409 }
        );
      }
    }
    
    // Vérifier si le nouveau numéro SIRE est déjà utilisé par un autre couple
    if (body.numero_sire && body.numero_sire !== existingCouple.numero_sire) {
      const sireExists = await prisma.couple.findUnique({
        where: { numero_sire: body.numero_sire }
      });
      
      if (sireExists) {
        return NextResponse.json(
          { error: "Ce numéro SIRE est déjà utilisé" },
          { status: 409 }
        );
      }
    }
    
    // Mettre à jour le couple
    const updatedCouple = await prisma.couple.update({
      where: { id },
      data: {
        numero_licence: body.numero_licence,
        nom_cavalier: body.nom_cavalier,
        prenom_cavalier: body.prenom_cavalier,
        coach: body.coach,
        ecurie: body.ecurie,
        numero_sire: body.numero_sire,
        nom_cheval: body.nom_cheval,
        numero_passage: body.numero_passage,
        statut: body.statut
      }
    });
    
    return NextResponse.json(updatedCouple);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du couple:", error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Contrainte d'unicité violée. Vérifiez le numéro de licence ou le numéro SIRE." },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour du couple" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un couple
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
    
    // Vérifier si le couple existe
    const existingCouple = await prisma.couple.findUnique({
      where: { id }
    });
    
    if (!existingCouple) {
      return NextResponse.json(
        { error: "Couple non trouvé" },
        { status: 404 }
      );
    }
    
    // Supprimer le couple (et ses participations grâce à la cascade)
    await prisma.couple.delete({
      where: { id }
    });
    
    return NextResponse.json(
      { message: "Couple supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression du couple:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la suppression du couple" },
      { status: 500 }
    );
  }
}