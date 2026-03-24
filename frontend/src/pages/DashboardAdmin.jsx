import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import AbonnementsTable from '../components/AbonnementsTable';
import api from '../services/api';

function DashboardAdmin({ user, onLogout }) {
  const [stats, setStats] = useState(null);
  const [subscriptionStats, setSubscriptionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' ou 'abonnements'

  useEffect(() => {
    fetchStats();
    fetchSubscriptionStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Attendre un peu après le login pour s'assurer que la session est établie
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      // Si erreur 401/403, ne pas rediriger - continuer sans stats
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('Non autorisé à accéder aux statistiques - continuer sans stats');
        setStats({ totalCabinets: 0, totalUtilisateurs: 0, totalMedicaments: 0 });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionStats = async () => {
    try {
      const response = await api.get('/admin/abonnements/stats');
      setSubscriptionStats(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques d\'abonnements:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('Non autorisé à accéder aux statistiques d\'abonnements');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Administrateur</h1>
          
          {/* Onglets */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Vue d'ensemble
              </button>
              <button
                onClick={() => setActiveTab('abonnements')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'abonnements'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Abonnements
              </button>
            </nav>
          </div>

          {activeTab === 'overview' && (
            <>
              {loading ? (
                <div className="text-center py-12">Chargement...</div>
              ) : (
                <>
                  {/* Statistiques générales */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      <div className="text-sm opacity-90">Total Cabinets</div>
                      <div className="text-4xl font-bold mt-2">{stats?.totalCabinets || 0}</div>
                    </div>
                    
                    <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                      <div className="text-sm opacity-90">Total Utilisateurs</div>
                      <div className="text-4xl font-bold mt-2">{stats?.totalUtilisateurs || 0}</div>
                    </div>
                    
                    <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                      <div className="text-sm opacity-90">Total Médicaments</div>
                      <div className="text-4xl font-bold mt-2">{stats?.totalMedicaments || 0}</div>
                    </div>
                  </div>

                  {/* Statistiques des abonnements */}
                  {subscriptionStats && (
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold mb-4">Statistiques des Abonnements</h2>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                          <div className="text-sm opacity-90">Abonnements Actifs</div>
                          <div className="text-4xl font-bold mt-2">{subscriptionStats.abonnementsActifs || 0}</div>
                          <div className="text-xs opacity-75 mt-1">Services actifs</div>
                        </div>
                        
                        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
                          <div className="text-sm opacity-90">Abonnements Expirés</div>
                          <div className="text-4xl font-bold mt-2">{subscriptionStats.abonnementsExpires || 0}</div>
                          <div className="text-xs opacity-75 mt-1">Services bloqués</div>
                        </div>
                        
                        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                          <div className="text-sm opacity-90">À Renouveler</div>
                          <div className="text-4xl font-bold mt-2">{subscriptionStats.abonnementsARenouveler || 0}</div>
                          <div className="text-xs opacity-75 mt-1">Expirent dans 15 jours</div>
                        </div>
                        
                        <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                          <div className="text-sm opacity-90">Total Abonnements</div>
                          <div className="text-4xl font-bold mt-2">{subscriptionStats.totalAbonnements || 0}</div>
                          <div className="text-xs opacity-75 mt-1">Tous les cabinets</div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Link to="/admin/abonnements" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          → Voir la gestion complète des abonnements
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card">
                      <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
                      <div className="space-y-3">
                        <Link to="/admin/cabinets" className="block btn btn-primary w-full text-center">
                          Gérer les Cabinets
                        </Link>
                        <Link to="/admin/utilisateurs" className="block btn btn-secondary w-full text-center">
                          Gérer les Utilisateurs
                        </Link>
                        <Link to="/admin/abonnements" className="block btn btn-secondary w-full text-center">
                          Gérer les Abonnements
                        </Link>
                        <Link to="/admin/medicaments" className="block btn btn-secondary w-full text-center">
                          Gérer les Médicaments
                        </Link>
                      </div>
                    </div>
                    
                    <div className="card">
                      <h2 className="text-xl font-semibold mb-4">Informations</h2>
                      <div className="space-y-2 text-sm">
                        <p><strong>Rôle:</strong> Administrateur</p>
                        <p><strong>Portée:</strong> Tous les cabinets</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === 'abonnements' && (
            <div>
              <div className="mb-4">
                <Link to="/admin/abonnements" className="btn btn-primary">
                  Gérer les Abonnements
                </Link>
              </div>
              {subscriptionStats ? (
                <AbonnementsTable 
                  abonnements={subscriptionStats.abonnements || []} 
                  onRefresh={fetchSubscriptionStats}
                />
              ) : (
                <div className="text-center py-12">Chargement des abonnements...</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default DashboardAdmin;