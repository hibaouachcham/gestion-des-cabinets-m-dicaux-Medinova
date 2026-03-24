import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

function ConsultationCompletePage({ user, onLogout }) {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [patient, setPatient] = useState(null);
  const [dossier, setDossier] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [activeTab, setActiveTab] = useState('nouvelle'); // 'nouvelle', 'historique', 'dossier'
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Formulaire de consultation
  const [formData, setFormData] = useState({
    motif: '',
    examenClinique: '',
    diagnostic: '',
    prescription: '',
    observations: ''
  });

  // Ordonnance médicaments
  const [ordonnanceMedicaments, setOrdonnanceMedicaments] = useState({
    instructions: '',
    lignes: []
  });
  const [medicamentSearch, setMedicamentSearch] = useState('');
  const [medicaments, setMedicaments] = useState([]);
  const [showMedicamentDropdown, setShowMedicamentDropdown] = useState(false);

  // Ordonnance examens
  const [examens, setExamens] = useState([]);
  const [nouvelExamen, setNouvelExamen] = useState({
    typeExamen: '',
    description: '',
    instructions: ''
  });

  // Édition de consultation
  const [editingConsultation, setEditingConsultation] = useState(null);
  const [editFormData, setEditFormData] = useState({
    motif: '',
    examenClinique: '',
    diagnostic: '',
    prescription: '',
    observations: ''
  });

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    } else {
      fetchCurrentPatient();
    }
  }, [patientId]);

  const fetchCurrentPatient = async () => {
    try {
      const response = await api.get('/patients/queue/current');
      if (response.status === 204) {
        showNotification('Aucun patient en file d\'attente', 'info');
        navigate('/patients');
      } else {
        navigate(`/consultation/${response.data.id}`);
      }
    } catch (error) {
      if (error.response?.status !== 204) {
        showNotification('Erreur: ' + (error.response?.data?.message || error.message), 'error');
      }
    }
  };

  const fetchPatientData = async () => {
    setLoadingData(true);
    try {
      const [patientRes, consultationsRes, dossierRes] = await Promise.all([
        api.get(`/patients/${patientId}`),
        api.get(`/consultations/patient/${patientId}`),
        api.get(`/dossiers/patient/${patientId}`).catch(() => null)
      ]);

      setPatient(patientRes.data);
      setConsultations(consultationsRes.data);
      if (dossierRes) {
        setDossier(dossierRes.data);
      }
    } catch (error) {
      showNotification('Erreur lors du chargement: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchMedicaments = async (query = '') => {
    try {
      const response = await api.get('/medicaments', { params: { q: query } });
      setMedicaments(response.data.slice(0, 10));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleMedicamentSearch = (value) => {
    setMedicamentSearch(value);
    if (value.length > 0) {
      fetchMedicaments(value);
      setShowMedicamentDropdown(true);
    } else {
      setShowMedicamentDropdown(false);
    }
  };

  const addMedicamentToOrdonnance = (medicament) => {
    const nouvelleLigne = {
      medicamentId: medicament.id,
      medicamentNom: medicament.nom,
      quantite: 1,
      posologie: '',
      duree: ''
    };
    setOrdonnanceMedicaments({
      ...ordonnanceMedicaments,
      lignes: [...ordonnanceMedicaments.lignes, nouvelleLigne]
    });
    setMedicamentSearch('');
    setShowMedicamentDropdown(false);
  };

  const updateLigneOrdonnance = (index, field, value) => {
    const nouvellesLignes = [...ordonnanceMedicaments.lignes];
    nouvellesLignes[index] = { ...nouvellesLignes[index], [field]: value };
    setOrdonnanceMedicaments({ ...ordonnanceMedicaments, lignes: nouvellesLignes });
  };

  const removeLigneOrdonnance = (index) => {
    const nouvellesLignes = ordonnanceMedicaments.lignes.filter((_, i) => i !== index);
    setOrdonnanceMedicaments({ ...ordonnanceMedicaments, lignes: nouvellesLignes });
  };

  const handleSubmitConsultation = async () => {
    if (!formData.diagnostic && !formData.motif) {
      showNotification('Veuillez remplir au moins le motif ou le diagnostic', 'error');
      return;
    }

    setLoading(true);
    try {
      const consultationRes = await api.post('/consultations', {
        patientId: parseInt(patientId),
        ...formData
      });

      const consultationId = consultationRes.data.id;

      // Créer l'ordonnance de médicaments si nécessaire
      if (ordonnanceMedicaments.lignes.length > 0) {
        await api.post('/ordonnances', {
          consultationId,
          instructions: ordonnanceMedicaments.instructions,
          lignes: ordonnanceMedicaments.lignes.map(l => ({
            medicamentId: l.medicamentId,
            quantite: l.quantite,
            posologie: l.posologie,
            duree: l.duree
          }))
        });
      }

      // Créer les examens complémentaires si nécessaire
      for (const examen of examens) {
        await api.post('/examens', {
          consultationId,
          typeExamen: examen.typeExamen,
          description: examen.description,
          instructions: examen.instructions
        });
      }

      showNotification('Consultation enregistrée avec succès', 'success');
      
      // Réinitialiser les formulaires
      setFormData({
        motif: '',
        examenClinique: '',
        diagnostic: '',
        prescription: '',
        observations: ''
      });
      setOrdonnanceMedicaments({ instructions: '', lignes: [] });
      setExamens([]);
      
      // Recharger les données
      fetchPatientData();
      setActiveTab('historique');
      
      // Rediriger vers le dashboard après 2 secondes pour voir le prochain patient
      setTimeout(() => {
        window.location.href = '/dashboard-doctor';
      }, 2000);
    } catch (error) {
      showNotification('Erreur: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const addExamen = () => {
    if (!nouvelExamen.typeExamen) {
      showNotification('Veuillez entrer un type d\'examen', 'error');
      return;
    }
    setExamens([...examens, { ...nouvelExamen }]);
    setNouvelExamen({ typeExamen: '', description: '', instructions: '' });
  };

  const removeExamen = (index) => {
    setExamens(examens.filter((_, i) => i !== index));
  };

  const handleGeneratePDF = async (ordonnanceId) => {
    try {
      const response = await api.get(`/ordonnances/${ordonnanceId}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ordonnance_${ordonnanceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showNotification('PDF généré avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la génération du PDF', 'error');
    }
  };

  const handleEditConsultation = (consultation) => {
    setEditingConsultation(consultation);
    setEditFormData({
      motif: consultation.motif || '',
      examenClinique: consultation.examenClinique || '',
      diagnostic: consultation.diagnostic || '',
      prescription: consultation.prescription || '',
      observations: consultation.observations || ''
    });
    setActiveTab('nouvelle'); // Passer à l'onglet nouvelle pour éditer
  };

  const handleUpdateConsultation = async () => {
    if (!editingConsultation) return;

    setLoading(true);
    try {
      await api.put(`/consultations/${editingConsultation.id}`, editFormData);
      showNotification('Consultation modifiée avec succès', 'success');
      setEditingConsultation(null);
      setEditFormData({
        motif: '',
        examenClinique: '',
        diagnostic: '',
        prescription: '',
        observations: ''
      });
      fetchPatientData();
      setActiveTab('historique');
    } catch (error) {
      showNotification('Erreur: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConsultation = async (consultationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette consultation ? Cette action est irréversible et supprimera aussi les ordonnances et examens associés.')) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/consultations/${consultationId}`);
      showNotification('Consultation supprimée avec succès', 'success');
      fetchPatientData();
    } catch (error) {
      showNotification('Erreur: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
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

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={onLogout} />
        <div className="flex">
          <Sidebar user={user} />
          <main className="flex-1 p-8">
            <div className="card text-center">
              <h2 className="text-xl font-semibold mb-4">Patient non trouvé</h2>
              <button onClick={() => navigate('/patients')} className="btn btn-primary">
                Retour aux patients
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
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Consultation</h1>
            <div className="card">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <strong>Nom:</strong> {patient.prenom} {patient.nom}
                </div>
                <div>
                  <strong>CIN:</strong> {patient.cin}
                </div>
                <div>
                  <strong>Téléphone:</strong> {patient.telephone || 'N/A'}
                </div>
                <div>
                  <strong>Email:</strong> {patient.email || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Onglets */}
          <div className="mb-6 border-b">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('nouvelle')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'nouvelle'
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Nouvelle Consultation
              </button>
              <button
                onClick={() => setActiveTab('historique')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'historique'
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Historique ({consultations.length})
              </button>
              <button
                onClick={() => setActiveTab('dossier')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'dossier'
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dossier Médical
              </button>
            </div>
          </div>

          {/* Contenu des onglets */}
          {activeTab === 'nouvelle' && (
            <div className="space-y-6">
              {editingConsultation && (
                <div className="card bg-blue-50 border-2 border-blue-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-blue-800">Mode édition</h3>
                      <p className="text-sm text-blue-600">Vous modifiez la consultation du {new Date(editingConsultation.dateConsultation).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingConsultation(null);
                        setEditFormData({
                          motif: '',
                          examenClinique: '',
                          diagnostic: '',
                          prescription: '',
                          observations: ''
                        });
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      Annuler l'édition
                    </button>
                  </div>
                </div>
              )}
              
              {/* Formulaire de consultation */}
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">
                  {editingConsultation ? 'Modifier la consultation' : 'Informations de consultation'}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motif de consultation
                    </label>
                    <textarea
                      value={editingConsultation ? editFormData.motif : formData.motif}
                      onChange={(e) => editingConsultation 
                        ? setEditFormData({ ...editFormData, motif: e.target.value })
                        : setFormData({ ...formData, motif: e.target.value })
                      }
                      className="input"
                      rows="3"
                      placeholder="Raison de la consultation..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Examen clinique
                    </label>
                    <textarea
                      value={editingConsultation ? editFormData.examenClinique : formData.examenClinique}
                      onChange={(e) => editingConsultation
                        ? setEditFormData({ ...editFormData, examenClinique: e.target.value })
                        : setFormData({ ...formData, examenClinique: e.target.value })
                      }
                      className="input"
                      rows="4"
                      placeholder="Résultats de l'examen clinique..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diagnostic *
                    </label>
                    <textarea
                      value={editingConsultation ? editFormData.diagnostic : formData.diagnostic}
                      onChange={(e) => editingConsultation
                        ? setEditFormData({ ...editFormData, diagnostic: e.target.value })
                        : setFormData({ ...formData, diagnostic: e.target.value })
                      }
                      className="input"
                      rows="3"
                      placeholder="Diagnostic..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observations
                    </label>
                    <textarea
                      value={editingConsultation ? editFormData.observations : formData.observations}
                      onChange={(e) => editingConsultation
                        ? setEditFormData({ ...editFormData, observations: e.target.value })
                        : setFormData({ ...formData, observations: e.target.value })
                      }
                      className="input"
                      rows="3"
                      placeholder="Observations supplémentaires..."
                    />
                  </div>
                </div>
              </div>

              {/* Ordonnance médicaments */}
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Ordonnance - Médicaments</h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rechercher un médicament
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={medicamentSearch}
                      onChange={(e) => handleMedicamentSearch(e.target.value)}
                      className="input"
                      placeholder="Nom ou code du médicament..."
                    />
                    {showMedicamentDropdown && medicaments.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                        {medicaments.map((med) => (
                          <div
                            key={med.id}
                            onClick={() => addMedicamentToOrdonnance(med)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium">{med.nom}</div>
                            <div className="text-sm text-gray-500">
                              {med.dosage} - {med.forme}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {ordonnanceMedicaments.lignes.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructions générales
                    </label>
                    <textarea
                      value={ordonnanceMedicaments.instructions}
                      onChange={(e) => setOrdonnanceMedicaments({ ...ordonnanceMedicaments, instructions: e.target.value })}
                      className="input"
                      rows="2"
                      placeholder="Instructions générales pour le patient..."
                    />
                  </div>
                )}

                {ordonnanceMedicaments.lignes.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium">Médicaments prescrits:</h3>
                    {ordonnanceMedicaments.lignes.map((ligne, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium">{ligne.medicamentNom}</div>
                          <button
                            onClick={() => removeLigneOrdonnance(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Quantité</label>
                            <input
                              type="number"
                              value={ligne.quantite}
                              onChange={(e) => updateLigneOrdonnance(index, 'quantite', parseInt(e.target.value))}
                              className="input input-sm"
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Posologie</label>
                            <input
                              type="text"
                              value={ligne.posologie}
                              onChange={(e) => updateLigneOrdonnance(index, 'posologie', e.target.value)}
                              className="input input-sm"
                              placeholder="Ex: 1 comprimé matin et soir"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Durée</label>
                            <input
                              type="text"
                              value={ligne.duree}
                              onChange={(e) => updateLigneOrdonnance(index, 'duree', e.target.value)}
                              className="input input-sm"
                              placeholder="Ex: 7 jours"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ordonnance examens complémentaires */}
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Ordonnance - Examens complémentaires</h2>
                
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type d'examen *
                    </label>
                    <input
                      type="text"
                      value={nouvelExamen.typeExamen}
                      onChange={(e) => setNouvelExamen({ ...nouvelExamen, typeExamen: e.target.value })}
                      className="input"
                      placeholder="Ex: Analyse sanguine, Radiographie..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={nouvelExamen.description}
                      onChange={(e) => setNouvelExamen({ ...nouvelExamen, description: e.target.value })}
                      className="input"
                      rows="2"
                      placeholder="Description de l'examen..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructions
                    </label>
                    <textarea
                      value={nouvelExamen.instructions}
                      onChange={(e) => setNouvelExamen({ ...nouvelExamen, instructions: e.target.value })}
                      className="input"
                      rows="2"
                      placeholder="Instructions pour le patient..."
                    />
                  </div>
                  <button
                    onClick={addExamen}
                    className="btn btn-secondary"
                  >
                    Ajouter l'examen
                  </button>
                </div>

                {examens.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Examens prescrits:</h3>
                    {examens.map((examen, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50 flex justify-between items-start">
                        <div>
                          <div className="font-medium">{examen.typeExamen}</div>
                          {examen.description && (
                            <div className="text-sm text-gray-600">{examen.description}</div>
                          )}
                          {examen.instructions && (
                            <div className="text-sm text-gray-500 mt-1">{examen.instructions}</div>
                          )}
                        </div>
                        <button
                          onClick={() => removeExamen(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bouton d'enregistrement */}
              <div className="flex justify-end gap-4">
                {editingConsultation && (
                  <button
                    onClick={() => {
                      setEditingConsultation(null);
                      setEditFormData({
                        motif: '',
                        examenClinique: '',
                        diagnostic: '',
                        prescription: '',
                        observations: ''
                      });
                    }}
                    className="btn btn-secondary"
                  >
                    Annuler l'édition
                  </button>
                )}
                <button
                  onClick={() => navigate('/patients')}
                  className="btn btn-secondary"
                >
                  {editingConsultation ? 'Fermer' : 'Annuler'}
                </button>
                <button
                  onClick={editingConsultation ? handleUpdateConsultation : handleSubmitConsultation}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading 
                    ? (editingConsultation ? 'Modification...' : 'Enregistrement...') 
                    : (editingConsultation ? 'Modifier la consultation' : 'Enregistrer la consultation')
                  }
                </button>
              </div>
            </div>
          )}

          {activeTab === 'historique' && (
            <div className="space-y-4">
              {consultations.length === 0 ? (
                <div className="card text-center py-8">
                  <p className="text-gray-600">Aucune consultation enregistrée pour ce patient</p>
                </div>
              ) : (
                consultations.map((consultation) => (
                  <div key={consultation.id} className="card">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          Consultation du {new Date(consultation.dateConsultation).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {consultation.motif && (
                        <div>
                          <strong>Motif:</strong> {consultation.motif}
                        </div>
                      )}
                      {consultation.examenClinique && (
                        <div>
                          <strong>Examen clinique:</strong> {consultation.examenClinique}
                        </div>
                      )}
                      {consultation.diagnostic && (
                        <div>
                          <strong>Diagnostic:</strong> {consultation.diagnostic}
                        </div>
                      )}
                      {consultation.observations && (
                        <div>
                          <strong>Observations:</strong> {consultation.observations}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => {
                          // Charger les ordonnances de cette consultation
                          api.get(`/ordonnances/consultation/${consultation.id}`)
                            .then(res => {
                              if (res.data.length > 0) {
                                handleGeneratePDF(res.data[0].id);
                              } else {
                                showNotification('Aucune ordonnance pour cette consultation', 'info');
                              }
                            })
                            .catch(err => showNotification('Erreur: ' + err.message, 'error'));
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        Voir ordonnance
                      </button>
                      <button
                        onClick={() => handleEditConsultation(consultation)}
                        className="btn btn-primary btn-sm"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteConsultation(consultation.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'dossier' && (
            <div className="card">
              {dossier ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Antécédents médicaux</h2>
                    <div className="space-y-2 text-sm">
                      {dossier.maladiesChroniques && (
                        <div>
                          <strong>Maladies chroniques:</strong> {dossier.maladiesChroniques}
                        </div>
                      )}
                      {dossier.allergies && (
                        <div>
                          <strong>Allergies:</strong> {dossier.allergies}
                        </div>
                      )}
                      {dossier.chirurgiesAnterieures && (
                        <div>
                          <strong>Chirurgies antérieures:</strong> {dossier.chirurgiesAnterieures}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <button
                      onClick={() => navigate(`/dossier/${patientId}`)}
                      className="btn btn-primary"
                    >
                      Voir le dossier complet
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Aucun dossier médical créé pour ce patient</p>
                  <button
                    onClick={() => navigate(`/creer-dossier/${patientId}`)}
                    className="btn btn-primary"
                  >
                    Créer le dossier médical
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ConsultationCompletePage;
