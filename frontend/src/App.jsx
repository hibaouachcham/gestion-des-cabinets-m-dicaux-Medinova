import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardDoctor from './pages/DashboardDoctor';
import DashboardSecretary from './pages/DashboardSecretary';
import PatientsPage from './pages/PatientsPage';
import RendezVousPage from './pages/RendezVousPage';
import ConsultationPage from './pages/ConsultationPage';
import ConsultationCompletePage from './pages/ConsultationCompletePage';
import DossierMedicalPage from './pages/DossierMedicalPage';
import CreerDossierMedicalPage from './pages/CreerDossierMedicalPage';
import RecherchePatientDoctor from './pages/RecherchePatientDoctor';
import FileAttentePage from './pages/FileAttentePage';
import GestionConsultationsPage from './pages/GestionConsultationsPage';
import FacturesPage from './pages/FacturesPage';
import GestionCabinets from './pages/GestionCabinets';
import GestionUtilisateurs from './pages/GestionUtilisateurs';
import GestionAbonnements from './pages/GestionAbonnements';
import GestionMedicaments from './pages/GestionMedicaments';
import api, { fetchCsrfToken, setJustLoggedIn } from './services/api';
import './styles/index.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer le token CSRF au démarrage
    fetchCsrfToken();
    
    // Vérifier si l'utilisateur est déjà authentifié
    checkAuth();
  }, []); // Ne pas re-vérifier à chaque changement de route

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.status === 200 && response.data) {
        console.log('✅ Utilisateur authentifié:', response.data);
        setUser(response.data);
      } else {
        console.log('❌ Pas de données utilisateur dans la réponse');
        setUser(null);
      }
    } catch (error) {
      // 401 est normal si l'utilisateur n'est pas connecté
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('❌ Non authentifié (401/403)');
        setUser(null);
      } else {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (userData) => {
    // Marquer qu'on vient de se connecter pour éviter les vérifications immédiates
    // Cela empêche l'intercepteur axios de rediriger immédiatement en cas d'erreur 401
    setJustLoggedIn(true);
    
    // Mettre à jour l'utilisateur immédiatement
    setUser(userData);
    
    // Vérifier que la session est bien créée
    setTimeout(async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data) {
          console.log('✅ Session vérifiée après login');
          setUser(response.data);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification de la session après login:', error);
      }
    }, 500);
    
    // Réinitialiser le flag après un délai plus long pour permettre les vérifications normales
    setTimeout(() => {
      setJustLoggedIn(false);
      console.log('Flag justLoggedIn réinitialisé');
    }, 10000); // 10 secondes au lieu de 3
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  const ProtectedRoute = ({ children, allowedRoles }) => {
    // Si on est encore en train de charger, attendre
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Chargement...</div>
        </div>
      );
    }
    
    // Si pas d'utilisateur, rediriger vers login
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    // Si des rôles sont spécifiés et que l'utilisateur n'a pas le bon rôle, rediriger vers le dashboard
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
    
    return children;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  const getDashboard = () => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    switch (user.role) {
      case 'ROLE_ADMIN':
        return <DashboardAdmin user={user} onLogout={handleLogout} />;
      case 'ROLE_DOCTOR':
        return <DashboardDoctor user={user} onLogout={handleLogout} />;
      case 'ROLE_SECR':
        return <DashboardSecretary user={user} onLogout={handleLogout} />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/home" 
          element={<HomePage />} 
        />
        <Route 
          path="/login" 
          element={
            loading ? (
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Chargement...</div>
              </div>
            ) : user ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              {getDashboard()}
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/patients" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_DOCTOR', 'ROLE_SECR']}>
              <PatientsPage user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/dossier/:patientId"
          element={
            <ProtectedRoute allowedRoles={['ROLE_DOCTOR']}>
              <DossierMedicalPage user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creer-dossier/:patientId"
          element={
            <ProtectedRoute allowedRoles={['ROLE_DOCTOR']}>
              <CreerDossierMedicalPage user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/rendez-vous" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_DOCTOR', 'ROLE_SECR']}>
              <RendezVousPage user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/consultation" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_DOCTOR']}>
              <ConsultationPage user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/consultation/:patientId" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_DOCTOR']}>
              <ConsultationCompletePage user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recherche-patient" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_DOCTOR']}>
              <RecherchePatientDoctor user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/file-attente" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_DOCTOR']}>
              <FileAttentePage user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/gestion-consultations" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_DOCTOR']}>
              <GestionConsultationsPage user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/factures" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_DOCTOR', 'ROLE_SECR']}>
              <FacturesPage user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/cabinets" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <GestionCabinets user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/utilisateurs" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <GestionUtilisateurs user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/abonnements" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <GestionAbonnements user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/medicaments" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <GestionMedicaments user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        {/* Route par défaut - Dashboard si connecté, Home sinon */}
        <Route 
          path="/" 
          element={
            loading ? (
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Chargement...</div>
              </div>
            ) : user ? (
              <ProtectedRoute>
                {getDashboard()}
              </ProtectedRoute>
            ) : (
              <Navigate to="/home" replace />
            )
          } 
        />
        <Route 
          path="*" 
          element={
            <ProtectedRoute>
              {user ? <Navigate to="/" replace /> : <Navigate to="/home" replace />}
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;