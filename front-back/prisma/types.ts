import {
  Competition as PrismaCompetition,
  Epreuve as PrismaEpreuve,
  Couple as PrismaCouple,
  Participer as PrismaParticiper,
  Utilisateur as PrismaUtilisateur,
  TypeCompetition,
  StatutEpreuve,
  StatutParticipation,
  TypeUtilisateur,
} from "@prisma/client";

// Types étendus avec relations optionnelles
export type Competition = PrismaCompetition & {
  epreuves?: Epreuve[];
};

export type Epreuve = PrismaEpreuve & {
  competition?: Competition;
  participations?: Participer[];
};

export type Couple = PrismaCouple & {
  participations?: Participer[];
};

export type Participer = PrismaParticiper & {
  epreuve?: Epreuve;
  couple?: Couple;
};

export type Utilisateur = PrismaUtilisateur;

// Ré-export des enums pour avoir tout au même endroit
export { TypeCompetition, StatutEpreuve, StatutParticipation, TypeUtilisateur };
