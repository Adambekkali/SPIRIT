// app/api/couples/routes.ts

import { NextResponse } from 'next/server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Route GET pour lister tous les couples
export async function GET() {
  try {
    const couples = await prisma.couple.findMany({
      include: {
        cheval: true,
        cavalier: true
      }
    });

    return NextResponse.json(couples, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des couples.' }, { status: 500 });
  }
}

// Route POST pour créer un nouveau couple
export async function POST(req: Request) {
  const { cheval_id, cavalier_id, coach_nom, ecurie } = await req.json();

  try {
    const couple = await prisma.couple.create({
      data: {
        cheval_id,
        cavalier_id,
        coach_nom,
        ecurie
      }
    });

    return NextResponse.json(couple, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création du couple.' }, { status: 500 });
  }
}

// Route GET pour obtenir un couple par son ID
export async function GET_BY_ID(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: 'ID manquant.' }, { status: 400 });
  }

  try {
    const couple = await prisma.couple.findUnique({
      where: { id: parseInt(id) },
      include: {
        cheval: true,
        cavalier: true
      }
    });

    if (!couple) {
      return NextResponse.json({ error: 'Couple non trouvé.' }, { status: 404 });
    }

    return NextResponse.json(couple, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération du couple.' }, { status: 500 });
  }
}

// Route PUT pour mettre à jour un couple
export async function PUT(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();
  const { cheval_id, cavalier_id, coach_nom, ecurie } = await req.json();

  if (!id) {
    return NextResponse.json({ error: 'ID manquant.' }, { status: 400 });
  }

  try {
    const couple = await prisma.couple.update({
      where: { id: parseInt(id) },
      data: {
        cheval_id,
        cavalier_id,
        coach_nom,
        ecurie
      }
    });

    return NextResponse.json(couple, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du couple.' }, { status: 500 });
  }
}

// Route DELETE pour supprimer un couple
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: 'ID manquant.' }, { status: 400 });
  }

  try {
    await prisma.couple.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'Couple supprimé avec succès.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression du couple.' }, { status: 500 });
  }
}
