import { useState } from 'react';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext.jsx';

function AbonnementsTable({ abonnements, onRefresh }) {
  const [renewingId, setRenewingId] = useState(null);
  const [showRenewModal, setShowRenewModal] = useState(null);
  const [newDateFin, setNewDateFin] = useState('');
  const { showNotification } = useNotification();

  const getStatusBadge = (statut) => {
    const badges = {
      'ACTIF': 'bg-green-100 text-green-800',
      'EXPIRÉ': 'bg-red-100 text-red-800',
      'À RENOUVELER': 'bg-yellow-100 text-yellow-800',
      'DÉSACTIVÉ': 'bg-gray-100 text-gray-800'
    };
    return badges[statut] || 'bg-gray-100 text-gray-800';
  };

  const handleToggleStatus = async (abonnementId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'ACTIF' || currentStatus === 'À RENOUVELER';
      await api.patch(`/admin/abonnements/${abonnementId}/toggle?actif=${!newStatus}`);
      onRefresh();
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
      setRenewingId(abonnementId);
      await api.post(`/admin/abonnements/${abonnementId}/renew`, {
        nouvelleDateFin: newDateFin,
        activer: true
      });
      setShowRenewModal(null);
      setNewDateFin('');
      onRefresh();
    } catch (error) {
      console.error('Erreur lors du renouvellement:', error);
      showNotification('Erreur lors du renouvellement', 'error');
    } finally {
      setRenewingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="card overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">Gestion des Abonnements</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cabinet
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Médecin
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date Début
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date Fin
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {abonnements && abonnements.length > 0 ? (
            abonnements.map((ab) => (
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
                    onClick={() => setShowRenewModal(ab.id)}
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
                disabled={renewingId === showRenewModal}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {renewingId === showRenewModal ? 'Renouvellement...' : 'Renouveler'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AbonnementsTable;

