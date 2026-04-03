import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MapPin, Loader2 } from 'lucide-react';
import { getAllStates, getDistrictsByState, getPincodesByDistrict } from '../../services/api';
import ResultCard from '../ui/ResultCard';
import SkeletonCard from '../ui/SkeletonCard';
import EmptyState from '../ui/EmptyState';

export default function StateExplorer({ favorites, onToggleFavorite }) {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [pincodes, setPincodes] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingPincodes, setLoadingPincodes] = useState(false);
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');

  // Fetch all states on mount
  useEffect(() => {
    const fetchStates = async () => {
      setLoadingStates(true);
      try {
        const data = await getAllStates();
        setStates(Array.isArray(data) ? data : data.states || []);
      } catch {
        setStates([]);
      } finally {
        setLoadingStates(false);
      }
    };
    fetchStates();
  }, []);

  // Fetch districts when a state is selected
  useEffect(() => {
    if (!selectedState) {
      setDistricts([]);
      return;
    }
    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      setSelectedDistrict('');
      setPincodes([]);
      try {
        const data = await getDistrictsByState(selectedState);
        setDistricts(Array.isArray(data) ? data : data.districts || []);
      } catch {
        setDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    };
    fetchDistricts();
  }, [selectedState]);

  // Fetch pincodes when a district is selected
  useEffect(() => {
    if (!selectedDistrict) {
      setPincodes([]);
      return;
    }
    const fetchPincodes = async () => {
      setLoadingPincodes(true);
      try {
        const data = await getPincodesByDistrict(selectedDistrict);
        setPincodes(Array.isArray(data) ? data : data.pincodes || data.data || []);
      } catch {
        setPincodes([]);
      } finally {
        setLoadingPincodes(false);
      }
    };
    fetchPincodes();
  }, [selectedDistrict]);

  const filteredStates = states.filter((s) => {
    const name = typeof s === 'string' ? s : s.state || s.State || s.name || '';
    return name.toLowerCase().includes(stateSearch.toLowerCase());
  });

  const filteredDistricts = districts.filter((d) => {
    const name = typeof d === 'string' ? d : d.district || d.District || d.name || '';
    return name.toLowerCase().includes(districtSearch.toLowerCase());
  });

  const getStateName = (s) => typeof s === 'string' ? s : s.state || s.State || s.name || '';
  const getDistrictName = (d) => typeof d === 'string' ? d : d.district || d.District || d.name || '';

  const isFav = useCallback(
    (item) => {
      const pin = item.pincode || item.Pincode || '';
      return favorites.some((f) => (f.pincode || f.Pincode) === pin);
    },
    [favorites]
  );

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* State Dropdown */}
        <div className="relative flex-1">
          <button
            onClick={() => { setStateDropdownOpen(!stateDropdownOpen); setDistrictDropdownOpen(false); }}
            className="w-full glass-card !rounded-xl px-4 py-3.5 flex items-center justify-between text-left hover:shadow-lg transition-all duration-300"
          >
            <span className={`text-sm font-medium ${selectedState ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
              {selectedState || 'Select State'}
            </span>
            <div className="flex items-center gap-2">
              {loadingStates && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${stateDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>
          <AnimatePresence>
            {stateDropdownOpen && (
              <motion.div
                className="absolute z-40 mt-2 w-full glass-card !rounded-xl overflow-hidden max-h-72"
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-2 border-b border-slate-200/60 dark:border-slate-700/60">
                  <input
                    type="text"
                    value={stateSearch}
                    onChange={(e) => setStateSearch(e.target.value)}
                    placeholder="Search states..."
                    className="w-full px-3 py-2 text-sm bg-slate-100/80 dark:bg-slate-800/80 rounded-lg outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto max-h-56">
                  {filteredStates.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-slate-400">No states found</p>
                  ) : (
                    filteredStates.map((s, i) => {
                      const name = getStateName(s);
                      return (
                        <button
                          key={i}
                          onClick={() => { setSelectedState(name); setStateDropdownOpen(false); setStateSearch(''); }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2 ${
                            selectedState === name ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {name}
                        </button>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* District Dropdown */}
        <div className="relative flex-1">
          <button
            onClick={() => { if (districts.length) { setDistrictDropdownOpen(!districtDropdownOpen); setStateDropdownOpen(false); } }}
            disabled={!selectedState}
            className="w-full glass-card !rounded-xl px-4 py-3.5 flex items-center justify-between text-left hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className={`text-sm font-medium ${selectedDistrict ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
              {selectedDistrict || 'Select District'}
            </span>
            <div className="flex items-center gap-2">
              {loadingDistricts && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${districtDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>
          <AnimatePresence>
            {districtDropdownOpen && (
              <motion.div
                className="absolute z-40 mt-2 w-full glass-card !rounded-xl overflow-hidden max-h-72"
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-2 border-b border-slate-200/60 dark:border-slate-700/60">
                  <input
                    type="text"
                    value={districtSearch}
                    onChange={(e) => setDistrictSearch(e.target.value)}
                    placeholder="Search districts..."
                    className="w-full px-3 py-2 text-sm bg-slate-100/80 dark:bg-slate-800/80 rounded-lg outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto max-h-56">
                  {filteredDistricts.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-slate-400">No districts found</p>
                  ) : (
                    filteredDistricts.map((d, i) => {
                      const name = getDistrictName(d);
                      return (
                        <button
                          key={i}
                          onClick={() => { setSelectedDistrict(name); setDistrictDropdownOpen(false); setDistrictSearch(''); }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2 ${
                            selectedDistrict === name ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {name}
                        </button>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results */}
      {loadingPincodes ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard count={6} />
        </div>
      ) : pincodes.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {pincodes.map((item, i) => (
            <ResultCard
              key={i}
              data={item}
              index={i}
              isFavorite={isFav(item)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </motion.div>
      ) : selectedDistrict ? (
        <EmptyState title="No pincodes found" message={`No pincodes found for ${selectedDistrict}.`} />
      ) : null}
    </motion.div>
  );
}
