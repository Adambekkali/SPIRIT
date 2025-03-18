// prisma.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); // Créer l'instance du client Prisma

export default prisma; // Exporter l'instance pour l'utiliser ailleurs
