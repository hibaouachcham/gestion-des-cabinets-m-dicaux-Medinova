import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function HomePage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header avec navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl font-bold text-primary-600">Medinova</div>
              <div className="text-sm text-gray-600 hidden md:block">Cabinet Médical</div>
            </div>
            <Link
              to="/login"
              className="btn btn-primary"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-center">
          <div className="mb-6">
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-4 animate-fade-in">
              Medinova
            </h1>
            <div className="w-24 h-1 bg-primary-500 mx-auto mb-6"></div>
            <p className="text-2xl md:text-3xl text-gray-700 font-light mb-2">
              La santé réinventée,
            </p>
            <p className="text-2xl md:text-3xl text-primary-600 font-semibold">
              l'innovation intégrée
            </p>
          </div>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Parce que chaque patient mérite une prise en charge claire, rapide et sécurisée.
            <br />
            Parce que chaque professionnel mérite un outil à la hauteur de ses exigences.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="btn btn-primary btn-lg px-8 py-4 text-lg"
            >
              Commencer maintenant
            </Link>
            <a
              href="#about"
              className="btn btn-secondary btn-lg px-8 py-4 text-lg"
            >
              En savoir plus
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Une solution complète pour votre cabinet
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Gestion des Patients</h3>
              <p className="text-gray-600">
                Dossiers médicaux complets, historique des consultations, suivi personnalisé
              </p>
            </div>
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">🩺</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Consultations</h3>
              <p className="text-gray-600">
                Saisie rapide, ordonnances numériques, examens complémentaires
              </p>
            </div>
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">File d'Attente</h3>
              <p className="text-gray-600">
                Gestion intelligente, suivi en temps réel, optimisation du flux
              </p>
            </div>
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Rendez-vous</h3>
              <p className="text-gray-600">
                Planification facile, rappels automatiques, gestion des disponibilités
              </p>
            </div>
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">💊</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Ordonnances</h3>
              <p className="text-gray-600">
                Génération PDF, signature numérique, historique complet
              </p>
            </div>
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-4">💳</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Facturation</h3>
              <p className="text-gray-600">
                Factures automatiques, suivi des paiements, statistiques financières
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-gradient-to-br from-primary-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">À propos de nous</h2>
            <div className="w-24 h-1 bg-primary-500 mx-auto"></div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                <strong className="text-primary-600">Medinova</strong> est une solution intelligente conçue pour simplifier la gestion des cabinets médicaux. Elle allie sécurité, fluidité et performance pour accompagner les professionnels de santé dans leur quotidien.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Notre mission : offrir une plateforme intuitive, fiable et évolutive pour une médecine moderne et connectée.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">🔒</div>
                  <h4 className="font-semibold mb-2">Sécurisé</h4>
                  <p className="text-sm text-gray-600">Protection des données médicales</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">⚡</div>
                  <h4 className="font-semibold mb-2">Rapide</h4>
                  <p className="text-sm text-gray-600">Interface fluide et intuitive</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">📈</div>
                  <h4 className="font-semibold mb-2">Performant</h4>
                  <p className="text-sm text-gray-600">Optimisé pour votre productivité</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
              <div className="text-gray-600">Sécurisé</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">24/7</div>
              <div className="text-gray-600">Disponible</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">1000+</div>
              <div className="text-gray-600">Utilisateurs</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Prêt à transformer votre cabinet médical ?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Rejoignez les professionnels de santé qui font confiance à Medinova
          </p>
          <Link
            to="/login"
            className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg px-8 py-4 text-lg font-semibold"
          >
            Démarrer maintenant
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Medinova</h3>
              <p className="text-gray-400">
                La solution intelligente pour la gestion des cabinets médicaux.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white">À propos</a></li>
                <li><Link to="/login" className="hover:text-white">Connexion</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-gray-400">
                support@medinova.com
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Medinova. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;