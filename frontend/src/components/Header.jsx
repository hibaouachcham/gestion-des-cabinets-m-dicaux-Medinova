import { Link } from 'react-router-dom';

function Header({ user, onLogout }) {
  const getRoleLabel = (role) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'Administrateur';
      case 'ROLE_DOCTOR':
        return 'Médecin';
      case 'ROLE_SECR':
        return 'Secrétaire';
      default:
        return role;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              Medinova
            </Link>
            <span className="ml-4 text-sm text-gray-500">
              {user?.cabinetNom || 'Cabinet Médical'}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-gray-500">{getRoleLabel(user?.role)}</p>
            </div>
            <button
              onClick={onLogout}
              className="btn btn-secondary text-sm"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

