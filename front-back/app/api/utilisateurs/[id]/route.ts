import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// GET - Récupérer un utilisateur par ID
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
    
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        type: true,
        // Ne pas renvoyer le mot de passe, même hashé
        mot_de_passe: false
      }
    });
    
    if (!utilisateur) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(utilisateur);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération de l'utilisateur" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un utilisateur
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
    
    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.utilisateur.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }
    
    // Vérifier si le nouvel email est déjà utilisé par un autre utilisateur
    if (body.email && body.email !== existingUser.email) {
      const emailExists = await prisma.utilisateur.findUnique({
        where: { email: body.email }
      });
      
      if (emailExists) {
        return NextResponse.json(
          { error: "Cet email est déjà utilisé" },
          { status: 409 }
        );
      }
    }
    
    // Préparer les données à mettre à jour
    const updateData: any = {
      nom: body.nom,
      prenom: body.prenom,
      email: body.email,
      type: body.type
    };
    
    // Si un nouveau mot de passe est fourni, le hasher
    if (body.mot_de_passe) {
      updateData.mot_de_passe = await bcrypt.hash(body.mot_de_passe, 10);
    }
    
    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.utilisateur.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        type: true,
        // Ne pas renvoyer le mot de passe, même hashé
        mot_de_passe: false
      }
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Contrainte d'unicité violée. Vérifiez l'email." },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour de l'utilisateur" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un utilisateur
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
    
    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.utilisateur.findUnique({
      where: { id }
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }
    
    // Supprimer l'utilisateur
    await prisma.utilisateur.delete({
      where: { id }
    });
    
    return NextResponse.json(
      { message: "Utilisateur supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la suppression de l'utilisateur" },
      { status: 500 }
    );
  }
}