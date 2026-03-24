import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext.jsx';

function GestionUtilisateurs({ user, onLogout }) {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [cabinets, setCabinets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: 'ROLE_DOCTOR',
    cabinetId: '',
    active: true
  });
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, cabinetsRes] = await Promise.all([
        api.get('/admin/utilisateurs'),
        api.get('/admin/cabinets')
      ]);
      // S'assurer que les données sont des tableaux
      if (Array.isArray(usersRes.data)) {
        setUtilisateurs(usersRes.data);
      } else {
        console.error('Les données utilisateurs ne sont pas un tableau:', usersRes.data);
        setUtilisateurs([]);
      }
      if (Array.isArray(cabinetsRes.data)) {
        setCabinets(cabinetsRes.data);
      } else {
        console.error('Les données cabinets ne sont pas un tableau:', cabinetsRes.data);
        setCabinets([]);
      }
      } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      setUtilisateurs([]);
      setCabinets([]);
      showNotification('Erreur lors de la récupération des données', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Vérifier que les rôles DOCTOR et SECR sont bien affectés à un cabinet
      if ((formData.role === 'ROLE_DOCTOR' || formData.role === 'ROLE_SECR') && !formData.cabinetId) {
        showNotification('Pour un médecin ou une secrétaire, vous devez obligatoirement sélectionner un cabinet.', 'error');
        return;
      }

      const payload = {
        ...formData,
        cabinet: formData.cabinetId ? { id: parseInt(formData.cabinetId) } : null
      };
      delete payload.cabinetId;

      if (editingUser) {
        // Pour la modification, ne pas envoyer le mot de passe s'il est vide
        if (!formData.password || formData.password === '') {
          delete payload.password;
        }
        await api.put(`/admin/utilisateurs/${editingUser.id}`, payload);
        showNotification('Utilisateur modifié avec succès', 'success');
      } else {
        if (!formData.password || formData.password === '') {
          showNotification('Le mot de passe est requis pour un nouvel utilisateur', 'error');
          return;
        }
        await api.post('/admin/utilisateurs', payload);
        showNotification('Utilisateur créé avec succès', 'success');
      }
      setShowModal(false);
      setEditingUser(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showNotification(error.response?.data?.message || 'Erreur lors de la sauvegarde de l\'utilisateur', 'error');
    }
  };

  const handleEdit = (utilisateur) => {
    setEditingUser(utilisateur);
    setFormData({
      username: utilisateur.username || '',
      password: '', // Ne pas pré-remplir le mot de passe
      nom: utilisateur.nom || '',
      prenom: utilisateur.prenom || '',
      email: utilisateur.email || '',
      telephone: utilisateur.telephone || '',
      role: utilisateur.role || 'ROLE_DOCTOR',
      cabinetId: utilisateur.cabinetId?.toString() || '',
      active: utilisateur.active !== undefined ? utilisateur.active : true
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }
    try {
      await api.delete(`/admin/utilisateurs/${id}`);
      showNotification('Utilisateur supprimé avec succès', 'success');
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showNotification('Erreur lors de la suppression de l\'utilisateur', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      role: 'ROLE_DOCTOR',
      cabinetId: '',
      active: true
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    resetForm();
  };

  const getRoleLabel = (role) => {
    const labels = {
      'ROLE_ADMIN': 'Administrateur',
      'ROLE_DOCTOR': 'Médecin',
      'ROLE_SECR': 'Secrétaire'
    };
    return labels[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary"
            >
              + Nouvel Utilisateur
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">Chargement...</div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom d'utilisateur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prénom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cabinet</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(utilisateurs) && utilisateurs.length > 0 ? (
                    utilisateurs.map((utilisateur) => (
                      <tr key={utilisateur.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {utilisateur.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{utilisateur.nom}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{utilisateur.prenom}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{utilisateur.email || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getRoleLabel(utilisateur.role)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {utilisateur.cabinetNom || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            utilisateur.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {utilisateur.active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEdit(utilisateur)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(utilisateur.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucun utilisateur trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal de création/édition */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">
                  {editingUser ? 'Modifier l\'Utilisateur' : 'Nouvel Utilisateur'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur *</label>
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mot de passe {!editingUser && '*'}
                        {editingUser && <span className="text-xs text-gray-500">(laisser vide pour ne pas modifier)</span>}
                      </label>
                      <input
                        type="password"
                        required={!editingUser}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                      <input
                        type="text"
                        required
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                      <input
                        type="text"
                        required
                        value={formData.prenom}
                        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                      <input
                        type="text"
                        value={formData.telephone}
                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
                      <select
                        required
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="ROLE_DOCTOR">Médecin</option>
                        <option value="ROLE_SECR">Secrétaire</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cabinet</label>
                      <select
                        value={formData.cabinetId}
                        onChange={(e) => setFormData({ ...formData, cabinetId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Aucun cabinet</option>
                        {cabinets.map((cabinet) => (
                          <option key={cabinet.id} value={cabinet.id}>
                            {cabinet.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-700">Actif</span>
                    </label>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      {editingUser ? 'Modifier' : 'Créer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default GestionUtilisateurs;

