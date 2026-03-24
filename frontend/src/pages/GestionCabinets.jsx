import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext.jsx';

function GestionCabinets({ user, onLogout }) {
  const [cabinets, setCabinets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCabinet, setEditingCabinet] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    telephone: '',
    email: '',
    ville: '',
    codePostal: '',
    // Options d'abonnement
    creerAbonnement: false,
    typeAbonnement: 'PREMIUM',
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 an par défaut
    abonnementActif: true
  });
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchCabinets();
  }, []);

  const fetchCabinets = async () => {
    try {
      const response = await api.get('/admin/cabinets');
      // S'assurer que response.data est un tableau
      if (Array.isArray(response.data)) {
        setCabinets(response.data);
      } else {
        console.error('Les données reçues ne sont pas un tableau:', response.data);
        setCabinets([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des cabinets:', error);
      setCabinets([]);
      showNotification('Erreur lors de la récupération des cabinets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCabinet) {
        // Pour la modification, on envoie seulement les données du cabinet
        const cabinetData = {
          nom: formData.nom,
          adresse: formData.adresse,
          telephone: formData.telephone,
          email: formData.email,
          ville: formData.ville,
          codePostal: formData.codePostal
        };
        await api.put(`/admin/cabinets/${editingCabinet.id}`, cabinetData);
        showNotification('Cabinet modifié avec succès', 'success');
      } else {
        // Pour la création, on inclut l'abonnement si demandé
        const cabinetData = {
          nom: formData.nom,
          adresse: formData.adresse,
          telephone: formData.telephone,
          email: formData.email,
          ville: formData.ville,
          codePostal: formData.codePostal
        };
        
        if (formData.creerAbonnement) {
          cabinetData.abonnement = {
            type: formData.typeAbonnement,
            dateDebut: formData.dateDebut,
            dateFin: formData.dateFin,
            actif: formData.abonnementActif
          };
        }
        
        await api.post('/admin/cabinets', cabinetData);
        showNotification('Cabinet créé avec succès', 'success');
      }
      setShowModal(false);
      setEditingCabinet(null);
      resetForm();
      fetchCabinets();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showNotification(error.response?.data?.message || 'Erreur lors de la sauvegarde du cabinet', 'error');
    }
  };
  
  const resetForm = () => {
    setFormData({
      nom: '',
      adresse: '',
      telephone: '',
      email: '',
      ville: '',
      codePostal: '',
      creerAbonnement: false,
      typeAbonnement: 'PREMIUM',
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      abonnementActif: true
    });
  };

  const handleEdit = (cabinet) => {
    setEditingCabinet(cabinet);
    setFormData({
      nom: cabinet.nom || '',
      adresse: cabinet.adresse || '',
      telephone: cabinet.telephone || '',
      email: cabinet.email || '',
      ville: cabinet.ville || '',
      codePostal: cabinet.codePostal || '',
      // Pour l'édition, on ne modifie pas l'abonnement ici
      creerAbonnement: false,
      typeAbonnement: 'PREMIUM',
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      abonnementActif: true
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce cabinet ?')) {
      return;
    }
    try {
      await api.delete(`/admin/cabinets/${id}`);
      showNotification('Cabinet supprimé avec succès', 'success');
      fetchCabinets();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showNotification('Erreur lors de la suppression du cabinet', 'error');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCabinet(null);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Cabinets</h1>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary"
            >
              + Nouveau Cabinet
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">Chargement...</div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adresse</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ville</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(cabinets) && cabinets.length > 0 ? (
                    cabinets.map((cabinet) => (
                      <tr key={cabinet.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {cabinet.nom}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{cabinet.adresse}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cabinet.telephone || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cabinet.email || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cabinet.ville || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEdit(cabinet)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(cabinet.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucun cabinet trouvé
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
                  {editingCabinet ? 'Modifier le Cabinet' : 'Nouveau Cabinet'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                    <input
                      type="text"
                      required
                      value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                      <input
                        type="text"
                        value={formData.telephone}
                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                      <input
                        type="text"
                        value={formData.ville}
                        onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Code Postal</label>
                      <input
                        type="text"
                        value={formData.codePostal}
                        onChange={(e) => setFormData({ ...formData, codePostal: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  {/* Options d'abonnement - uniquement pour la création */}
                  {!editingCabinet && (
                    <div className="border-t pt-4 mt-4">
                      <div className="mb-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.creerAbonnement}
                            onChange={(e) => setFormData({ ...formData, creerAbonnement: e.target.checked })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm font-medium text-gray-700">Créer un abonnement pour ce cabinet</span>
                        </label>
                      </div>
                      
                      {formData.creerAbonnement && (
                        <div className="space-y-4 bg-gray-50 p-4 rounded-md">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Type d'abonnement *</label>
                              <select
                                required={formData.creerAbonnement}
                                value={formData.typeAbonnement}
                                onChange={(e) => setFormData({ ...formData, typeAbonnement: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              >
                                <option value="BASIC">Basic</option>
                                <option value="PREMIUM">Premium</option>
                                <option value="ENTERPRISE">Enterprise</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Statut *</label>
                              <select
                                required={formData.creerAbonnement}
                                value={formData.abonnementActif ? 'true' : 'false'}
                                onChange={(e) => setFormData({ ...formData, abonnementActif: e.target.value === 'true' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              >
                                <option value="true">Actif</option>
                                <option value="false">Inactif</option>
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
                              <input
                                type="date"
                                required={formData.creerAbonnement}
                                value={formData.dateDebut}
                                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin *</label>
                              <input
                                type="date"
                                required={formData.creerAbonnement}
                                value={formData.dateFin}
                                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                                min={formData.dateDebut}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
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
                      {editingCabinet ? 'Modifier' : 'Créer'}
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

export default GestionCabinets;

