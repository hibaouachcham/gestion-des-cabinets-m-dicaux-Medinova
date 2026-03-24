import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Création de l'instance axios
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important pour les sessions HTTP
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token CSRF
api.interceptors.request.use(
  async (config) => {
    // S'assurer que withCredentials est toujours true pour envoyer les cookies de session
    config.withCredentials = true;
    
    // S'assurer que le Content-Type est défini pour les requêtes POST/PUT avec body
    if (config.data && (config.method === 'post' || config.method === 'put' || config.method === 'patch')) {
      if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }
    }
    
    // Récupérer le token CSRF depuis le cookie
    const csrfToken = getCookie('XSRF-TOKEN');
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken;
    }
    
    // Log pour déboguer (peut être supprimé en production)
    if (process.env.NODE_ENV === 'development') {
      console.log('Requête API:', config.method?.toUpperCase(), config.url, {
        hasCsrfToken: !!csrfToken,
        withCredentials: config.withCredentials,
        contentType: config.headers['Content-Type'],
        hasData: !!config.data,
        data: config.data,
        cookies: document.cookie
      });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Variable pour suivre si on vient de se connecter
let justLoggedIn = false;

// Fonction pour marquer qu'on vient de se connecter
export const setJustLoggedIn = (value) => {
  justLoggedIn = value;
};

// Compteur pour éviter les redirections multiples
let redirectTimeout = null;
let last401Time = 0;

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const isLoginPage = window.location.pathname === '/login';
      const isAuthMe = error.config?.url?.includes('/auth/me');
      const isAuthLogin = error.config?.url?.includes('/auth/login');
      const isAuthCsrf = error.config?.url?.includes('/auth/csrf');
      
      // Ne jamais rediriger pour les requêtes d'authentification ou si déjà sur login
      if (isLoginPage || isAuthMe || isAuthLogin || isAuthCsrf) {
        return Promise.reject(error);
      }
      
      // Ne pas rediriger si on vient de se connecter (délai de grâce)
      if (justLoggedIn) {
        console.log('Erreur 401 ignorée - connexion récente');
        return Promise.reject(error);
      }
      
      // Pour les autres erreurs 401, vérifier la session AVANT de rediriger
      console.log('Erreur 401 détectée sur:', error.config?.url);
      console.log('Cookies actuels:', document.cookie);
      
      // Annuler le timeout précédent s'il existe
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
        redirectTimeout = null;
      }
      
      // Vérifier la session de manière synchrone pour éviter les redirections multiples
      try {
        const checkResponse = await api.get('/auth/me', {
          validateStatus: () => true // Accepter tous les codes de statut
        });
        
        if (checkResponse.status === 200 && checkResponse.data) {
          // La session est valide, l'erreur 401 était probablement due à un problème CSRF ou temporaire
          console.log('✅ Session valide confirmée, erreur 401 ignorée');
          return Promise.reject(error);
        } else {
          // La session n'est pas valide
          console.warn('❌ Session invalide (status:', checkResponse.status, ')');
          
          // Attendre 5 secondes avant de rediriger pour éviter les redirections prématurées
          redirectTimeout = setTimeout(() => {
            // Vérifier une dernière fois avant de rediriger
            if (window.location.pathname !== '/login' && !justLoggedIn) {
              api.get('/auth/me', { validateStatus: () => true }).then((finalCheck) => {
                if (finalCheck.status === 200 && finalCheck.data) {
                  console.log('✅ Session valide au dernier moment, annulation de la redirection');
                } else {
                  console.warn('❌ Session expirée confirmée, redirection vers /login');
                  window.location.href = '/login';
                }
              }).catch(() => {
                console.warn('❌ Erreur lors de la vérification finale, redirection vers /login');
                window.location.href = '/login';
              });
            }
          }, 5000); // 5 secondes au lieu de 3
        }
      } catch (checkError) {
        // Erreur lors de la vérification, ne pas rediriger immédiatement
        console.error('Erreur lors de la vérification de la session:', checkError);
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// Fonction utilitaire pour récupérer un cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Fonction pour récupérer le token CSRF depuis le serveur
export const fetchCsrfToken = async () => {
  try {
    const response = await api.get('/auth/csrf');
    return response.data.token;
  } catch (error) {
    console.error('Erreur lors de la récupération du token CSRF:', error);
    return null;
  }
};

export default api;