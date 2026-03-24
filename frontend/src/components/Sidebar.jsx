import { Link, useLocation } from 'react-router-dom';

function Sidebar({ user }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [];

  // Menu selon le rôle
  if (user?.role === 'ROLE_ADMIN') {
    menuItems.push(
      { path: '/', label: 'Dashboard', icon: '📊' },
      { path: '/admin/cabinets', label: 'Cabinets', icon: '🏥' },
      { path: '/admin/utilisateurs', label: 'Utilisateurs', icon: '👤' },
      { path: '/admin/abonnements', label: 'Abonnements', icon: '📋' },
      { path: '/admin/medicaments', label: 'Médicaments', icon: '💊' }
    );
  } else if (user?.role === 'ROLE_DOCTOR') {
    menuItems.push(
      { path: '/', label: 'Dashboard', icon: '📊' },
      { path: '/file-attente', label: 'File d\'attente', icon: '📋' },
      { path: '/gestion-consultations', label: 'Consultations', icon: '🩺' },
      { path: '/patients', label: 'Patients', icon: '👥' },
      { path: '/rendez-vous', label: 'Rendez-vous', icon: '📅' },
      { path: '/factures', label: 'Factures', icon: '💳' }
    );
  } else if (user?.role === 'ROLE_SECR') {
    menuItems.push(
      { path: '/', label: 'Dashboard', icon: '📊' },
      { path: '/patients', label: 'Patients', icon: '👥' },
      { path: '/rendez-vous', label: 'Rendez-vous', icon: '📅' },
      { path: '/factures', label: 'Factures', icon: '💳' }
    );
  }

  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen border-r border-gray-200">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(item.path)
                ? 'bg-primary-50 text-primary-600 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;