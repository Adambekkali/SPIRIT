'use client';

import { useState, useEffect } from 'react';

// Types
interface Competition {
  id: number;
  numero: string;
  intitule: string;
  type: string;
}

interface Couple {
  id: number;
  nom_cavalier: string;
  prenom_cavalier: string;
  nom_cheval: string;
  statut: string;
}

interface Participation {
  id: number;
  epreuve_id: number;
  couple_id: number;
  numero_passage: number;
  temps: string | null;
  penalite: number | null;
  temps_total: string | null;
  classement: number | null;
  couple: Couple;
}

interface Epreuve {
  id: number;
  competition_id: number;
  intitule: string;
  numero_ordre: number;
  statut: string;
  competition: Competition;
  participations: Participation[];
}

interface ApiResponse {
  epreuves: Epreuve[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Définitions des statuts et leurs couleurs associées
const statutOptions = [
  { value: 'A_venir', label: 'À venir', color: '#9CA3AF' },
  { value: 'En_cours', label: 'En cours', color: '#3B82F6' },
  { value: 'Terminee', label: 'Terminée', color: '#10B981' },
  { value: 'Cloturee', label: 'Clôturée', color: '#8B5CF6' }
];

export default function StatutsPage() {
  const [epreuves, setEpreuves] = useState<Epreuve[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [competitionFilter, setCompetitionFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  
  // Notification
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });

  // Afficher une notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type, visible: true });
    // Masquer la notification après 3 secondes
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Charger les épreuves depuis l'API
  const loadEpreuves = async () => {
    try {
      setLoading(true);
      
      let url = `/api/epreuves?page=${pagination.page}&limit=${pagination.limit}`;
      
      // Ajout des filtres à l'URL si nécessaire
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      if (competitionFilter) {
        url += `&competition_id=${competitionFilter}`;
      }
      
      if (statutFilter) {
        url += `&statut=${statutFilter}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des épreuves');
      }
      
      const data = await response.json() as ApiResponse;
      
      setEpreuves(data.epreuves);
      setPagination(data.pagination);
      
      // Extraire les compétitions uniques des épreuves pour le filtre
      const uniqueCompetitions: Record<number, Competition> = {};
      data.epreuves.forEach(epreuve => {
        if (!uniqueCompetitions[epreuve.competition_id]) {
          uniqueCompetitions[epreuve.competition_id] = epreuve.competition;
        }
      });
      
      setCompetitions(Object.values(uniqueCompetitions));
      setError('');
    } catch (err) {
      setError('Impossible de charger les épreuves. Veuillez réessayer.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial des données
  useEffect(() => {
    loadEpreuves();
  }, []);

  // Rechargement lors des changements de pagination ou filtres
  useEffect(() => {
    loadEpreuves();
  }, [pagination.page, pagination.limit, searchTerm, competitionFilter, statutFilter]);

  // Mettre à jour le statut d'une épreuve
  const updateEpreuveStatut = async (epreuveId: number, newStatut: string) => {
    try {
      setUpdatingId(epreuveId);
      
      const epreuve = epreuves.find(e => e.id === epreuveId);
      if (!epreuve) return;
      
      // Pas besoin d'extraire le token, le cookie sera envoyé automatiquement
      const response = await fetch(`/api/epreuves/${epreuveId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ceci assure que les cookies sont envoyés avec la requête
        body: JSON.stringify({
          competition_id: epreuve.competition_id,
          intitule: epreuve.intitule,
          numero_ordre: epreuve.numero_ordre,
          statut: newStatut
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de la mise à jour du statut');
      }
  
      // Mise à jour locale
      setEpreuves(epreuves.map(e => 
        e.id === epreuveId ? { ...e, statut: newStatut } : e
      ));
  
      showNotification("Statut mis à jour avec succès", "success");
    } catch (err) {
      console.error(err);
      showNotification(err instanceof Error ? err.message : "Erreur lors de la mise à jour du statut", "error");
    } finally {
      setUpdatingId(null);
    }
  };
  // Obtenir la couleur du badge pour un statut
  const getStatutBadgeColor = (statut: string) => {
    const option = statutOptions.find(opt => opt.value === statut);
    return option?.color || '#9CA3AF';
  };

  // Obtenir le libellé du statut
  const getStatutLabel = (statut: string) => {
    const option = statutOptions.find(opt => opt.value === statut);
    return option?.label || statut;
  };

  // Compter les participants d'une épreuve
  const getParticipantsCount = (epreuve: Epreuve) => {
    return epreuve.participations ? epreuve.participations.length : 0;
  };

  // Générer les liens de pagination
  const renderPaginationLinks = () => {
    const links = [];
    const maxVisible = 5; // Maximum de liens visibles
    
    let startPage = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
    let endPage = Math.min(pagination.pages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      links.push(
        <button 
          key={i}
          className={`px-3 py-1 mx-1 rounded ${pagination.page === i ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setPagination({ ...pagination, page: i })}
        >
          {i}
        </button>
      );
    }
    
    return links;
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Gestion des Statuts des Épreuves</h1>
      
      {/* Notification */}
      {notification.visible && (
        <div 
          className={`fixed top-4 right-4 p-4 rounded shadow-lg ${
            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}
      
      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Section filtres */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filtres</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recherche par intitulé */}
          <div className="relative">
            <div className="flex">
              <input
                type="text"
                placeholder="Rechercher une épreuve..."
                className="w-full p-2 border rounded"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadEpreuves()}
              />
              <button 
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={loadEpreuves}
              >
                Rechercher
              </button>
            </div>
          </div>
          
          {/* Filtre par compétition */}
          <select 
            className="w-full p-2 border rounded"
            value={competitionFilter}
            onChange={(e) => setCompetitionFilter(e.target.value)}
          >
            <option value="">Toutes les compétitions</option>
            {competitions.map((competition) => (
              <option key={competition.id} value={competition.id.toString()}>
                {competition.intitule} ({competition.type})
              </option>
            ))}
          </select>
          
          {/* Filtre par statut */}
          <select 
            className="w-full p-2 border rounded"
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            {statutOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Tableau des épreuves */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Liste des Épreuves</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">ID</th>
                <th className="border p-2 text-left">Compétition</th>
                <th className="border p-2 text-left">Intitulé</th>
                <th className="border p-2 text-left">Ordre</th>
                <th className="border p-2 text-left">Participants</th>
                <th className="border p-2 text-left">Statut</th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center border p-4">
                    Chargement des épreuves...
                  </td>
                </tr>
              ) : epreuves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center border p-4">
                    Aucune épreuve trouvée
                  </td>
                </tr>
              ) : (
                epreuves.map((epreuve) => (
                  <tr key={epreuve.id} className="hover:bg-gray-50">
                    <td className="border p-2">{epreuve.id}</td>
                    <td className="border p-2">
                      <div>
                        <div className="font-medium">{epreuve.competition.intitule}</div>
                        <div className="text-sm text-gray-500">{epreuve.competition.numero}</div>
                      </div>
                    </td>
                    <td className="border p-2">{epreuve.intitule}</td>
                    <td className="border p-2 text-center">{epreuve.numero_ordre}</td>
                    <td className="border p-2 text-center">{getParticipantsCount(epreuve)}</td>
                    <td className="border p-2">
                      <span 
                        className="px-2 py-1 rounded text-white text-sm" 
                        style={{ backgroundColor: getStatutBadgeColor(epreuve.statut) }}
                      >
                        {getStatutLabel(epreuve.statut)}
                      </span>
                    </td>
                    <td className="border p-2">
                      <select
                        className="p-1 border rounded w-full max-w-[180px]"
                        value={epreuve.statut}
                        onChange={(e) => updateEpreuveStatut(epreuve.id, e.target.value)}
                        disabled={updatingId === epreuve.id}
                      >
                        <option value="" disabled>Changer le statut</option>
                        {statutOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-4 flex justify-center">
            <button
              className="px-3 py-1 mx-1 rounded bg-gray-200 disabled:opacity-50"
              onClick={() => pagination.page > 1 && setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page <= 1}
            >
              Précédent
            </button>
            
            {renderPaginationLinks()}
            
            <button
              className="px-3 py-1 mx-1 rounded bg-gray-200 disabled:opacity-50"
              onClick={() => pagination.page < pagination.pages && setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page >= pagination.pages}
            >
              Suivant
            </button>
          </div>
        )}
      </div>

      {/* Légende des statuts */}
      <div className="bg-white shadow-md rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Légende des statuts</h2>
        <div className="flex flex-wrap gap-4">
          {statutOptions.map(option => (
            <div key={option.value} className="flex items-center">
              <span 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ backgroundColor: option.color }}
              ></span>
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}