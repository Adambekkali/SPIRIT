// @/app/profil/__tests__/page.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Définition des types pour le typage TypeScript
// Ces interfaces permettent de typer correctement les mocks
interface User {
  nom?: string;
  prenom?: string;
  email?: string;
  type?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

// Importation du composant à tester
import ProfilPage from '../page';

// Configuration des mocks pour les dépendances externes
// Mock pour le hook useRouter de Next.js
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock pour le hook useAuth de notre application
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock pour le composant Link de Next.js
// Ceci permet de simplifier le rendu des liens dans les tests
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Suite de tests pour le composant ProfilPage
describe('ProfilPage', () => {
  // Création des fonctions mock qui simuleront le comportement réel
  const mockLogout = jest.fn().mockResolvedValue(undefined);
  const mockLogin = jest.fn().mockResolvedValue({});
  
  // Hook exécuté avant chaque test pour réinitialiser l'état des mocks
  // Cela évite que les appels entre les tests ne s'accumulent
  beforeEach(() => {
    jest.clearAllMocks();
    // Configuration du mock de useRouter pour chaque test
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
  });

  // TEST 1: Vérification de l'état de chargement
  test('affiche un écran de chargement quand isLoading est true', () => {
    // Configuration du mock useAuth pour simuler un état de chargement
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      login: mockLogin,
      logout: mockLogout,
      isLoading: true, // L'application est en train de charger
    } as AuthContextType);

    // Rendu du composant avec les mocks configurés
    render(<ProfilPage />);
    // Vérification que le message de chargement est présent
    expect(screen.getByText('Chargement des données...')).toBeInTheDocument();
  });

  // TEST 2: Vérification quand l'utilisateur n'est pas connecté
  test('retourne null quand l\'utilisateur n\'est pas connecté', () => {
    // Configuration du mock useAuth pour simuler un utilisateur non connecté
    (useAuth as jest.Mock).mockReturnValue({
      user: null, // Pas d'utilisateur connecté
      login: mockLogin,
      logout: mockLogout,
      isLoading: false, // Le chargement est terminé
    } as AuthContextType);

    // Rendu du composant
    const { container } = render(<ProfilPage />);
    // Vérification que le composant ne rend rien (retourne null)
    expect(container.firstChild).toBeNull();
  });

  // TEST 3: Vérification de l'affichage du profil utilisateur
  test('affiche les informations du profil utilisateur', () => {
    // Création d'un utilisateur de test
    const mockUser = {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean@example.com',
      type: 'utilisateur'
    };

    // Configuration du mock useAuth pour simuler un utilisateur connecté
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser, // Utilisateur connecté avec des données
      login: mockLogin,
      logout: mockLogout,
      isLoading: false,
    } as AuthContextType);

    // Rendu du composant
    render(<ProfilPage />);
    
    // Vérification que le titre est affiché
    expect(screen.getByText('Mon Profil')).toBeInTheDocument();
    // Vérification que les initiales sont correctement calculées et affichées
    expect(screen.getByText('JD')).toBeInTheDocument();
    // Vérification que les informations de l'utilisateur sont affichées
    expect(screen.getByText('Dupont')).toBeInTheDocument();
    expect(screen.getByText('Jean')).toBeInTheDocument();
    expect(screen.getByText('jean@example.com')).toBeInTheDocument();
    
    // Simulation d'un clic sur le bouton de déconnexion
    fireEvent.click(screen.getByText('Déconnexion'));
    // Vérification que la fonction logout a bien été appelée
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

});