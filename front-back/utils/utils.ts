// Fonction pour récupérer les données de façon plus robuste
export async function fetchWithErrorHandling(url: string) {
    try {
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error(`Erreur de récupération depuis ${url}:`, error);
      throw error;
    }
  }