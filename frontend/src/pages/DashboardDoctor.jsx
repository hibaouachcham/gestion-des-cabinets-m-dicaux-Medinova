import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

function DashboardDoctor({ user, onLogout }) {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    
    // Polling pour mettre à jour la file d'attente toutes les 5 secondes
    const interval = setInterval(() => {
      fetchCurrentPatient();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchCurrentPatient = async () => {
    try {
      const patientRes = await api.get('/patients/queue/current').catch(() => ({ status: 204 }));
      if (patientRes.status === 204) {
        setCurrentPatient(null);
      } else {
        setCurrentPatient(patientRes.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [patientRes, statsRes] = await Promise.all([
        api.get('/patients/queue/current').catch(() => ({ status: 204 })),
        api.get('/doctors/stats')
      ]);

      if (patientRes.status === 204) {
        setCurrentPatient(null);
      } else {
        setCurrentPatient(patientRes.data);
      }

      setStats(statsRes.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Médecin</h1>
          
          {loading ? (
            <div className="text-center py-12">Chargement...</div>
          ) : (
            <div className="space-y-6">
              {/* Statistiques */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="card bg-blue-50 border-l-4 border-blue-500">
                    <div className="text-sm text-gray-600 mb-1">Consultations aujourd'hui</div>
                    <div className="text-3xl font-bold text-blue-600">{stats.consultationsAujourdhui || 0}</div>
                  </div>
                  <div className="card bg-green-50 border-l-4 border-green-500">
                    <div className="text-sm text-gray-600 mb-1">Cette semaine</div>
                    <div className="text-3xl font-bold text-green-600">{stats.consultationsCetteSemaine || 0}</div>
                  </div>
                  <div className="card bg-purple-50 border-l-4 border-purple-500">
                    <div className="text-sm text-gray-600 mb-1">Ce mois</div>
                    <div className="text-3xl font-bold text-purple-600">{stats.consultationsCeMois || 0}</div>
                  </div>
                  <div className="card bg-orange-50 border-l-4 border-orange-500">
                    <div className="text-sm text-gray-600 mb-1">En file d'attente</div>
                    <div className="text-3xl font-bold text-orange-600">{stats.patientsEnFileAttente || 0}</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Patient en attente */}
                {currentPatient ? (
                  <div className="card bg-primary-50 border-2 border-primary-500">
                    <h2 className="text-xl font-semibold mb-4 text-primary-700">
                      Patient en attente
                    </h2>
                    <div className="space-y-2">
                      <p><strong>Nom:</strong> {currentPatient.prenom} {currentPatient.nom}</p>
                      <p><strong>CIN:</strong> {currentPatient.cin}</p>
                      <p><strong>Téléphone:</strong> {currentPatient.telephone || 'N/A'}</p>
                      <Link 
                        to={`/consultation/${currentPatient.id}`}
                        className="block mt-4 btn btn-primary w-full text-center"
                      >
                        Commencer la consultation
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="card">
                    <h2 className="text-xl font-semibold mb-4">Aucun patient en file d'attente</h2>
                    <p className="text-gray-600 mb-4">Aucun patient n'est actuellement en attente de consultation.</p>
                    <Link to="/recherche-patient" className="btn btn-primary">
                      Rechercher un patient
                    </Link>
                  </div>
                )}
                
                {/* Actions rapides */}
                <div className="card">
                  <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
                  <div className="space-y-3">
                    <Link to="/recherche-patient" className="block btn btn-primary w-full text-center">
                      Rechercher un Patient
                    </Link>
                    <Link to="/patients" className="block btn btn-secondary w-full text-center">
                      Voir les Patients
                    </Link>
                    <Link to="/rendez-vous" className="block btn btn-secondary w-full text-center">
                      Rendez-vous
                    </Link>
                  </div>
                </div>
              </div>

              {/* Consultations récentes et prochains rendez-vous */}
              {stats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Consultations récentes */}
                  {stats.consultationsRecentes && stats.consultationsRecentes.length > 0 && (
                    <div className="card">
                      <h2 className="text-xl font-semibold mb-4">Consultations récentes</h2>
                      <div className="space-y-3">
                        {stats.consultationsRecentes.slice(0, 5).map((consultation) => (
                          <div key={consultation.id} className="border-b pb-3 last:border-b-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">
                                  {consultation.patientPrenom} {consultation.patientNom}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {new Date(consultation.dateConsultation).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                                {consultation.diagnostic && (
                                  <div className="text-sm text-gray-500 mt-1">
                                    {consultation.diagnostic.substring(0, 50)}...
                                  </div>
                                )}
                              </div>
                              <Link
                                to={`/gestion-consultations`}
                                className="btn btn-sm btn-secondary"
                              >
                                Voir
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prochains rendez-vous */}
                  {stats.prochainsRendezVous && stats.prochainsRendezVous.length > 0 && (
                    <div className="card">
                      <h2 className="text-xl font-semibold mb-4">Prochains rendez-vous</h2>
                      <div className="space-y-3">
                        {stats.prochainsRendezVous.slice(0, 5).map((rdv) => (
                          <div key={rdv.id} className="border-b pb-3 last:border-b-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">
                                  {rdv.patientPrenom} {rdv.patientNom}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {new Date(rdv.dateHeure).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                                {rdv.motif && (
                                  <div className="text-sm text-gray-500 mt-1">
                                    {rdv.motif.substring(0, 50)}...
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default DashboardDoctor;