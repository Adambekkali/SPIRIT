import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Reclasser les participants selon les règles CSO et Equifun
export async function POST(
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
        const epreuve = await prisma.epreuve.findUnique({
            where: { id },
            include: {
                participations: true
            }
        });

        if (!epreuve) {
            return NextResponse.json(
                { error: "Épreuve non trouvée" },
                { status: 404 }
            );
        }

        // Appliquer les règles de classement
        const updatedParticipations = epreuve.participations.map(participation => {
            let score = 0;

            // Exemple de règles CSO
            if (epreuve.type === 'CSO') {
                score = participation.fautes * 4 + participation.temps; // Fautes + temps
            }

            // Exemple de règles Equifun
            if (epreuve?.competition?.type === 'Equifun') {
                score = participation?.temps_total + participation?.penalite; // Bonus - pénalités
            }

            return {
                ...participation,
                score
            };
        });

        // Trier les participations par score (ordre croissant)
        updatedParticipations.sort((a, b) => a.score - b.score);

        // Mettre à jour les classements dans la base de données
        for (let i = 0; i < updatedParticipations.length; i++) {
            await prisma.participation.update({
                where: { id: updatedParticipations[i].id },
                data: { classement: i + 1 }
            });
        }

        return NextResponse.json(
            { message: "Classement mis à jour avec succès" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erreur lors du reclassement des participants:", error);
        return NextResponse.json(
            { error: "Une erreur est survenue lors du reclassement des participants" },
            { status: 500 }
        );
    }
}
