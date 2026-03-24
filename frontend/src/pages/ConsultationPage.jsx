import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import AutocompleteMedicaments from '../components/AutocompleteMedicaments';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext.jsx';

function ConsultationPage({ user, onLogout }) {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [formData, setFormData] = useState({
    motif: '',
    examenClinique: '',
    diagnostic: '',
    prescription: '',
    observations: ''
  });
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentPatient();
  }, []);

  const fetchCurrentPatient = async () => {
    try {
      const response = await api.get('/patients/queue/current');
      if (response.status === 204) {
        setCurrentPatient(null);
      } else {
        setCurrentPatient(response.data);
      }
    } catch (error) {
      if (error.response?.status !== 204) {
        console.error('Erreur:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const consultation = await api.post('/consultations', null, {
        params: {
          patientId: currentPatient.id,
          motif: formData.motif,
          examenClinique: formData.examenClinique,
          diagnostic: formData.diagnostic,
          prescription: formData.prescription,
          observations: formData.observations
        }
      });

      showNotification('Consultation créée avec succès', 'success');
      setFormData({
        motif: '',
        examenClinique: '',
        diagnostic: '',
        prescription: '',
        observations: ''
      });
      fetchCurrentPatient();
    } catch (error) {
      showNotification('Erreur: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!currentPatient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={onLogout} />
        <div className="flex">
          <Sidebar user={user} />
          <main className="flex-1 p-8">
            <div className="card text-center">
              <h2 className="text-xl font-semibold mb-4">Aucun patient en file d'attente</h2>
              <p className="text-gray-600 mb-4">Veuillez sélectionner un patient depuis la liste des patients.</p>
              <button
                onClick={() => navigate('/patients')}
                className="btn btn-primary"
              >
                Voir les patients
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      <div className="flex">
        <Sidebar user={user} />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Consultation</h1>

          <div className="card mb-6">
            <h2 className="text-lg font-semibold mb-4">Patient en consultation</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <p><strong>Nom:</strong> {currentPatient.prenom} {currentPatient.nom}</p>
              <p><strong>CIN:</strong> {currentPatient.cin}</p>
              <p><strong>Téléphone:</strong> {currentPatient.telephone || 'N/A'}</p>
              <p><strong>Email:</strong> {currentPatient.email || 'N/A'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif de consultation
              </label>
              <textarea
                value={formData.motif}
                onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                className="input"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Examen clinique
              </label>
              <textarea
                value={formData.examenClinique}
                onChange={(e) => setFormData({ ...formData, examenClinique: e.target.value })}
                className="input"
                rows="4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnostic
              </label>
              <textarea
                value={formData.diagnostic}
                onChange={(e) => setFormData({ ...formData, diagnostic: e.target.value })}
                className="input"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prescription
              </label>
              <AutocompleteMedicaments
                value={formData.prescription}
                onChange={(value) => setFormData({ ...formData, prescription: value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observations
              </label>
              <textarea
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                className="input"
                rows="3"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/patients')}
                className="btn btn-secondary"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer la consultation'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default ConsultationPage;

