import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext.jsx';

function GestionAbonnements({ user, onLogout }) {
  const [abonnements, setAbonnements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRenewModal, setShowRenewModal] = useState(null);
  const [newDateFin, setNewDateFin] = useState('');
  const [filterStatut, setFilterStatut] = useState('TOUS');
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [abonnementsRes, statsRes] = await Promise.all([
        api.get('/admin/abonnements'),
        api.get('/admin/abonnements/stats')
      ]);
      if (Array.isArray(abonnementsRes.data)) {
        setAbonnements(abonnementsRes.data);
      } else {
        setAbonnements([]);
      }
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      setAbonnements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (abonnementId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'ACTIF' || currentStatus === 'À RENOUVELER';
      await api.patch(`/admin/abonnements/${abonnementId}/toggle?actif=${!newStatus}`);
      showNotification('Statut de l\'abonnement modifié avec succès', 'success');
      fetchData();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      showNotification('Erreur lors du changement de statut', 'error');
    }
  };

  const handleRenew = async (abonnementId) => {
    if (!newDateFin) {
      showNotification('Veuillez sélectionner une date de fin', 'error');
      return;
    }
    try {
      await api.post(`/admin/abonnements/${abonnementId}/renew`, {
        nouvelleDateFin: newDateFin,
        activer: true
      });
      showNotification('Abonnement renouvelé avec succès', 'success');
      setShowRenewModal(null);
      setNewDateFin('');
      fetchData();
    } catch (error) {
      console.error('Erreur lors du renouvellement:', error);
      showNotification('Erreur lors du renouvellement', 'error');
    }
  };

  const getStatusBadge = (statut) => {
    const badges = {
      'ACTIF': 'bg-green-100 text-green-800',
      'EXPIRÉ': 'bg-red-100 text-red-800',
      'À RENOUVELER': 'bg-yellow-100 text-yellow-800',
      'DÉSACTIVÉ': 'bg-gray-100 text-gray-800'
    };
    return badges[statut] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const filteredAbonnements = filterStatut === 'TOUS' 
    ? abonnements 
    : abonnements.filter(ab => ab.statut === filterStatut);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestion des Abonnements</h1>
          
          {/* Statistiques */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="text-sm opacity-90">Abonnements Actifs</div>
                <div className="text-4xl font-bold mt-2">{stats.abonnementsActifs || 0}</div>
              </div>
              <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
                <div className="text-sm opacity-90">Abonnements Expirés</div>
                <div className="text-4xl font-bold mt-2">{stats.abonnementsExpires || 0}</div>
              </div>
              <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                <div className="text-sm opacity-90">À Renouveler</div>
                <div className="text-4xl font-bold mt-2">{stats.abonnementsARenouveler || 0}</div>
              </div>
              <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                <div className="text-sm opacity-90">Total Abonnements</div>
                <div className="text-4xl font-bold mt-2">{stats.totalAbonnements || 0}</div>
              </div>
            </div>
          )}

          {/* Filtres */}
          <div className="mb-4 flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filtrer par statut:</label>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="TOUS">Tous</option>
              <option value="ACTIF">Actifs</option>
              <option value="EXPIRÉ">Expirés</option>
              <option value="À RENOUVELER">À Renouveler</option>
              <option value="DÉSACTIVÉ">Désactivés</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-12">Chargement...</div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cabinet</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Médecin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Début</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Fin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(filteredAbonnements) && filteredAbonnements.length > 0 ? (
                    filteredAbonnements.map((ab) => (
                      <tr key={ab.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {ab.cabinetNom || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ab.medecinNom && ab.medecinPrenom 
                            ? `${ab.medecinPrenom} ${ab.medecinNom}` 
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ab.type || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(ab.dateDebut)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(ab.dateFin)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(ab.statut)}`}>
                            {ab.statut || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleToggleStatus(ab.id, ab.statut)}
                            className={`text-sm px-3 py-1 rounded ${
                              ab.statut === 'ACTIF' || ab.statut === 'À RENOUVELER'
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {ab.statut === 'ACTIF' || ab.statut === 'À RENOUVELER' ? 'Désactiver' : 'Activer'}
                          </button>
                          <button
                            onClick={() => {
                              setShowRenewModal(ab.id);
                              setNewDateFin('');
                            }}
                            className="text-sm px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                          >
                            Renouveler
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucun abonnement trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal de renouvellement */}
          {showRenewModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Renouveler l'abonnement</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouvelle date de fin
                  </label>
                  <input
                    type="date"
                    value={newDateFin}
                    onChange={(e) => setNewDateFin(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowRenewModal(null);
                      setNewDateFin('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleRenew(showRenewModal)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Renouveler
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default GestionAbonnements;

