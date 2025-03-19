import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Insertion des compétitions
  const competition1 = await prisma.competition.upsert({
    where: { numero: 'COMP2025-001' },
    update: {},
    create: {
      numero: 'COMP2025-001',
      intitule: 'Grand Prix Équestre de Paris',
      type: 'CSO',
    },
  })

  const competition2 = await prisma.competition.upsert({
    where: { numero: 'COMP2025-002' },
    update: {},
    create: {
      numero: 'COMP2025-002',
      intitule: 'Challenge National Junior',
      type: 'CSO',
    },
  })

  const competition3 = await prisma.competition.upsert({
    where: { numero: 'COMP2025-003' },
    update: {},
    create: {
      numero: 'COMP2025-003',
      intitule: 'Tournoi Régional Équifun',
      type: 'Equifun',
    },
  })

  // Insertion des épreuves
  const epreuve1 = await prisma.epreuve.create({
    data: {
      intitule: 'Épreuve Pro Elite Grand Prix',
      numero_ordre: 1,
      statut: 'A_venir',
      competition_id: competition1.id,
    },
  })

  const epreuve2 = await prisma.epreuve.create({
    data: {
      intitule: 'Épreuve Pro 1 Grand Prix',
      numero_ordre: 2,
      statut: 'A_venir',
      competition_id: competition1.id,
    },
  })

  const epreuve3 = await prisma.epreuve.create({
    data: {
      intitule: 'Épreuve Amateur Elite Grand Prix',
      numero_ordre: 3,
      statut: 'A_venir',
      competition_id: competition1.id,
    },
  })

  const epreuve4 = await prisma.epreuve.create({
    data: {
      intitule: 'Junior Individuel',
      numero_ordre: 1,
      statut: 'A_venir',
      competition_id: competition2.id,
    },
  })

  const epreuve5 = await prisma.epreuve.create({
    data: {
      intitule: 'Junior Équipe',
      numero_ordre: 2,
      statut: 'A_venir',
      competition_id: competition2.id,
    },
  })

  const epreuve6 = await prisma.epreuve.create({
    data: {
      intitule: 'Parcours Ludique Débutant',
      numero_ordre: 1,
      statut: 'A_venir',
      competition_id: competition3.id,
    },
  })

  const epreuve7 = await prisma.epreuve.create({
    data: {
      intitule: 'Parcours Ludique Confirmé',
      numero_ordre: 2,
      statut: 'A_venir',
      competition_id: competition3.id,
    },
  })

  // Insertion des couples cavalier/cheval
  const couple1 = await prisma.couple.upsert({
    where: { numero_licence: 'L12345' },
    update: {},
    create: {
      numero_licence: 'L12345',
      nom_cavalier: 'Dupont',
      prenom_cavalier: 'Sophie',
      coach: 'Martinez Jean',
      ecurie: 'Écurie du Soleil',
      numero_sire: 'S12345678',
      nom_cheval: 'Éclair Noir',
      numero_passage: 'P001',
      statut: 'Partant',
    },
  })

  const couple2 = await prisma.couple.upsert({
    where: { numero_licence: 'L12346' },
    update: {},
    create: {
      numero_licence: 'L12346',
      nom_cavalier: 'Martin',
      prenom_cavalier: 'Thomas',
      coach: 'Leblanc Marie',
      ecurie: 'Centre Équestre Les Pins',
      numero_sire: 'S12345679',
      nom_cheval: 'Tornado',
      numero_passage: 'P002',
      statut: 'Partant',
    },
  })

  const couple3 = await prisma.couple.upsert({
    where: { numero_licence: 'L12347' },
    update: {},
    create: {
      numero_licence: 'L12347',
      nom_cavalier: 'Leroux',
      prenom_cavalier: 'Émilie',
      coach: 'Dubois Pierre',
      ecurie: 'Haras du Val',
      numero_sire: 'S12345680',
      nom_cheval: 'Espoir',
      numero_passage: 'P003',
      statut: 'Partant',
    },
  })

  const couple4 = await prisma.couple.upsert({
    where: { numero_licence: 'L12348' },
    update: {},
    create: {
      numero_licence: 'L12348',
      nom_cavalier: 'Bernard',
      prenom_cavalier: 'Lucas',
      coach: 'Martinez Jean',
      ecurie: 'Écurie du Soleil',
      numero_sire: 'S12345681',
      nom_cheval: 'Ouragan',
      numero_passage: 'P004',
      statut: 'Partant',
    },
  })

  const couple5 = await prisma.couple.upsert({
    where: { numero_licence: 'L12349' },
    update: {},
    create: {
      numero_licence: 'L12349',
      nom_cavalier: 'Petit',
      prenom_cavalier: 'Julie',
      coach: 'Garcia Anna',
      ecurie: 'Centre Équestre du Bois',
      numero_sire: 'S12345682',
      nom_cheval: 'Tempête',
      numero_passage: 'P005',
      statut: 'Partant',
    },
  })

  const couple6 = await prisma.couple.upsert({
    where: { numero_licence: 'L12350' },
    update: {},
    create: {
      numero_licence: 'L12350',
      nom_cavalier: 'Leroy',
      prenom_cavalier: 'Antoine',
      coach: 'Dupuis Cécile',
      ecurie: 'Haras de la Vallée',
      numero_sire: 'S12345683',
      nom_cheval: 'Victoire',
      numero_passage: 'P006',
      statut: 'Partant',
    },
  })

  const couple7 = await prisma.couple.upsert({
    where: { numero_licence: 'L12351' },
    update: {},
    create: {
      numero_licence: 'L12351',
      nom_cavalier: 'Moreau',
      prenom_cavalier: 'Clara',
      coach: 'Leblanc Marie',
      ecurie: 'Centre Équestre Les Pins',
      numero_sire: 'S12345684',
      nom_cheval: 'Jupiter',
      numero_passage: 'P007',
      statut: 'Partant',
    },
  })

  const couple8 = await prisma.couple.upsert({
    where: { numero_licence: 'L12352' },
    update: {},
    create: {
      numero_licence: 'L12352',
      nom_cavalier: 'Girard',
      prenom_cavalier: 'Maxime',
      coach: 'Dubois Pierre',
      ecurie: 'Haras du Val',
      numero_sire: 'S12345685',
      nom_cheval: 'Étoile Filante',
      numero_passage: 'P008',
      statut: 'Partant',
    },
  })

  const couple9 = await prisma.couple.upsert({
    where: { numero_licence: 'L12353' },
    update: {},
    create: {
      numero_licence: 'L12353',
      nom_cavalier: 'Lefebvre',
      prenom_cavalier: 'Chloé',
      coach: 'Garcia Anna',
      ecurie: 'Centre Équestre du Bois',
      numero_sire: 'S12345686',
      nom_cheval: 'Comète',
      numero_passage: 'P009',
      statut: 'Partant',
    },
  })

  const couple10 = await prisma.couple.upsert({
    where: { numero_licence: 'L12354' },
    update: {},
    create: {
      numero_licence: 'L12354',
      nom_cavalier: 'Rousseau',
      prenom_cavalier: 'Hugo',
      coach: 'Dupuis Cécile',
      ecurie: 'Haras de la Vallée',
      numero_sire: 'S12345687',
      nom_cheval: 'Tonnerre',
      numero_passage: 'P010',
      statut: 'Partant',
    },
  })

  // Insertion des utilisateurs
  await prisma.utilisateur.upsert({
    where: { email: 'admin@competition.fr' },
    update: {},
    create: {
      nom: 'Admin',
      prenom: 'System',
      email: 'admin@competition.fr',
      mot_de_passe: 'motdepassehashé', // À remplacer par un hash réel en production
      type: 'administrateur',
    },
  })

  await prisma.utilisateur.upsert({
    where: { email: 'jury@competition.fr' },
    update: {},
    create: {
      nom: 'Jury',
      prenom: 'Principal',
      email: 'jury@competition.fr',
      mot_de_passe: 'motdepassehashé',
      type: 'jury',
    },
  })

  await prisma.utilisateur.upsert({
    where: { email: 'entree@competition.fr' },
    update: {},
    create: {
      nom: 'Piste',
      prenom: 'Entrée',
      email: 'entree@competition.fr',
      mot_de_passe: 'motdepassehashé',
      type: "entree_de_piste"
    },
  })

  await prisma.utilisateur.upsert({
    where: { email: 'lecteur@competition.fr' },
    update: {},
    create: {
      nom: 'Lecteur',
      prenom: 'Public',
      email: 'lecteur@competition.fr',
      mot_de_passe: 'motdepassehashé',
      type: 'lecteur',
    },
  })

  // Insertion des participations
  const participer1 = await prisma.participer.create({
    data: {
      epreuve_id: epreuve1.id,
      couple_id: couple1.id,
      numero_passage: 1,
      temps: 65.32,
      penalite: 4,
      temps_total: 69.32,
      classement: 2,
    },
  })

  const participer2 = await prisma.participer.create({
    data: {
      epreuve_id: epreuve1.id,
      couple_id: couple2.id,
      numero_passage: 2,
      temps: 63.45,
      penalite: 0,
      temps_total: 63.45,
      classement: 1,
    },
  })

  const participer3 = await prisma.participer.create({
    data: {
      epreuve_id: epreuve1.id,
      couple_id: couple3.id,
      numero_passage: 3,
      temps: 68.11,
      penalite: 8,
      temps_total: 76.11,
      classement: 3,
    },
  })

  await prisma.participer.create({
    data: {
      epreuve_id: epreuve2.id,
      couple_id: couple4.id,
      numero_passage: 1,
    },
  })

  await prisma.participer.create({
    data: {
      epreuve_id: epreuve2.id,
      couple_id: couple5.id,
      numero_passage: 2,
    },
  })

  await prisma.participer.create({
    data: {
      epreuve_id: epreuve2.id,
      couple_id: couple6.id,
      numero_passage: 3,
    },
  })

  await prisma.participer.create({
    data: {
      epreuve_id: epreuve3.id,
      couple_id: couple7.id,
      numero_passage: 1,
    },
  })

  await prisma.participer.create({
    data: {
      epreuve_id: epreuve3.id,
      couple_id: couple8.id,
      numero_passage: 2,
    },
  })

  await prisma.participer.create({
    data: {
      epreuve_id: epreuve4.id,
      couple_id: couple9.id,
      numero_passage: 1,
    },
  })

  await prisma.participer.create({
    data: {
      epreuve_id: epreuve4.id,
      couple_id: couple10.id,
      numero_passage: 2,
    },
  })

  console.log('Base de données initialisée avec succès')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })