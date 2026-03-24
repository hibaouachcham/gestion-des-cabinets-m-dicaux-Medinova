import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

function RecherchePatientDoctor({ user, onLogout }) {
  const [searchType, setSearchType] = useState('cin'); // 'cin' ou 'nom'
  const [searchValue, setSearchValue] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      showNotification('Veuillez entrer une valeur de recherche', 'error');
      return;
    }

    setLoading(true);
    try {
      const params = searchType === 'cin' 
        ? { cin: searchValue.trim() }
        : { nom: searchValue.trim() };
      
      const response = await api.get('/patients/search', { params });
      setPatients(response.data);
      
      if (response.data.length === 0) {
        showNotification('Aucun patient trouvé', 'info');
      }
    } catch (error) {
      showNotification('Erreur lors de la recherche: ' + (error.response?.data?.message || error.message), 'error');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (patient) => {
    navigate(`/consultation/${patient.id}`);
  };

  const handleViewDossier = (patientId) => {
    navigate(`/dossier-medical/${patientId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Rechercher un Patient</h1>

          <div className="card mb-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de recherche
                  </label>
                  <select
                    value={searchType}
                    onChange={(e) => {
                      setSearchType(e.target.value);
                      setSearchValue('');
                      setPatients([]);
                    }}
                    className="input"
                  >
                    <option value="cin">CIN</option>
                    <option value="nom">Nom</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {searchType === 'cin' ? 'CIN' : 'Nom'}
                  </label>
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="input"
                    placeholder={searchType === 'cin' ? 'Ex: AB123456' : 'Ex: Benali'}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Recherche...' : 'Rechercher'}
                </button>
              </div>
            </form>
          </div>

          {patients.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Résultats de la recherche</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">CIN</th>
                      <th className="text-left p-3">Nom</th>
                      <th className="text-left p-3">Prénom</th>
                      <th className="text-left p-3">Téléphone</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{patient.cin}</td>
                        <td className="p-3">{patient.nom}</td>
                        <td className="p-3">{patient.prenom}</td>
                        <td className="p-3">{patient.telephone || 'N/A'}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSelectPatient(patient)}
                              className="btn btn-primary btn-sm"
                            >
                              Consulter
                            </button>
                            <button
                              onClick={() => handleViewDossier(patient.id)}
                              className="btn btn-secondary btn-sm"
                            >
                              Dossier
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default RecherchePatientDoctor;