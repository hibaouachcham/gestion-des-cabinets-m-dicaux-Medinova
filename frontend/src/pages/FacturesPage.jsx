import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext.jsx';

function FacturesPage({ user, onLogout }) {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patientId: '',
    montantHT: '',
    tauxTVA: '20',
    notes: ''
  });
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchFactures();
    if (user?.role === 'ROLE_SECR') {
      fetchPatients();
    }
  }, [page, user]);

  const fetchFactures = async () => {
    setLoading(true);
    try {
      const response = await api.get('/factures', {
        params: { page, size: 10 }
      });
      setFactures(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Erreur lors de la récupération des factures:', error);
      // Si erreur 401, l'intercepteur gérera la redirection
      if (error.response?.status === 401) {
        console.warn('Erreur d\'authentification lors de la récupération des factures');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients', { params: { page: 0, size: 1000 } });
      setPatients(response.data.content || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des patients:', error);
    }
  };

  const handleCreate = () => {
    setFormData({
      patientId: '',
      montantHT: '',
      tauxTVA: '20',
      notes: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/factures', null, {
        params: {
          patientId: parseInt(formData.patientId),
          montantHT: parseFloat(formData.montantHT),
          tauxTVA: parseFloat(formData.tauxTVA) / 100,
          notes: formData.notes || null
        }
      });
      showNotification('Facture créée avec succès', 'success');
      setShowModal(false);
      resetForm();
      fetchFactures();
    } catch (error) {
      showNotification('Erreur: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      montantHT: '',
      tauxTVA: '20',
      notes: ''
    });
  };

  const handleValidatePayment = async (factureId) => {
    if (!window.confirm('Valider le paiement de cette facture ?')) {
      return;
    }
    try {
      await api.patch(`/factures/${factureId}/statut`, null, {
        params: { statut: 'PAYE' }
      });
      showNotification('Paiement validé avec succès', 'success');
      fetchFactures();
    } catch (error) {
      showNotification('Erreur: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleDeleteFacture = async (facture) => {
    if (!window.confirm(`Supprimer la facture ${facture.numero} ?`)) {
      return;
    }
    try {
      await api.delete(`/factures/${facture.id}`);
      showNotification('Facture supprimée avec succès', 'success');
      setFactures(prev => prev.filter(f => f.id !== facture.id));
    } catch (error) {
      showNotification('Erreur: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleGeneratePDF = async (factureId) => {
    try {
      const response = await api.get(`/factures/${factureId}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture_${factureId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      showNotification('Erreur lors de la génération du PDF', 'error');
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'PAYE':
        return 'bg-green-100 text-green-800';
      case 'IMPAYE':
        return 'bg-red-100 text-red-800';
      case 'PARTIEL':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Factures</h1>
            {user?.role === 'ROLE_SECR' && (
              <button
                onClick={handleCreate}
                className="btn btn-primary"
              >
                + Nouvelle facture
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">Chargement...</div>
          ) : (
            <>
              <div className="card overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Numéro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Montant TTC
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {factures.map((facture) => (
                      <tr key={facture.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {facture.numero}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {facture.patientNom || facture.patientPrenom 
                            ? `${facture.patientPrenom || ''} ${facture.patientNom || ''}`.trim()
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {facture.montantTTC?.toFixed(2)} DH
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(facture.dateEmission).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(facture.statutPaiement)}`}>
                            {facture.statutPaiement}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                          {facture.statutPaiement === 'IMPAYE' && user?.role === 'ROLE_SECR' && (
                            <button
                              onClick={() => handleValidatePayment(facture.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Valider paiement
                            </button>
                          )}
                          <button
                            onClick={() => handleGeneratePDF(facture.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Imprimer PDF
                          </button>
                          {user?.role === 'ROLE_SECR' && (
                            <button
                              onClick={() => handleDeleteFacture(facture)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Supprimer
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  className="btn btn-secondary"
                >
                  Précédent
                </button>
                <span className="text-sm text-gray-600">
                  Page {page + 1} sur {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="btn btn-secondary"
                >
                  Suivant
                </button>
              </div>
            </>
          )}

          {/* Modal de création de facture */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Nouvelle facture</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
                    <select
                      required
                      value={formData.patientId}
                      onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">-- Sélectionner un patient --</option>
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.prenom} {patient.nom} ({patient.cin})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Montant HT (DH) *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={formData.montantHT}
                      onChange={(e) => setFormData({ ...formData, montantHT: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Taux TVA (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.tauxTVA}
                      onChange={(e) => setFormData({ ...formData, tauxTVA: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows="3"
                      placeholder="Notes supplémentaires..."
                    />
                  </div>
                  {formData.montantHT && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-600">
                        <strong>Montant HT:</strong> {parseFloat(formData.montantHT || 0).toFixed(2)} DH
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>TVA ({formData.tauxTVA}%):</strong> {(parseFloat(formData.montantHT || 0) * parseFloat(formData.tauxTVA || 0) / 100).toFixed(2)} DH
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        <strong>Montant TTC:</strong> {(parseFloat(formData.montantHT || 0) * (1 + parseFloat(formData.tauxTVA || 0) / 100)).toFixed(2)} DH
                      </p>
                    </div>
                  )}
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Créer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default FacturesPage;

