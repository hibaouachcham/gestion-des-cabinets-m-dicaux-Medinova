import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

function DashboardSecretary({ user, onLogout }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/secr/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('Non autorisé à accéder aux statistiques');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Secrétaire</h1>
          
          {loading ? (
            <div className="text-center py-12">Chargement...</div>
          ) : (
            <>
              {/* Statistiques principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <div className="text-sm opacity-90">Total Patients</div>
                  <div className="text-4xl font-bold mt-2">{stats?.totalPatients || 0}</div>
                  <div className="text-xs opacity-75 mt-1">Patients du cabinet</div>
                </div>
                
                <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <div className="text-sm opacity-90">En File d'Attente</div>
                  <div className="text-4xl font-bold mt-2">{stats?.patientsEnFileAttente || 0}</div>
                  <div className="text-xs opacity-75 mt-1">Envoyés au médecin</div>
                </div>
                
                <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <div className="text-sm opacity-90">Rendez-vous Aujourd'hui</div>
                  <div className="text-4xl font-bold mt-2">{stats?.rendezVousAujourdhui || 0}</div>
                  <div className="text-xs opacity-75 mt-1">Pour aujourd'hui</div>
                </div>
                
                <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <div className="text-sm opacity-90">À Venir</div>
                  <div className="text-4xl font-bold mt-2">{stats?.rendezVousAVenir || 0}</div>
                  <div className="text-xs opacity-75 mt-1">Rendez-vous planifiés</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                  <div className="text-sm opacity-90">Cette Semaine</div>
                  <div className="text-3xl font-bold mt-2">{stats?.rendezVousCetteSemaine || 0}</div>
                  <div className="text-xs opacity-75 mt-1">Rendez-vous de la semaine</div>
                </div>
                
                <div className="card bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                  <div className="text-sm opacity-90">Factures ce Mois</div>
                  <div className="text-3xl font-bold mt-2">{stats?.facturesCeMois || 0}</div>
                  <div className="text-xs opacity-75 mt-1">Factures du mois</div>
                </div>
                
                <div className="card bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                  <div className="text-sm opacity-90">Consultations</div>
                  <div className="text-3xl font-bold mt-2">{stats?.consultationsCeMois || 0}</div>
                  <div className="text-xs opacity-75 mt-1">Consultations du mois</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Actions rapides */}
                <div className="card">
                  <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
                  <div className="space-y-3">
                    <Link to="/patients" className="block btn btn-primary w-full text-center">
                      Gérer les Patients
                    </Link>
                    <Link to="/rendez-vous" className="block btn btn-secondary w-full text-center">
                      Gérer les Rendez-vous
                    </Link>
                    <Link to="/factures" className="block btn btn-secondary w-full text-center">
                      Gérer les Factures
                    </Link>
                  </div>
                </div>
                
                {/* Prochains rendez-vous */}
                <div className="card">
                  <h2 className="text-xl font-semibold mb-4">Prochains Rendez-vous</h2>
                  {stats?.prochainsRendezVous && stats.prochainsRendezVous.length > 0 ? (
                    <div className="space-y-3">
                      {stats.prochainsRendezVous.map((rdv) => (
                        <div key={rdv.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {rdv.patientNom} {rdv.patientPrenom}
                              </p>
                              <p className="text-sm text-gray-600">{rdv.motif || 'Sans motif'}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(rdv.dateHeure)}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              rdv.statut === 'PLANIFIE' ? 'bg-blue-100 text-blue-800' :
                              rdv.statut === 'EN_COURS' ? 'bg-yellow-100 text-yellow-800' :
                              rdv.statut === 'TERMINE' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {rdv.statut}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Aucun rendez-vous à venir</p>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default DashboardSecretary;

