"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext"; // Import the AuthContext

// Types pour améliorer la sécurité et l'autocomplétion
interface Competition {
    id: number;
    intitule: string;
    type: string;
}

interface Participer {
    id: number;
    epreuve_id: number;
    equipe_id: number;
    resultat: string;
}

interface Epreuve {
    id: number;
    intitule: string;
    statut: string;
    competition: Competition;
    participations: Participer[];
    competition_id?: number;
    numero_ordre?: number;
}

// Fonction pour récupérer toutes les épreuves sans filtre
const getEpreuves = async () => {
    const res = await fetch(`http://localhost:3000/api/epreuves`);
    const data = await res.json();
    return data.epreuves;
};

// Fonction pour récupérer toutes les compétitions pour le filtre
const getCompetitions = async () => {
    const res = await fetch(`http://localhost:3000/api/competitions`);
    const data = await res.json();
    return data.competitions;
};

const Epreuves = () => {
    const { user } = useAuth(); // Get the user from the AuthContext
    const [allEpreuves, setAllEpreuves] = useState<Epreuve[]>([]);
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // États pour la modal et la mise à jour des statuts
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [selectedEpreuve, setSelectedEpreuve] = useState<Epreuve | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [notification, setNotification] = useState({ message: '', type: '', visible: false });
    
    // États pour la pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Récupérer les paramètres d'URL
    const searchParams = useSearchParams();
    const competitionId = searchParams.get('competitionId');
    const router = useRouter();

    // Récupérer toutes les données une seule fois
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                // Récupérer les compétitions pour le filtre
                const compsData = await getCompetitions();
                setCompetitions(compsData);
                
                // Récupérer toutes les épreuves sans filtre
                const data = await getEpreuves();
                setAllEpreuves(data);
            } catch (err) {
                console.error("Erreur:", err);
                setError("Erreur lors du chargement des épreuves.");
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    // Afficher une notification
    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type, visible: true });
        // Masquer la notification après 3 secondes
        setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
        }, 3000);
    };

    // Ouvrir la modal de statut
    const openStatusModal = (epreuve: Epreuve, e: React.MouseEvent) => {
        e.stopPropagation(); // Empêcher la navigation vers la page de détail
        setSelectedEpreuve(epreuve);
        setStatusModalOpen(true);
    };

    // Fermer la modal de statut
    const closeStatusModal = () => {
        setStatusModalOpen(false);
        setSelectedEpreuve(null);
    };

    // Mettre à jour le statut d'une épreuve
    const updateEpreuveStatut = async (epreuveId: number, newStatut: string) => {
        try {
            setUpdatingId(epreuveId);
            
            const epreuve = allEpreuves.find(e => e.id === epreuveId);
            if (!epreuve) return;
            
            const response = await fetch(`/api/epreuves/${epreuveId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Ceci assure que les cookies sont envoyés avec la requête
                body: JSON.stringify({
                    competition_id: epreuve.competition_id || epreuve.competition.id,
                    intitule: epreuve.intitule,
                    numero_ordre: epreuve.numero_ordre || 1, // Valeur par défaut si non disponible
                    statut: newStatut
                }),
            });
        
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Erreur lors de la mise à jour du statut');
            }
        
            // Mise à jour locale de l'état
            setAllEpreuves(allEpreuves.map(e => 
                e.id === epreuveId ? { ...e, statut: newStatut } : e
            ));
        
            showNotification("Statut mis à jour avec succès", "success");
            closeStatusModal(); // Fermer la modal après succès
        } catch (err) {
            console.error(err);
            showNotification(err instanceof Error ? err.message : "Erreur lors de la mise à jour du statut", "error");
        } finally {
            setUpdatingId(null);
        }
    };

    // Filtrer les épreuves côté client en fonction du paramètre compétition
    const filteredEpreuves = useMemo(() => {
        if (!competitionId) return allEpreuves;
        return allEpreuves.filter(epreuve => 
            epreuve.competition.id.toString() === competitionId
        );
    }, [allEpreuves, competitionId]);

    // Calculer les épreuves paginées
    const paginatedEpreuves = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredEpreuves.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredEpreuves, currentPage, itemsPerPage]);

    // Calculer le nombre total de pages
    const totalPages = useMemo(() => {
        return Math.ceil(filteredEpreuves.length / itemsPerPage);
    }, [filteredEpreuves, itemsPerPage]);

    // Fonction pour changer de page
    const changePage = (page: number) => {
        setCurrentPage(page);
    };

    // Fonction pour changer le filtre sans recharger la page
    const handleFilterChange = (newCompetitionId: string | null) => {
        if (newCompetitionId) {
            router.push(`/epreuves?competitionId=${newCompetitionId}`);
        } else {
            router.push('/epreuves');
        }
        // Réinitialiser à la première page lors du changement de filtre
        setCurrentPage(1);
    };

    const [showForm, setShowForm] = useState(false);
    const [newEpreuve, setNewEpreuve] = useState({
        intitule: "",
        competition_id: competitionId ? parseInt(competitionId) : "",
        numero_ordre: 1,
        statut: "A_venir",
        type: "",
    });
    const [formError, setFormError] = useState<string | null>(null);

    const handleCompetitionChange = (competitionId: string) => {
        if (!competitionId) {
            setNewEpreuve({ ...newEpreuve, competition_id: "", numero_ordre: 1 });
            return;
        }
    
        // Automatically calculate the next numero_ordre for the selected competition
        const maxNumeroOrdre = allEpreuves
          .filter((epreuve) => epreuve.competition?.id?.toString() === competitionId)
          .reduce((max, epreuve) => Math.max(max, epreuve.numero_ordre || 0), 0);
    
        setNewEpreuve({ ...newEpreuve, competition_id: competitionId, numero_ordre: maxNumeroOrdre + 1 });
      };

    const handleCreateEpreuve = async (event: React.FormEvent) => {
        event.preventDefault();
        setFormError(null);

        if (!newEpreuve.intitule || !newEpreuve.competition_id || !newEpreuve.numero_ordre || !newEpreuve.type) {
            setFormError("Tous les champs sont obligatoires.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/api/epreuves", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newEpreuve,
                    competition_id: parseInt(newEpreuve.competition_id as string), // Ensure competition_id is a number
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setFormError(errorData.error || "Erreur lors de la création de l'épreuve.");
                return;
            }

            const createdEpreuve = await response.json();
            setAllEpreuves((prev) => [...prev, createdEpreuve]);
            setNewEpreuve({
                intitule: "",
                competition_id: "",
                numero_ordre: 1,
                statut: "A_venir",
                type: "",
            });
            setShowForm(false);
        } catch (err) {
            setFormError("Une erreur est survenue.");
            console.error(err);
        }
    };

    const [deleteMode, setDeleteMode] = useState(false);
    const [selectedEpreuves, setSelectedEpreuves] = useState<number[]>([]);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const toggleDeleteMode = () => {
        setDeleteMode(!deleteMode);
        setShowForm(false); // Ensure the form is hidden when entering delete mode
        setSelectedEpreuves([]);
        setConfirmDelete(false);
    };

    const toggleShowForm = () => {
        setShowForm(!showForm);
        setDeleteMode(false); // Ensure delete mode is disabled when showing the form
    };

    const handleSelectEpreuve = (id: number) => {
        setSelectedEpreuves((prev) =>
            prev.includes(id) ? prev.filter((epreuveId) => epreuveId !== id) : [...prev, id]
        );
    };

    const handleDeleteEpreuves = async () => {
        try {
            for (const id of selectedEpreuves) {
                await fetch(`/api/epreuves/${id}`, { method: "DELETE" });
            }
            setAllEpreuves((prev) => prev.filter((epreuve) => !selectedEpreuves.includes(epreuve.id)));
            showNotification("Épreuves supprimées avec succès", "success");
        } catch (err) {
            console.error(err);
            showNotification("Erreur lors de la suppression des épreuves", "error");
        } finally {
            setConfirmDelete(false);
            setDeleteMode(false);
            setSelectedEpreuves([]);
        }
    };

    if (loading) return <p className="text-center text-gray-500">Chargement des épreuves...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="p-6 max-w-8xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-6">Liste des Épreuves</h1>

            {/* Notification */}
            {notification.visible && (
                <div 
                    className={`fixed top-20 right-4 p-4 rounded shadow-lg z-50 ${
                        notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}
                >
                    {notification.message}
                </div>
            )}

            {/* Filtre par compétition */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-3">Filtrer par compétition</h2>
                <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={() => handleFilterChange(null)}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${!competitionId 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                    >
                        Toutes
                    </button>
                    
                    {competitions.map(comp => (
                        <button 
                            key={comp.id}
                            onClick={() => handleFilterChange(comp.id.toString())}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                                competitionId === comp.id.toString() 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                            }`}
                        >
                            {comp.intitule}
                        </button>
                    ))}
                </div>
            </div>

            {/* Boutons pour afficher le formulaire ou activer le mode suppression */}
            {user?.type === "administrateur" && (
                <div className="flex justify-end mb-4">
                    {!deleteMode && (
                        <button
                            onClick={toggleShowForm}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                        >
                            {showForm ? "Annuler" : "+"}
                        </button>
                    )}
                    {!showForm && (
                        <button
                            onClick={toggleDeleteMode}
                            className={`ml-2 px-4 py-2 rounded-md transition ${
                                deleteMode ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-red-500 text-white hover:bg-red-600"
                            }`}
                        >
                            {deleteMode ? "Annuler" : "-"}
                        </button>
                    )}
                    {deleteMode && (
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="ml-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                        >
                            Supprimer
                        </button>
                    )}
                </div>
            )}

            {/* Formulaire de création d'épreuve */}
            {user?.type === "administrateur" && showForm && (
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <h2 className="text-lg font-semibold mb-4">Créer une nouvelle épreuve</h2>
                    <form onSubmit={handleCreateEpreuve} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Intitulé</label>
                            <input
                                type="text"
                                value={newEpreuve.intitule}
                                onChange={(e) => setNewEpreuve({ ...newEpreuve, intitule: e.target.value })}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Compétition</label>
                            <select
                                value={newEpreuve.competition_id}
                                onChange={(e) => handleCompetitionChange(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            >
                                <option value="">Sélectionnez une compétition</option>
                                {competitions.map((comp) => (
                                    <option key={comp.id} value={comp.id.toString()}>
                                        {comp.intitule}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{`Numéro d'ordre`}</label>
                            <input
                                type="number"
                                value={newEpreuve.numero_ordre}
                                onChange={(e) =>
                                    setNewEpreuve({ ...newEpreuve, numero_ordre: parseInt(e.target.value) })
                                }
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                readOnly // Make it read-only since it's auto-calculated
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <select
                                value={newEpreuve.type}
                                onChange={(e) => setNewEpreuve({ ...newEpreuve, type: e.target.value })}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            >
                                <option value="">Sélectionnez un type</option>
                                <option value="CSO">CSO</option>
                                <option value="Equifun">Equifun</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Statut</label>
                            <select
                                value={newEpreuve.statut}
                                onChange={(e) => setNewEpreuve({ ...newEpreuve, statut: e.target.value })}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            >
                                <option value="A_venir">À venir</option>
                                <option value="En_cours">En cours</option>
                                <option value="Terminee">Terminée</option>
                                <option value="Cloturee">Clôturée</option>
                            </select>
                        </div>
                        {formError && <p className="text-red-500 text-sm">{formError}</p>}
                        <button
                            type="submit"
                            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition"
                        >
                            Créer
                        </button>
                    </form>
                </div>
            )}

            {/* Tableau des épreuves avec largeur fixe */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto" style={{ width: '100%' }}>
                    <div style={{ minWidth: '1400px', minHeight: '400px' }}> {/* Largeur minimale fixe */}
                        {filteredEpreuves.length > 0 ? (
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        {deleteMode && user?.type === "administrateur" && <Th width="5%" children={undefined}></Th>}
                                        <Th width="5%">#</Th>
                                        <Th width="20%">Intitulé</Th>
                                        <Th width="20%">Compétition</Th>
                                        <Th width="5%">Type</Th>
                                        <Th width="5%">Statut</Th>
                                        <Th width="5%">Couples</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedEpreuves.map((epreuve, index) => (
                                        <tr 
                                            key={epreuve.id} 
                                            className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition ${
                                                deleteMode && selectedEpreuves.includes(epreuve.id) ? "bg-red-100" : ""
                                            }`}
                                            onClick={() => !deleteMode && router.push(`/epreuves/${epreuve.id}`)}
                                        >
                                            {deleteMode && user?.type === "administrateur" && (
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedEpreuves.includes(epreuve.id)}
                                                        onChange={() => handleSelectEpreuve(epreuve.id)}
                                                    />
                                                </td>
                                            )}
                                            <Td>{(currentPage - 1) * itemsPerPage + index + 1}</Td>
                                            <Td>{epreuve.intitule}</Td>
                                            <Td>{epreuve.competition?.intitule}</Td>
                                            <Td>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    epreuve.competition?.type === 'CSO' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                    {epreuve.competition?.type}
                                                </span>
                                            </Td>
                                            <Td>
                                                <StatusBadge 
                                                    status={epreuve.statut} 
                                                    onClick={user?.type === "administrateur" ? (e) => openStatusModal(epreuve, e) : undefined} 
                                                    disabled={updatingId === epreuve.id || user?.type !== "administrateur"}
                                                />
                                            </Td>
                                            <Td>{epreuve.participations.length}</Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-gray-500">
                                    {competitionId 
                                        ? "Aucune épreuve trouvée pour cette compétition." 
                                        : "Aucune épreuve trouvée."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                        <div className="flex-1 flex justify-between items-center">
                            <p className="text-sm text-gray-700">
                                Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à{' '}
                                <span className="font-medium">
                                    {Math.min(currentPage * itemsPerPage, filteredEpreuves.length)}
                                </span>{' '}
                                sur <span className="font-medium">{filteredEpreuves.length}</span> épreuves
                            </p>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => changePage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Précédent
                                </button>
                                <button
                                    onClick={() => changePage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Suivant
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de sélection de statut avec arrière-plan flou */}
            {statusModalOpen && selectedEpreuve && user?.type === "administrateur" && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
                    <div 
                        className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full" 
                        onClick={e => e.stopPropagation()}
                        style={{ maxWidth: '450px' }}
                    >
                        <h3 className="text-xl font-bold mb-4">Modifier le statut</h3>
                        <p className="mb-4">
                            <span className="font-semibold">Épreuve:</span> {selectedEpreuve.intitule}
                        </p>
                        <p className="mb-6">
                            <span className="font-semibold">Statut actuel:</span>{' '}
                            <StatusBadge status={selectedEpreuve.statut} />
                        </p>
                        
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {["A_venir", "En_cours", "Terminee", "Cloturee"].map(statut => (
                                <button
                                    key={statut}
                                    className={`p-2 rounded-lg text-sm font-medium ${
                                        statusColors[statut] || "bg-gray-100 text-gray-600"
                                    } ${
                                        selectedEpreuve.statut === statut ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                                    }`}
                                    onClick={() => updateEpreuveStatut(selectedEpreuve.id, statut)}
                                    disabled={updatingId === selectedEpreuve.id}
                                >
                                    {statut.replace(/_/g, ' ')}
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex justify-end">
                            <button 
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                                onClick={closeStatusModal}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmation de suppression */}
            {confirmDelete && user?.type === "administrateur" && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Confirmer la suppression</h3>
                        <p className="mb-6">Êtes-vous sûr de vouloir supprimer les épreuves sélectionnées ?</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setConfirmDelete(false)}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDeleteEpreuves}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Epreuves;

// Composants pour styliser les cellules du tableau
const Th = ({ children, width }: { children: React.ReactNode; width?: string }) => (
    <th className="px-4 py-3 text-left font-medium text-gray-700" style={{ width: width || 'auto' }}>
        {children}
    </th>
);

const Td = ({ children }: { children: React.ReactNode }) => (
    <td className="px-4 py-3">{children}</td>
);

// Couleurs des statuts
const statusColors: Record<string, string> = {
    "A_venir": "bg-blue-100 text-blue-800 border border-blue-200",
    "En_cours": "bg-green-100 text-green-800 border border-green-200",
    "Terminee": "bg-purple-100 text-purple-800 border border-purple-200",
    "Cloturee": "bg-gray-100 text-gray-800 border border-gray-200",
};

// Composant pour afficher un badge de statut avec des couleurs
interface StatusBadgeProps {
    status: string;
    onClick?: (e: React.MouseEvent) => void;
    disabled?: boolean;
}

const StatusBadge = ({ status, onClick, disabled }: StatusBadgeProps) => {
    const baseClasses = `px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-100 text-gray-600"}`;
    
    if (onClick) {
        return (
            <button 
                className={`${baseClasses} cursor-pointer hover:opacity-80`}
                onClick={onClick}
                disabled={disabled}
            >
                {status.replace(/_/g, ' ')}
            </button>
        );
    }

    return (
        <span className={baseClasses}>
            {status.replace(/_/g, ' ')}
        </span>
    );
};