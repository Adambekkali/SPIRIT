import '@testing-library/jest-dom';

// Étendre l'objet global pour inclure les types de Jest
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      // Ajoutez d'autres matchers personnalisés si nécessaire
    }
  }
}

export {};