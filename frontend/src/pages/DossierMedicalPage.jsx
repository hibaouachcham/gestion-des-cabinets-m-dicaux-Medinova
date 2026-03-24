import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext.jsx';

function DossierMedicalPage({ user, onLogout }) {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dossier, setDossier] = useState(null);
  const [activeTab, setActiveTab] = useState('informations');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => {
    fetchDossier();
  }, [patientId]);

  const fetchDossier = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/dossiers/patient/${patientId}`);
      setDossier(response.data);
    } catch (error) {
      showNotification(
        'Erreur lors du chargement du dossier médical: ' +
          (error.response?.data?.message || error.message),
        'error'
      );
      navigate('/patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!dossier) return;
    setSaving(true);
    try {
      // Utiliser l'endpoint par patientId pour la mise à jour
      const updateData = {
        maladiesChroniques: dossier.maladiesChroniques,
        chirurgiesAnterieures: dossier.chirurgiesAnterieures,
        hospitalisationsAnterieures: dossier.hospitalisationsAnterieures,
        allergies: dossier.allergies,
        antecedentsFamiliaux: dossier.antecedentsFamiliaux,
        groupeSanguin: dossier.groupeSanguin,
        tailleCm: dossier.tailleCm,
        poidsKg: dossier.poidsKg,
        constantesBiologiques: dossier.constantesBiologiques,
        observationsGlobales: dossier.observationsGlobales,
        suiviLongTerme: dossier.suiviLongTerme,
        traitementsEnCours: dossier.traitementsEnCours?.map(t => ({
          nomMedicament: t.nomMedicament,
          dosage: t.dosage,
          frequence: t.frequence,
          duree: t.duree,
          notes: t.notes,
          dateDebut: t.dateDebut,
          dateFin: t.dateFin,
          actif: t.actif
        })) || []
      };
      
      const response = await api.put(`/dossiers/patient/${patientId}`, updateData);
      setDossier(response.data);
      showNotification('Dossier médical mis à jour avec succès', 'success');
    } catch (error) {
      showNotification(
        'Erreur lors de la mise à jour: ' +
          (error.response?.data?.message || error.message),
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', '');

      const response = await api.post(`/dossiers/${dossier.dossierId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setDossier(response.data);
      showNotification('Document ajouté avec succès', 'success');
      e.target.value = ''; // Reset input
    } catch (error) {
      showNotification('Erreur lors de l\'upload: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setUploadingDoc(false);
    }
  };

  const tabs = [
    { id: 'informations', label: 'Informations générales', icon: '📋' },
    { id: 'antecedents', label: 'Antécédents', icon: '🏥' },
    { id: 'traitements', label: 'Traitements', icon: '💊' },
    { id: 'consultations', label: 'Consultations', icon: '📝' },
    { id: 'documents', label: 'Documents', icon: '📎' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={onLogout} />
        <div className="flex">
          <Sidebar user={user} />
          <main className="flex-1 p-8">
            <div className="text-center py-12">Chargement du dossier médical...</div>
          </main>
        </div>
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onLogout={onLogout} />
        <div className="flex">
          <Sidebar user={user} />
          <main className="flex-1 p-8">
            <div className="card text-center">
              <h2 className="text-xl font-semibold mb-4">Dossier médical introuvable</h2>
              <button
                onClick={() => navigate('/patients')}
                className="btn btn-primary mt-2"
              >
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dossier médical</h1>
              <p className="text-gray-600 mt-1">
                {dossier.patientPrenom} {dossier.patientNom} — CIN: {dossier.patientCin}
              </p>
              {dossier.medecinResponsableNom && (
                <p className="text-sm text-gray-500 mt-1">
                  Médecin responsable: Dr. {dossier.medecinResponsablePrenom} {dossier.medecinResponsableNom}
                </p>
              )}
            </div>
            <button
              onClick={() => navigate('/patients')}
              className="btn btn-secondary"
            >
              Retour aux patients
            </button>
          </div>

          {/* Onglets */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="card">
            {/* ONGLET: Informations générales */}
            {activeTab === 'informations' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Informations administratives</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                    <p className="text-gray-900">{dossier.patientPrenom} {dossier.patientNom}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CIN</label>
                    <p className="text-gray-900">{dossier.patientCin || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                    <p className="text-gray-900">
                      {dossier.patientDateNaissance
                        ? new Date(dossier.patientDateNaissance).toLocaleDateString('fr-FR')
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
                    <p className="text-gray-900">{dossier.patientSexe === 'M' ? 'Masculin' : 'Féminin'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <p className="text-gray-900">{dossier.patientTelephone || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{dossier.patientEmail || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <p className="text-gray-900">
                      {dossier.patientAdresse || '-'} {dossier.patientVille ? `, ${dossier.patientVille}` : ''}
                    </p>
                  </div>
                </div>

                <h2 className="text-xl font-semibold mt-8 mb-4">Informations biologiques</h2>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Groupe sanguin</label>
                    <p className="text-gray-900">{dossier.groupeSanguin || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Taille</label>
                    <p className="text-gray-900">{dossier.tailleCm ? `${dossier.tailleCm} cm` : '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Poids</label>
                    <p className="text-gray-900">{dossier.poidsKg ? `${dossier.poidsKg} kg` : '-'}</p>
                  </div>
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Constantes biologiques</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{dossier.constantesBiologiques || '-'}</p>
                  </div>
                </div>

                <h2 className="text-xl font-semibold mt-8 mb-4">Notes médicales générales</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observations globales</label>
                    <textarea
                      value={dossier.observationsGlobales || ''}
                      onChange={(e) => setDossier({ ...dossier, observationsGlobales: e.target.value })}
                      className="input"
                      rows="4"
                      placeholder="Observations générales..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Suivi à long terme</label>
                    <textarea
                      value={dossier.suiviLongTerme || ''}
                      onChange={(e) => setDossier({ ...dossier, suiviLongTerme: e.target.value })}
                      className="input"
                      rows="3"
                      placeholder="Plan de suivi à long terme..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ONGLET: Antécédents */}
            {activeTab === 'antecedents' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Antécédents médicaux</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maladies chroniques
                    </label>
                    <textarea
                      value={dossier.maladiesChroniques || ''}
                      onChange={(e) => setDossier({ ...dossier, maladiesChroniques: e.target.value })}
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
                      value={dossier.chirurgiesAnterieures || ''}
                      onChange={(e) => setDossier({ ...dossier, chirurgiesAnterieures: e.target.value })}
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
                      value={dossier.hospitalisationsAnterieures || ''}
                      onChange={(e) => setDossier({ ...dossier, hospitalisationsAnterieures: e.target.value })}
                      className="input"
                      rows="3"
                      placeholder="Ex: Hospitalisation pour pneumonie en 2015..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                    <textarea
                      value={dossier.allergies || ''}
                      onChange={(e) => setDossier({ ...dossier, allergies: e.target.value })}
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
                      value={dossier.antecedentsFamiliaux || ''}
                      onChange={(e) => setDossier({ ...dossier, antecedentsFamiliaux: e.target.value })}
                      className="input"
                      rows="2"
                      placeholder="Ex: Diabète familial, Maladies cardiaques..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ONGLET: Traitements */}
            {activeTab === 'traitements' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Traitements en cours</h2>
                  <button
                    onClick={() => {
                      const nouveauTraitement = {
                        id: Date.now(), // ID temporaire
                        nomMedicament: '',
                        dosage: '',
                        frequence: '',
                        duree: '',
                        notes: '',
                        dateDebut: null,
                        dateFin: null,
                        actif: true
                      };
                      setDossier({
                        ...dossier,
                        traitementsEnCours: [...(dossier.traitementsEnCours || []), nouveauTraitement]
                      });
                    }}
                    className="btn btn-primary"
                  >
                    + Ajouter un traitement
                  </button>
                </div>
                {dossier.traitementsEnCours && dossier.traitementsEnCours.length > 0 ? (
                  <div className="space-y-4">
                    {dossier.traitementsEnCours.map((traitement, index) => (
                      <div key={traitement.id || index} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Médicament *
                            </label>
                            <input
                              type="text"
                              value={traitement.nomMedicament || ''}
                              onChange={(e) => {
                                const nouveauxTraitements = [...dossier.traitementsEnCours];
                                nouveauxTraitements[index] = { ...traitement, nomMedicament: e.target.value };
                                setDossier({ ...dossier, traitementsEnCours: nouveauxTraitements });
                              }}
                              className="input"
                              placeholder="Nom du médicament"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                            <input
                              type="text"
                              value={traitement.dosage || ''}
                              onChange={(e) => {
                                const nouveauxTraitements = [...dossier.traitementsEnCours];
                                nouveauxTraitements[index] = { ...traitement, dosage: e.target.value };
                                setDossier({ ...dossier, traitementsEnCours: nouveauxTraitements });
                              }}
                              className="input"
                              placeholder="Ex: 500mg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fréquence</label>
                            <input
                              type="text"
                              value={traitement.frequence || ''}
                              onChange={(e) => {
                                const nouveauxTraitements = [...dossier.traitementsEnCours];
                                nouveauxTraitements[index] = { ...traitement, frequence: e.target.value };
                                setDossier({ ...dossier, traitementsEnCours: nouveauxTraitements });
                              }}
                              className="input"
                              placeholder="Ex: 2 fois par jour"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
                            <input
                              type="text"
                              value={traitement.duree || ''}
                              onChange={(e) => {
                                const nouveauxTraitements = [...dossier.traitementsEnCours];
                                nouveauxTraitements[index] = { ...traitement, duree: e.target.value };
                                setDossier({ ...dossier, traitementsEnCours: nouveauxTraitements });
                              }}
                              className="input"
                              placeholder="Ex: 7 jours"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                              value={traitement.notes || ''}
                              onChange={(e) => {
                                const nouveauxTraitements = [...dossier.traitementsEnCours];
                                nouveauxTraitements[index] = { ...traitement, notes: e.target.value };
                                setDossier({ ...dossier, traitementsEnCours: nouveauxTraitements });
                              }}
                              className="input"
                              rows="2"
                              placeholder="Notes supplémentaires..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                            <input
                              type="date"
                              value={traitement.dateDebut || ''}
                              onChange={(e) => {
                                const nouveauxTraitements = [...dossier.traitementsEnCours];
                                nouveauxTraitements[index] = { ...traitement, dateDebut: e.target.value || null };
                                setDossier({ ...dossier, traitementsEnCours: nouveauxTraitements });
                              }}
                              className="input"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                            <input
                              type="date"
                              value={traitement.dateFin || ''}
                              onChange={(e) => {
                                const nouveauxTraitements = [...dossier.traitementsEnCours];
                                nouveauxTraitements[index] = { ...traitement, dateFin: e.target.value || null };
                                setDossier({ ...dossier, traitementsEnCours: nouveauxTraitements });
                              }}
                              className="input"
                            />
                          </div>
                          <div className="col-span-2 flex items-center justify-between">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={traitement.actif !== false}
                                onChange={(e) => {
                                  const nouveauxTraitements = [...dossier.traitementsEnCours];
                                  nouveauxTraitements[index] = { ...traitement, actif: e.target.checked };
                                  setDossier({ ...dossier, traitementsEnCours: nouveauxTraitements });
                                }}
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-700">Traitement actif</span>
                            </label>
                            <button
                              onClick={() => {
                                const nouveauxTraitements = dossier.traitementsEnCours.filter((_, i) => i !== index);
                                setDossier({ ...dossier, traitementsEnCours: nouveauxTraitements });
                              }}
                              className="btn btn-sm btn-secondary text-red-600"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucun traitement en cours</p>
                )}
              </div>
            )}

            {/* ONGLET: Consultations */}
            {activeTab === 'consultations' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Historique des consultations</h2>
                {dossier.consultations && dossier.consultations.length > 0 ? (
                  <div className="space-y-4">
                    {dossier.consultations.map((consultation) => (
                      <div key={consultation.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {new Date(consultation.dateConsultation).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </h3>
                            {consultation.medecinNom && (
                              <p className="text-sm text-gray-600">
                                Par Dr. {consultation.medecinPrenom} {consultation.medecinNom}
                              </p>
                            )}
                          </div>
                          {consultation.ordonnances && consultation.ordonnances.length > 0 && (
                            <div className="text-sm text-gray-500">
                              {consultation.ordonnances.length} ordonnance(s)
                            </div>
                          )}
                        </div>
                        <div className="space-y-2 text-sm">
                          {consultation.motif && (
                            <div>
                              <strong>Symptômes:</strong> {consultation.motif}
                            </div>
                          )}
                          {consultation.examenClinique && (
                            <div>
                              <strong>Examen physique:</strong> {consultation.examenClinique}
                            </div>
                          )}
                          {consultation.diagnostic && (
                            <div>
                              <strong>Diagnostic:</strong> {consultation.diagnostic}
                            </div>
                          )}
                          {consultation.prescription && (
                            <div>
                              <strong>Médicaments prescrits:</strong> {consultation.prescription}
                            </div>
                          )}
                          {consultation.observations && (
                            <div>
                              <strong>Observations:</strong> {consultation.observations}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucune consultation enregistrée</p>
                )}
              </div>
            )}

            {/* ONGLET: Documents */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Documents médicaux</h2>
                  <label className="btn btn-primary cursor-pointer">
                    {uploadingDoc ? 'Upload en cours...' : '+ Ajouter un document'}
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploadingDoc}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                  </label>
                </div>
                {dossier.documents && dossier.documents.length > 0 ? (
                  <div className="space-y-3">
                    {dossier.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium">{doc.nomFichier}</p>
                          <p className="text-sm text-gray-500">
                            {doc.type} • {doc.taille ? `${(doc.taille / 1024).toFixed(2)} KB` : '-'}
                            {doc.dateUpload && ` • ${new Date(doc.dateUpload).toLocaleDateString('fr-FR')}`}
                          </p>
                          {doc.description && (
                            <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            // Télécharger le document (à implémenter)
                            showNotification('Téléchargement du document', 'info');
                          }}
                          className="btn btn-secondary text-sm"
                        >
                          Télécharger
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucun document médical</p>
                )}
              </div>
            )}

            {/* Bouton Enregistrer (visible sur tous les onglets sauf Consultations et Documents) */}
            {activeTab !== 'consultations' && activeTab !== 'documents' && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DossierMedicalPage;