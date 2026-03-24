import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import api from '../services/api.js';
import { useNotification } from '../contexts/NotificationContext.jsx';

function GestionConsultationsPage({ user, onLogout }) {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [editingConsultation, setEditingConsultation] = useState(null);
  const [editFormData, setEditFormData] = useState({
    motif: '',
    examenClinique: '',
    diagnostic: '',
    prescription: '',
    observations: ''
  });
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      // Récupérer toutes les consultations du médecin
      const response = await api.get('/consultations/all');
      setConsultations(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      showNotification('Erreur lors du chargement des consultations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditConsultation = async (consultationId) => {
    try {
      const response = await api.get(`/consultations/${consultationId}`);
      const consultation = response.data;
      setEditingConsultation(consultation);
      setEditFormData({
        motif: consultation.motif || '',
        examenClinique: consultation.examenClinique || '',
        diagnostic: consultation.diagnostic || '',
        prescription: consultation.prescription || '',
        observations: consultation.observations || ''
      });
    } catch (error) {
      showNotification('Erreur: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleUpdateConsultation = async () => {
    if (!editingConsultation) return;

    setLoading(true);
    try {
      await api.put(`/consultations/${editingConsultation.id}`, editFormData);
      showNotification('Consultation modifiée avec succès', 'success');
      setEditingConsultation(null);
      setEditFormData({
        motif: '',
        examenClinique: '',
        diagnostic: '',
        prescription: '',
        observations: ''
      });
      fetchConsultations();
    } catch (error) {
      showNotification('Erreur: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConsultation = async (consultationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette consultation ? Cette action est irréversible et supprimera aussi les ordonnances et examens associés.')) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/consultations/${consultationId}`);
      showNotification('Consultation supprimée avec succès', 'success');
      fetchConsultations();
    } catch (error) {
      showNotification('Erreur: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async (consultationId) => {
    try {
      // Récupérer les ordonnances de cette consultation
      const ordonnancesRes = await api.get(`/ordonnances/consultation/${consultationId}`);
      if (ordonnancesRes.data.length > 0) {
        const response = await api.get(`/ordonnances/${ordonnancesRes.data[0].id}/pdf`, {
          responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `ordonnance_${ordonnancesRes.data[0].id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        showNotification('PDF généré avec succès', 'success');
      } else {
        showNotification('Aucune ordonnance pour cette consultation', 'info');
      }
    } catch (error) {
      showNotification('Erreur lors de la génération du PDF', 'error');
    }
  };

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = !searchTerm || 
      `${consultation.patientPrenom} ${consultation.patientNom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (consultation.diagnostic && consultation.diagnostic.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDate = !filterDate || 
      new Date(consultation.dateConsultation).toLocaleDateString('fr-CA') === filterDate;
    
    return matchesSearch && matchesDate;
  });

  if (loading && consultations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={onLogout} />
        <div className="flex">
          <Sidebar user={user} />
          <main className="flex-1 p-8">
            <div className="text-center py-12">Chargement...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Consultations</h1>
            <button
              onClick={fetchConsultations}
              className="btn btn-secondary"
            >
              🔄 Actualiser
            </button>
          </div>

          {/* Filtres */}
          <div className="card mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher (patient, diagnostic...)
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input"
                  placeholder="Rechercher..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrer par date
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Modal d'édition */}
          {editingConsultation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Modifier la consultation</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motif de consultation
                    </label>
                    <textarea
                      value={editFormData.motif}
                      onChange={(e) => setEditFormData({ ...editFormData, motif: e.target.value })}
                      className="input"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Examen clinique
                    </label>
                    <textarea
                      value={editFormData.examenClinique}
                      onChange={(e) => setEditFormData({ ...editFormData, examenClinique: e.target.value })}
                      className="input"
                      rows="4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diagnostic *
                    </label>
                    <textarea
                      value={editFormData.diagnostic}
                      onChange={(e) => setEditFormData({ ...editFormData, diagnostic: e.target.value })}
                      className="input"
                      rows="3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observations
                    </label>
                    <textarea
                      value={editFormData.observations}
                      onChange={(e) => setEditFormData({ ...editFormData, observations: e.target.value })}
                      className="input"
                      rows="3"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={() => {
                      setEditingConsultation(null);
                      setEditFormData({
                        motif: '',
                        examenClinique: '',
                        diagnostic: '',
                        prescription: '',
                        observations: ''
                      });
                    }}
                    className="btn btn-secondary"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleUpdateConsultation}
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? 'Modification...' : 'Modifier'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Liste des consultations */}
          <div className="space-y-4">
            {filteredConsultations.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-600">
                  {consultations.length === 0 
                    ? 'Aucune consultation enregistrée' 
                    : 'Aucune consultation ne correspond aux filtres'}
                </p>
              </div>
            ) : (
              filteredConsultations.map((consultation) => (
                <div key={consultation.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold text-lg">
                          {consultation.patientPrenom} {consultation.patientNom}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {new Date(consultation.dateConsultation).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {consultation.diagnostic && (
                        <p className="text-sm text-gray-600 mb-2">
                          {consultation.diagnostic.length > 100 
                            ? consultation.diagnostic.substring(0, 100) + '...' 
                            : consultation.diagnostic}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/consultation/${consultation.patientId}`)}
                        className="btn btn-secondary btn-sm"
                      >
                        Voir
                      </button>
                      <button
                        onClick={() => handleEditConsultation(consultation.id)}
                        className="btn btn-primary btn-sm"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteConsultation(consultation.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Supprimer
                      </button>
                      <button
                        onClick={() => handleGeneratePDF(consultation.id)}
                        className="btn btn-secondary btn-sm"
                        title="Générer PDF de l'ordonnance"
                      >
                        📄 PDF
                      </button>
                    </div>
                  </div>

                  {/* Détails expandables */}
                  <div className="border-t pt-4 mt-4">
                    <details className="space-y-2">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                        Voir les détails
                      </summary>
                      <div className="mt-3 space-y-2 text-sm">
                        {consultation.motif && (
                          <div>
                            <strong>Motif:</strong> {consultation.motif}
                          </div>
                        )}
                        {consultation.examenClinique && (
                          <div>
                            <strong>Examen clinique:</strong> {consultation.examenClinique}
                          </div>
                        )}
                        {consultation.diagnostic && (
                          <div>
                            <strong>Diagnostic:</strong> {consultation.diagnostic}
                          </div>
                        )}
                        {consultation.observations && (
                          <div>
                            <strong>Observations:</strong> {consultation.observations}
                          </div>
                        )}
                        <div className="mt-3">
                          <button
                            onClick={() => navigate(`/dossier/${consultation.patientId}`)}
                            className="btn btn-secondary btn-sm"
                          >
                            Voir le dossier médical complet
                          </button>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default GestionConsultationsPage;