import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

function AutocompleteMedicaments({ value, onChange }) {
  const [medicaments, setMedicaments] = useState([]);
  const [filteredMedicaments, setFilteredMedicaments] = useState([]);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    fetchMedicaments();
  }, []);

  useEffect(() => {
    if (search.length > 0) {
      fetchMedicaments(search);
      setShowDropdown(true);
    } else {
      setFilteredMedicaments([]);
      setShowDropdown(false);
    }
  }, [search]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchMedicaments = async (query = '') => {
    try {
      const response = await api.get('/medicaments', {
        params: { q: query }
      });
      setFilteredMedicaments(response.data.slice(0, 10)); // Limiter à 10 résultats
    } catch (error) {
      console.error('Erreur lors de la récupération des médicaments:', error);
    }
  };

  const handleSelect = (medicament) => {
    const newValue = value 
      ? `${value}\n${medicament.nom} - ${medicament.dosage || 'N/A'}`
      : `${medicament.nom} - ${medicament.dosage || 'N/A'}`;
    onChange(newValue);
    setSearch('');
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => search && setShowDropdown(true)}
        placeholder="Rechercher un médicament..."
        className="input mb-2"
      />
      
      {showDropdown && filteredMedicaments.length > 0 && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredMedicaments.map((medicament) => (
            <div
              key={medicament.id}
              onClick={() => handleSelect(medicament)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium">{medicament.nom}</div>
              <div className="text-sm text-gray-500">
                {medicament.dosage} - {medicament.forme}
              </div>
            </div>
          ))}
        </div>
      )}

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Prescription (saisissez manuellement ou utilisez l'autocomplétion ci-dessus)"
        className="input"
        rows="6"
      />
    </div>
  );
}

export default AutocompleteMedicaments;

