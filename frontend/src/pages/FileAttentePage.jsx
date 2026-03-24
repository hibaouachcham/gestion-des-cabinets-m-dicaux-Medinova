import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext.jsx';

function FileAttentePage({ user, onLogout }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
    
    // Polling toutes les 3 secondes pour mettre à jour la file d'attente
    const interval = setInterval(() => {
      fetchPatients();
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients/queue/all');
      setPatients(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      if (error.response?.status !== 401) {
        showNotification('Erreur lors du chargement de la file d\'attente', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'EN_ATTENTE':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            En attente
          </span>
        );
      case 'EN_CONSULTATION':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            En consultation
          </span>
        );
      case 'TERMINE':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            ✓ Consultation terminée
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {statut}
          </span>
        );
    }
  };

  const handleStartConsultation = async (patientId) => {
    try {
      await api.post(`/patients/${patientId}/start-consultation`);
      navigate(`/consultation/${patientId}`);
    } catch (error) {
      showNotification('Erreur: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleViewConsultation = (consultationId) => {
    // Naviguer vers la page de consultation ou dossier médical
    navigate(`/consultation/${consultationId}`);
  };

  if (loading && patients.length === 0) {
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

  // Séparer les patients par statut
  const enAttente = patients.filter(p => p.statut === 'EN_ATTENTE');
  const enConsultation = patients.filter(p => p.statut === 'EN_CONSULTATION');
  const termines = patients.filter(p => p.statut === 'TERMINE');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Gestion de la File d'Attente</h1>
            <button
              onClick={fetchPatients}
              className="btn btn-secondary"
            >
              🔄 Actualiser
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne 1: En attente */}
            <div className="space-y-4">
              <div className="card bg-gray-50 border-2 border-gray-300">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  En Attente ({enAttente.length})
                </h2>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {enAttente.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucun patient en attente
                    </div>
                  ) : (
                    enAttente.map((file) => (
                      <div
                        key={file.id}
                        className="card bg-white border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-lg">
                                {file.patient.prenom} {file.patient.nom}
                              </div>
                              <div className="text-sm text-gray-600">
                                CIN: {file.patient.cin}
                              </div>
                              <div className="text-sm text-gray-600">
                                Tél: {file.patient.telephone || 'N/A'}
                              </div>
                            </div>
                            {getStatusBadge(file.statut)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Position: {file.position} • Ajouté: {new Date(file.dateAjout).toLocaleString('fr-FR')}
                          </div>
                          <button
                            onClick={() => handleStartConsultation(file.patient.id)}
                            className="btn btn-primary w-full text-sm"
                          >
                            Commencer la consultation
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Colonne 2: En consultation */}
            <div className="space-y-4">
              <div className="card bg-blue-50 border-2 border-blue-300">
                <h2 className="text-xl font-semibold mb-4 text-blue-700">
                  En Consultation ({enConsultation.length})
                </h2>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {enConsultation.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucun patient en consultation
                    </div>
                  ) : (
                    enConsultation.map((file) => (
                      <div
                        key={file.id}
                        className="card bg-white border border-blue-200 hover:shadow-md transition-shadow"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-lg">
                                {file.patient.prenom} {file.patient.nom}
                              </div>
                              <div className="text-sm text-gray-600">
                                CIN: {file.patient.cin}
                              </div>
                              <div className="text-sm text-gray-600">
                                Tél: {file.patient.telephone || 'N/A'}
                              </div>
                            </div>
                            {getStatusBadge(file.statut)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Consultation démarrée: {new Date(file.dateTraitement).toLocaleString('fr-FR')}
                          </div>
                          <button
                            onClick={() => navigate(`/consultation/${file.patient.id}`)}
                            className="btn btn-primary w-full text-sm"
                          >
                            Continuer la consultation
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Colonne 3: Terminés */}
            <div className="space-y-4">
              <div className="card bg-green-50 border-2 border-green-300">
                <h2 className="text-xl font-semibold mb-4 text-green-700">
                  Consultations Terminées ({termines.length})
                </h2>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {termines.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucune consultation terminée
                    </div>
                  ) : (
                    termines.map((file) => (
                      <div
                        key={file.id}
                        className="card bg-white border border-green-200 hover:shadow-md transition-shadow"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-lg">
                                {file.patient.prenom} {file.patient.nom}
                              </div>
                              <div className="text-sm text-gray-600">
                                CIN: {file.patient.cin}
                              </div>
                              <div className="text-sm text-gray-600">
                                Tél: {file.patient.telephone || 'N/A'}
                              </div>
                            </div>
                            {getStatusBadge(file.statut)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Terminé: {new Date(file.dateTraitement).toLocaleString('fr-FR')}
                          </div>
                          {file.consultationId && (
                            <button
                              onClick={() => navigate(`/dossier/${file.patient.id}`)}
                              className="btn btn-secondary w-full text-sm"
                            >
                              Voir le dossier
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default FileAttentePage;