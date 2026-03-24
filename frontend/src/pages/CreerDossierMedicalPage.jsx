import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext.jsx';

function CreerDossierMedicalPage({ user, onLogout }) {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    // Antécédents médicaux
    maladiesChroniques: '',
    chirurgiesAnterieures: '',
    hospitalisationsAnterieures: '',
    allergies: '',
    antecedentsFamiliaux: '',
    // Informations biologiques
    groupeSanguin: '',
    tailleCm: '',
    poidsKg: '',
    constantesBiologiques: '',
    // Notes médicales
    observationsGlobales: '',
    suiviLongTerme: '',
    // Traitements en cours
    traitementsEnCours: []
  });

  useEffect(() => {
    fetchPatient();
  }, [patientId]);

  const fetchPatient = async () => {
    try {
      const response = await api.get(`/patients/${patientId}`);
      setPatient(response.data);
    } catch (error) {
      showNotification('Erreur lors du chargement du patient', 'error');
      navigate('/patients');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTraitement = () => {
    setFormData({
      ...formData,
      traitementsEnCours: [
        ...formData.traitementsEnCours,
        {
          nomMedicament: '',
          dosage: '',
          frequence: '',
          duree: '',
          notes: '',
          dateDebut: '',
          dateFin: ''
        }
      ]
    });
  };

  const handleRemoveTraitement = (index) => {
    const newTraitements = formData.traitementsEnCours.filter((_, i) => i !== index);
    setFormData({ ...formData, traitementsEnCours: newTraitements });
  };

  const handleTraitementChange = (index, field, value) => {
    const newTraitements = [...formData.traitementsEnCours];
    newTraitements[index][field] = value;
    setFormData({ ...formData, traitementsEnCours: newTraitements });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        patientId: parseInt(patientId),
        maladiesChroniques: formData.maladiesChroniques,
        chirurgiesAnterieures: formData.chirurgiesAnterieures,
        hospitalisationsAnterieures: formData.hospitalisationsAnterieures,
        allergies: formData.allergies,
        antecedentsFamiliaux: formData.antecedentsFamiliaux,
        groupeSanguin: formData.groupeSanguin,
        tailleCm: formData.tailleCm ? parseFloat(formData.tailleCm) : null,
        poidsKg: formData.poidsKg ? parseFloat(formData.poidsKg) : null,
        constantesBiologiques: formData.constantesBiologiques,
        observationsGlobales: formData.observationsGlobales,
        suiviLongTerme: formData.suiviLongTerme,
        traitementsEnCours: formData.traitementsEnCours.map(t => ({
          nomMedicament: t.nomMedicament,
          dosage: t.dosage,
          frequence: t.frequence,
          duree: t.duree,
          notes: t.notes,
          dateDebut: t.dateDebut || null,
          dateFin: t.dateFin || null
        }))
      };

      await api.post('/dossiers', payload);
      showNotification('Dossier médical créé avec succès', 'success');
      navigate(`/dossier/${patientId}`);
    } catch (error) {
      showNotification('Erreur: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={onLogout} />
        <div className="flex">
          <Sidebar user={user} />
          <main className="flex-1 p-8">
            <div className="text-center py-12">Chargement...</div>
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
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer un dossier médical</h1>
            {patient && (
              <p className="text-gray-600">
                Patient: <strong>{patient.prenom} {patient.nom}</strong> (CIN: {patient.cin})
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ANTÉCÉDENTS MÉDICAUX */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Antécédents médicaux</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maladies chroniques
                  </label>
                  <textarea
                    value={formData.maladiesChroniques}
                    onChange={(e) => setFormData({ ...formData, maladiesChroniques: e.target.value })}
                    className="input"
                    rows="3"
                    placeholder="Ex: Diabète, Hypertension..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chirurgies antérieures
                  </label>
                  <textarea
                    value={formData.chirurgiesAnterieures}
                    onChange={(e) => setFormData({ ...formData, chirurgiesAnterieures: e.target.value })}
                    className="input"
                    rows="3"
                    placeholder="Ex: Appendicectomie en 2010..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hospitalisations antérieures
                  </label>
                  <textarea
                    value={formData.hospitalisationsAnterieures}
                    onChange={(e) => setFormData({ ...formData, hospitalisationsAnterieures: e.target.value })}
                    className="input"
                    rows="3"
                    placeholder="Ex: Hospitalisation pour pneumonie en 2015..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allergies
                  </label>
                  <textarea
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    className="input"
                    rows="2"
                    placeholder="Ex: Pénicilline, Pollen..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Antécédents familiaux
                  </label>
                  <textarea
                    value={formData.antecedentsFamiliaux}
                    onChange={(e) => setFormData({ ...formData, antecedentsFamiliaux: e.target.value })}
                    className="input"
                    rows="2"
                    placeholder="Ex: Diabète familial, Maladies cardiaques..."
                  />
                </div>
              </div>
            </div>

            {/* INFORMATIONS BIOLOGIQUES */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Informations biologiques</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Groupe sanguin
                  </label>
                  <select
                    value={formData.groupeSanguin}
                    onChange={(e) => setFormData({ ...formData, groupeSanguin: e.target.value })}
                    className="input"
                  >
                    <option value="">Sélectionner</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taille (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.tailleCm}
                    onChange={(e) => setFormData({ ...formData, tailleCm: e.target.value })}
                    className="input"
                    placeholder="Ex: 175"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Poids (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.poidsKg}
                    onChange={(e) => setFormData({ ...formData, poidsKg: e.target.value })}
                    className="input"
                    placeholder="Ex: 70"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Constantes biologiques importantes
                </label>
                <textarea
                  value={formData.constantesBiologiques}
                  onChange={(e) => setFormData({ ...formData, constantesBiologiques: e.target.value })}
                  className="input"
                  rows="3"
                  placeholder="Ex: Glycémie à jeun: 5.5 mmol/L, Cholestérol total: 4.8 mmol/L..."
                />
              </div>
            </div>

            {/* TRAITEMENTS EN COURS */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Traitements en cours</h2>
                <button
                  type="button"
                  onClick={handleAddTraitement}
                  className="btn btn-secondary"
                >
                  + Ajouter un traitement
                </button>
              </div>
              {formData.traitementsEnCours.map((traitement, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">Traitement {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => handleRemoveTraitement(index)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom du médicament *
                      </label>
                      <input
                        type="text"
                        required
                        value={traitement.nomMedicament}
                        onChange={(e) => handleTraitementChange(index, 'nomMedicament', e.target.value)}
                        className="input"
                        placeholder="Ex: Paracétamol"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dosage
                      </label>
                      <input
                        type="text"
                        value={traitement.dosage}
                        onChange={(e) => handleTraitementChange(index, 'dosage', e.target.value)}
                        className="input"
                        placeholder="Ex: 500mg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fréquence
                      </label>
                      <input
                        type="text"
                        value={traitement.frequence}
                        onChange={(e) => handleTraitementChange(index, 'frequence', e.target.value)}
                        className="input"
                        placeholder="Ex: 3 fois par jour"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Durée
                      </label>
                      <input
                        type="text"
                        value={traitement.duree}
                        onChange={(e) => handleTraitementChange(index, 'duree', e.target.value)}
                        className="input"
                        placeholder="Ex: 7 jours"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        value={traitement.notes}
                        onChange={(e) => handleTraitementChange(index, 'notes', e.target.value)}
                        className="input"
                        rows="2"
                        placeholder="Notes supplémentaires..."
                      />
                    </div>
                  </div>
                </div>
              ))}
              {formData.traitementsEnCours.length === 0 && (
                <p className="text-gray-500 text-sm">Aucun traitement en cours pour le moment</p>
              )}
            </div>

            {/* NOTES MÉDICALES */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Notes médicales générales</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observations globales
                  </label>
                  <textarea
                    value={formData.observationsGlobales}
                    onChange={(e) => setFormData({ ...formData, observationsGlobales: e.target.value })}
                    className="input"
                    rows="4"
                    placeholder="Observations générales sur l'état de santé du patient..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Suivi à long terme
                  </label>
                  <textarea
                    value={formData.suiviLongTerme}
                    onChange={(e) => setFormData({ ...formData, suiviLongTerme: e.target.value })}
                    className="input"
                    rows="3"
                    placeholder="Plan de suivi à long terme..."
                  />
                </div>
              </div>
            </div>

            {/* BOUTONS */}
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
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? 'Création...' : 'Créer le dossier médical'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default CreerDossierMedicalPage;