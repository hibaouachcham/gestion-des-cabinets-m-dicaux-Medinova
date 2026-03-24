import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // S'assurer que les données sont bien formatées
      const loginData = {
        username: username.trim(),
        password: password
      };
      
      console.log('Envoi de la requête de connexion:', { username: loginData.username, password: '***' });
      
      const response = await api.post('/auth/login', loginData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.data) {
        // Attendre un peu pour s'assurer que la session est créée côté serveur
        await new Promise(resolve => setTimeout(resolve, 300));
        onLogin(response.data);
        // Utiliser navigate au lieu de window.location pour éviter de perdre le state
        // Utiliser replace: true pour éviter de pouvoir revenir en arrière
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      if (err.response?.status === 401) {
        setError('Identifiants incorrects');
      } else if (err.response?.status === 400) {
        // Erreur de validation
        const fieldErrors = err.response.data?.fieldErrors;
        if (fieldErrors) {
          const errorMessages = Object.values(fieldErrors).join(', ');
          setError(errorMessages);
        } else if (err.response.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Données invalides. Veuillez vérifier vos informations.');
        }
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Erreur lors de la connexion. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <Link to="/home" className="inline-block mb-4">
            <h1 className="text-4xl font-bold text-primary-600 mb-2 hover:text-primary-700 transition-colors">
              Medinova
            </h1>
          </Link>
          <p className="text-gray-600 text-lg">La santé réinventée, l'innovation intégrée</p>
          <div className="w-16 h-1 bg-primary-500 mx-auto mt-3"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Nom d'utilisateur
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input"
              placeholder="Entrez votre nom d'utilisateur"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
              placeholder="Entrez votre mot de passe"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link 
            to="/home" 
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Retour à l'accueil
          </Link>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500 mb-3">Comptes de test :</p>
          <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
            <div className="bg-gray-50 p-2 rounded">
              <strong>Admin:</strong> admin / passwordAdmin
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <strong>Médecin:</strong> doctor / passwordDoc
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <strong>Secrétaire:</strong> secr / passwordSecr
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;