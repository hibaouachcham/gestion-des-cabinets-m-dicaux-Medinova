import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext.jsx';

function RendezVousPage({ user, onLogout }) {
  const [rendezVous, setRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingRdv, setEditingRdv] = useState(null);
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patientId: '',
    dateHeure: '',
    motif: '',
    notes: ''
  });
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchRendezVous();
    if (user?.role === 'ROLE_SECR' || user?.role === 'ROLE_DOCTOR') {
      fetchPatients();
    }
  }, [page, user]);

  const fetchRendezVous = async () => {
    setLoading(true);
    try {
      const response = await api.get('/rendezvous', { params: { page, size: 10 } });
      setRendezVous(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
      // Si erreur 401, l'intercepteur gérera la redirection
      if (error.response?.status === 401) {
        console.warn('Erreur d\'authentification lors de la récupération des rendez-vous');
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
    setEditingRdv(null);
    setFormData({
      patientId: '',
      dateHeure: '',
      motif: '',
      notes: ''
    });
    setShowModal(true);
  };

  const handleEdit = (rdv) => {
    setEditingRdv(rdv);
    const dateTime = new Date(rdv.dateHeure);
    const dateTimeString = dateTime.toISOString().slice(0, 16);
    setFormData({
      patientId: rdv.patientId?.toString() || '',
      dateHeure: dateTimeString,
      motif: rdv.motif || '',
      notes: rdv.notes || ''
    });
    setShowModal(true);
  };

  const handleCancel = async (rdvId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      return;
    }
    try {
      await api.put(`/rendezvous/${rdvId}`, {
        statut: 'ANNULE'
      });
      showNotification('Rendez-vous annulé avec succès', 'success');
      fetchRendezVous();
    } catch (error) {
      showNotification('Erreur lors de l\'annulation: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const rdvData = {
        patientId: parseInt(formData.patientId),
        dateHeure: new Date(formData.dateHeure).toISOString(),
        motif: formData.motif,
        notes: formData.notes,
        statut: editingRdv ? editingRdv.statut : 'PLANIFIE'
      };

      if (editingRdv) {
        await api.put(`/rendezvous/${editingRdv.id}`, rdvData);
        showNotification('Rendez-vous modifié avec succès', 'success');
      } else {
        await api.post('/rendezvous', rdvData);
        showNotification('Rendez-vous créé avec succès', 'success');
      }
      setShowModal(false);
      setEditingRdv(null);
      resetForm();
      fetchRendezVous();
    } catch (error) {
      showNotification('Erreur: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      dateHeure: '',
      motif: '',
      notes: ''
    });
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'PLANIFIE':
        return 'bg-blue-100 text-blue-800';
      case 'EN_COURS':
        return 'bg-yellow-100 text-yellow-800';
      case 'TERMINE':
        return 'bg-green-100 text-green-800';
      case 'ANNULE':
        return 'bg-red-100 text-red-800';
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
            <h1 className="text-3xl font-bold text-gray-900">Rendez-vous</h1>
            {(user?.role === 'ROLE_SECR' || user?.role === 'ROLE_DOCTOR') && (
              <button
                onClick={handleCreate}
                className="btn btn-primary"
              >
                + Nouveau rendez-vous
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
                        Date/Heure
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Motif
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Statut
                      </th>
                      {(user?.role === 'ROLE_SECR' || user?.role === 'ROLE_DOCTOR') && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rendezVous.map((rdv) => (
                      <tr key={rdv.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(rdv.dateHeure).toLocaleString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {rdv.patientPrenom} {rdv.patientNom}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {rdv.motif || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(rdv.statut)}`}>
                            {rdv.statut}
                          </span>
                        </td>
                        {(user?.role === 'ROLE_SECR' || user?.role === 'ROLE_DOCTOR') && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {rdv.statut !== 'ANNULE' && rdv.statut !== 'TERMINE' && (
                              <>
                                <button
                                  onClick={() => handleEdit(rdv)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Modifier
                                </button>
                                <button
                                  onClick={() => handleCancel(rdv.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Annuler
                                </button>
                              </>
                            )}
                          </td>
                        )}
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

          {/* Modal de création/édition */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">
                  {editingRdv ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
                </h2>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date et heure *</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.dateHeure}
                      onChange={(e) => setFormData({ ...formData, dateHeure: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Motif *</label>
                    <input
                      type="text"
                      required
                      value={formData.motif}
                      onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Ex: Consultation générale"
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
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingRdv(null);
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
                      {editingRdv ? 'Modifier' : 'Créer'}
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

export default RendezVousPage;

