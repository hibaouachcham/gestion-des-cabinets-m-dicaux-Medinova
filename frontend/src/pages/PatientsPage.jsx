import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import PatientForm from '../components/PatientForm';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext.jsx';

function PatientsPage({ user, onLogout }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [dossierExists, setDossierExists] = useState({}); // Map patientId -> boolean
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchPatients();
  }, [page, search]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/patients', {
        params: { search, page, size: 10 }
      });
      console.log('DEBUG Frontend: Patients reçus:', response.data.content);
      // S'assurer que enFileAttente est bien défini pour chaque patient
      const patientsWithStatus = response.data.content.map(patient => ({
        ...patient,
        enFileAttente: patient.enFileAttente === true // S'assurer que c'est un boolean
      }));
      console.log('DEBUG Frontend: Patients avec statut:', patientsWithStatus);
      setPatients(patientsWithStatus);
      setTotalPages(response.data.totalPages);

      // Vérifier l'existence des dossiers pour chaque patient (uniquement pour les médecins)
      if (user?.role === 'ROLE_DOCTOR') {
        const existsMap = {};
        await Promise.all(
          patientsWithStatus.map(async (patient) => {
            try {
              const checkResponse = await api.get(`/dossiers/exists/${patient.id}`);
              existsMap[patient.id] = checkResponse.data.exists;
            } catch (error) {
              existsMap[patient.id] = false;
            }
          })
        );
        setDossierExists(existsMap);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des patients:', error);
      // Si erreur 401, l'intercepteur gérera la redirection
      // Mais on ne veut pas bloquer l'interface pour une erreur temporaire
      if (error.response?.status === 401) {
        console.warn('Erreur d\'authentification lors de la récupération des patients');
        // Ne pas vider la liste, juste afficher un message
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleEnqueue = async (patient) => {
    // Pour la secrétaire, envoyer directement au médecin du cabinet
    try {
      await api.post(`/patients/${patient.id}/enqueue`);
      
      // Mettre à jour immédiatement le statut du patient dans la liste locale
      setPatients(prevPatients => 
        prevPatients.map(p => 
          p.id === patient.id 
            ? { ...p, enFileAttente: true }
            : p
        )
      );

      showNotification('Patient ajouté à la file d\'attente', 'success');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      
      // Si le patient est déjà en file d'attente, mettre à jour quand même le statut
      if (errorMessage.includes('déjà en file d\'attente')) {
        setPatients(prevPatients => 
          prevPatients.map(p => 
            p.id === patient.id 
              ? { ...p, enFileAttente: true }
              : p
          )
        );
        showNotification('Le patient est déjà en file d\'attente', 'info');
      } else {
        showNotification('Erreur: ' + errorMessage, 'error');
      }
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  const handleDelete = async (patient) => {
    if (!window.confirm(`Supprimer le patient ${patient.prenom} ${patient.nom} ?`)) {
      return;
    }
    try {
      await api.delete(`/patients/${patient.id}`);
      showNotification('Patient supprimé avec succès', 'success');
      setPatients(prev => prev.filter(p => p.id !== patient.id));
    } catch (error) {
      showNotification('Erreur: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPatient(null);
    // Réinitialiser la page à 0 pour afficher le nouveau patient (les nouveaux patients sont généralement en haut)
    setPage(0);
    // fetchPatients sera appelé automatiquement par useEffect quand page change
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              + Ajouter un patient
            </button>
          </div>

          <div className="card mb-6">
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou CIN..."
              value={search}
              onChange={handleSearch}
              className="input"
            />
          </div>

          {showForm && (
            <PatientForm
              patient={editingPatient}
              onClose={handleFormClose}
            />
          )}

          {loading ? (
            <div className="text-center py-12">Chargement...</div>
          ) : (
            <>
              <div className="card overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CIN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prénom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Téléphone
                      </th>
                      {user?.role === 'ROLE_SECR' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {patients.map((patient) => (
                      <tr key={patient.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.cin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.prenom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.telephone || 'N/A'}
                        </td>
                        {user?.role === 'ROLE_SECR' && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            {patient.enFileAttente ? (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                ✓ Envoyé au médecin
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                En attente
                              </span>
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                          <button
                            onClick={() => handleEdit(patient)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Modifier
                          </button>
                          {user?.role === 'ROLE_DOCTOR' && (
                            <>
                              {dossierExists[patient.id] ? (
                                <Link
                                  to={`/dossier/${patient.id}`}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Voir dossier médical
                                </Link>
                              ) : (
                                <Link
                                  to={`/creer-dossier/${patient.id}`}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Créer dossier médical
                                </Link>
                              )}
                            </>
                          )}
                          {user?.role === 'ROLE_SECR' && (
                            <>
                              <button
                                onClick={() => handleEnqueue(patient)}
                                disabled={patient.enFileAttente}
                                className={`${
                                  patient.enFileAttente
                                    ? 'text-green-600 cursor-default font-semibold'
                                    : 'text-green-600 hover:text-green-900'
                                }`}
                                title={patient.enFileAttente ? 'Déjà envoyé au médecin' : 'Envoyer au médecin'}
                              >
                                {patient.enFileAttente ? '✓ Envoyé au médecin' : 'Envoyer au médecin'}
                              </button>
                              <button
                                onClick={() => handleDelete(patient)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Supprimer
                              </button>
                            </>
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
        </main>
      </div>
    </div>
  );
}

export default PatientsPage;