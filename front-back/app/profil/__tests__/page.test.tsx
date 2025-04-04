// @/app/profil/__tests__/page.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Importez ou créez le type pour AuthContextType
// Si vous ne pouvez pas l'importer directement, créez-le ici :
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
  // Ajoutez d'autres propriétés si nécessaires dans votre contexte réel
}

import ProfilPage from '../page';

// Mocks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe('ProfilPage', () => {
  const mockLogout = jest.fn().mockResolvedValue(undefined);
  const mockLogin = jest.fn().mockResolvedValue({});
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
  });

  test('affiche un écran de chargement quand isLoading est true', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      login: mockLogin, // Ajoutez cette propriété manquante
      logout: mockLogout,
      isLoading: true,
    } as AuthContextType);

    render(<ProfilPage />);
    expect(screen.getByText('Chargement des données...')).toBeInTheDocument();
  });

  test('retourne null quand l\'utilisateur n\'est pas connecté', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      login: mockLogin, // Ajoutez cette propriété manquante
      logout: mockLogout,
      isLoading: false,
    } as AuthContextType);

    const { container } = render(<ProfilPage />);
    expect(container.firstChild).toBeNull();
  });

  test('affiche les informations du profil utilisateur', () => {
    const mockUser = {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean@example.com',
      type: 'utilisateur'
    };

    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      login: mockLogin, // Ajoutez cette propriété manquante
      logout: mockLogout,
      isLoading: false,
    } as AuthContextType);

    render(<ProfilPage />);
    
    expect(screen.getByText('Mon Profil')).toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByText('Dupont')).toBeInTheDocument();
    expect(screen.getByText('Jean')).toBeInTheDocument();
    expect(screen.getByText('jean@example.com')).toBeInTheDocument();
    
    // Test du bouton déconnexion
    fireEvent.click(screen.getByText('Déconnexion'));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});