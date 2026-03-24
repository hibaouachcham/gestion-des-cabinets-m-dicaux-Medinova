import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext.jsx';

function GestionMedicaments({ user, onLogout }) {
  const [medicaments, setMedicaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchMedicaments();
  }, []);

  const fetchMedicaments = async () => {
    try {
      const response = await api.get('/admin/medicaments');
      // S'assurer que response.data est un tableau
      if (Array.isArray(response.data)) {
        setMedicaments(response.data);
      } else {
        console.error('Les données reçues ne sont pas un tableau:', response.data);
        setMedicaments([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des médicaments:', error);
      setMedicaments([]);
      showNotification('Erreur lors de la récupération des médicaments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      // Parser le JSON
      const medicamentsToImport = JSON.parse(importData);
      
      if (!Array.isArray(medicamentsToImport)) {
        showNotification('Le format JSON doit être un tableau de médicaments', 'error');
        return;
      }

      await api.post('/admin/medicaments/import', medicamentsToImport);
      showNotification(`${medicamentsToImport.length} médicaments importés avec succès`, 'success');
      setShowImportModal(false);
      setImportData('');
      fetchMedicaments();
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      if (error.response?.status === 400) {
        showNotification('Format JSON invalide', 'error');
      } else {
        showNotification('Erreur lors de l\'import des médicaments', 'error');
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImportData(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Médicaments</h1>
            <button
              onClick={() => setShowImportModal(true)}
              className="btn btn-primary"
            >
              + Importer des Médicaments
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">Chargement...</div>
          ) : (
            <div className="card overflow-x-auto">
              <div className="mb-4 text-sm text-gray-600">
                Total: {medicaments.length} médicament(s)
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Forme</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dosage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disponible</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(medicaments) && medicaments.length > 0 ? (
                    medicaments.map((medicament) => (
                      <tr key={medicament.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {medicament.code}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{medicament.nom}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{medicament.forme || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{medicament.dosage || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {medicament.prix ? `${medicament.prix} MAD` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            medicament.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {medicament.disponible ? 'Oui' : 'Non'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucun médicament trouvé. Importez des médicaments pour commencer.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal d'import */}
          {showImportModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">Importer des Médicaments</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Format JSON (tableau de médicaments)
                    </label>
                    <div className="mb-2">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="text-sm"
                      />
                    </div>
                    <textarea
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      placeholder='[{"code": "MED001", "nom": "Paracétamol", "forme": "Comprimé", "dosage": "500mg", "prix": 5.50, "disponible": true}, ...]'
                      className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                      rows="10"
                    />
                  </div>
                  <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800">
                    <strong>Format attendu:</strong> Un tableau JSON d'objets médicaments avec les propriétés: code, nom, forme, dosage, prix, disponible
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowImportModal(false);
                        setImportData('');
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleImport}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Importer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default GestionMedicaments;

