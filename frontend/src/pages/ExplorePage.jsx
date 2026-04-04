import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, MapPin, Loader2, Search, X, Download, Building2, Truck } from 'lucide-react';
import { getAllStates, getDistrictsByState, getTaluksByDistrict, getPincodes, autoSuggest, getExportUrl } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import EmptyState from '../components/ui/EmptyState';

export default function ExplorePage() {
  // Filter state
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [taluks, setTaluks] = useState([]);
  const [selectedTaluk, setSelectedTaluk] = useState('');

  // Dropdown visibility
  const [stateOpen, setStateOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [talukOpen, setTalukOpen] = useState(false);

  // Dropdown search
  const [stateSearch, setStateSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [talukSearch, setTalukSearch] = useState('');

  // Data state
  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [loadingTable, setLoadingTable] = useState(false);

  // Loading states for dropdowns
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingTaluks, setLoadingTaluks] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);
  const abortRef = useRef(null);

  // ========== Load states on mount ==========
  useEffect(() => {
    const fetchStates = async () => {
      setLoadingStates(true);
      try {
        const data = await getAllStates();
        setStates(Array.isArray(data) ? data : []);
      } catch { setStates([]); }
      finally { setLoadingStates(false); }
    };
    fetchStates();
  }, []);

  // ========== Load districts when state changes ==========
  useEffect(() => {
    setSelectedDistrict('');
    setSelectedTaluk('');
    setDistricts([]);
    setTaluks([]);
    if (!selectedState) return;

    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const data = await getDistrictsByState(selectedState);
        setDistricts(Array.isArray(data) ? data : []);
      } catch { setDistricts([]); }
      finally { setLoadingDistricts(false); }
    };
    fetchDistricts();
  }, [selectedState]);

  // ========== Load taluks when district changes ==========
  useEffect(() => {
    setSelectedTaluk('');
    setTaluks([]);
    if (!selectedState || !selectedDistrict) return;

    const fetchTaluks = async () => {
      setLoadingTaluks(true);
      try {
        const data = await getTaluksByDistrict(selectedState, selectedDistrict);
        setTaluks(Array.isArray(data) ? data : []);
      } catch { setTaluks([]); }
      finally { setLoadingTaluks(false); }
    };
    fetchTaluks();
  }, [selectedState, selectedDistrict]);

  // ========== Load table data ==========
  useEffect(() => {
    setPage(1);
  }, [selectedState, selectedDistrict, selectedTaluk]);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingTable(true);
      try {
        const result = await getPincodes({
          state: selectedState,
          district: selectedDistrict,
          taluk: selectedTaluk,
          page,
          limit,
        });
        setTableData(result.data || []);
        setTotalCount(result.total || 0);
      } catch {
        setTableData([]);
        setTotalCount(0);
      } finally {
        setLoadingTable(false);
      }
    };
    fetchData();
  }, [selectedState, selectedDistrict, selectedTaluk, page]);

  // ========== Search ==========
  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setSearchResults([]);
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const doSearch = async () => {
      setSearchLoading(true);
      try {
        const data = await autoSuggest(debouncedSearch, controller.signal);
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== 'CanceledError') setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };
    doSearch();
    return () => controller.abort();
  }, [debouncedSearch]);

  // Close search on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const totalPages = Math.ceil(totalCount / limit);

  // Dropdown filtering helpers
  const filteredStates = states.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase()));
  const filteredDistricts = districts.filter(d => d.toLowerCase().includes(districtSearch.toLowerCase()));
  const filteredTaluks = taluks.filter(t => t.toLowerCase().includes(talukSearch.toLowerCase()));

  const closeAllDropdowns = () => { setStateOpen(false); setDistrictOpen(false); setTalukOpen(false); };

  return (
    <motion.div
      className="w-full max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Search Bar */}
      <div ref={searchRef} className="relative mb-6 max-w-2xl mx-auto">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-violet-600 rounded-2xl opacity-0 group-focus-within:opacity-20 blur transition-opacity duration-500" />
          <div className="relative flex items-center glass-card overflow-hidden !rounded-2xl">
            <div className="pl-5 pr-2">
              <Search className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search pincode, office, or district..."
              className="flex-1 py-4 px-2 bg-transparent text-lg outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="pr-4">
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
              </button>
            )}
          </div>
        </div>

        {/* Search dropdown */}
        <AnimatePresence>
          {searchOpen && (searchLoading || searchResults.length > 0 || (debouncedSearch.length >= 2 && searchResults.length === 0)) && (
            <motion.div
              className="absolute z-50 mt-2 w-full glass-card !rounded-xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/30"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              {searchLoading ? (
                <div className="flex items-center justify-center gap-2.5 py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">Searching...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {searchResults.map((item, i) => (
                    <button
                      key={`${item.pincode}-${item.officeName}-${i}`}
                      onClick={() => {
                        window.location.href = `/pincode/${item.pincode}`;
                      }}
                      className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{item.officeName || 'N/A'}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{item.pincode}</span>
                          <span className="text-slate-300 dark:text-slate-600 text-xs">•</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.districtName || ''}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-4">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No results found</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Try a different search term</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* State Dropdown */}
        <FilterDropdown
          label="Select State"
          selected={selectedState}
          items={filteredStates}
          isOpen={stateOpen}
          loading={loadingStates}
          searchValue={stateSearch}
          onSearchChange={setStateSearch}
          onToggle={() => { setStateOpen(!stateOpen); setDistrictOpen(false); setTalukOpen(false); }}
          onSelect={(val) => { setSelectedState(val); setStateOpen(false); setStateSearch(''); }}
        />
        {/* District Dropdown */}
        <FilterDropdown
          label="Select District"
          selected={selectedDistrict}
          items={filteredDistricts}
          isOpen={districtOpen}
          loading={loadingDistricts}
          searchValue={districtSearch}
          onSearchChange={setDistrictSearch}
          disabled={!selectedState}
          onToggle={() => { if (districts.length) { setDistrictOpen(!districtOpen); setStateOpen(false); setTalukOpen(false); } }}
          onSelect={(val) => { setSelectedDistrict(val); setDistrictOpen(false); setDistrictSearch(''); }}
        />
        {/* Taluk Dropdown */}
        <FilterDropdown
          label="Select Taluk"
          selected={selectedTaluk}
          items={filteredTaluks}
          isOpen={talukOpen}
          loading={loadingTaluks}
          searchValue={talukSearch}
          onSearchChange={setTalukSearch}
          disabled={!selectedDistrict}
          onToggle={() => { if (taluks.length) { setTalukOpen(!talukOpen); setStateOpen(false); setDistrictOpen(false); } }}
          onSelect={(val) => { setSelectedTaluk(val); setTalukOpen(false); setTalukSearch(''); }}
        />
      </div>

      {/* Export Button */}
      {selectedState && (
        <div className="flex justify-end mb-4">
          <a
            href={getExportUrl(selectedState)}
            download
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 text-sm"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </a>
        </div>
      )}

      {/* Data Table */}
      <motion.div
        className="glass-card overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-slate-700/60">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Office Name</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pincode</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">District</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Taluk</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingTable ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800/40 animate-pulse">
                    <td className="px-5 py-3.5"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" /></td>
                    <td className="px-5 py-3.5"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" /></td>
                    <td className="px-5 py-3.5 hidden sm:table-cell"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" /></td>
                    <td className="px-5 py-3.5 hidden md:table-cell"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" /></td>
                    <td className="px-5 py-3.5"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" /></td>
                  </tr>
                ))
              ) : tableData.length > 0 ? (
                tableData.map((item, i) => {
                  const status = (item.deliveryStatus || '').trim();
                  const isDelivery = status.toLowerCase().includes('delivery') && !status.toLowerCase().includes('non');
                  return (
                    <motion.tr
                      key={`${item.pincode}-${item.officeName}-${i}`}
                      className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => window.location.href = `/pincode/${item.pincode}`}
                    >
                      <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">{item.officeName || 'N/A'}</td>
                      <td className="px-5 py-3.5 text-blue-600 dark:text-blue-400 font-semibold">{item.pincode || 'N/A'}</td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 hidden sm:table-cell">{item.districtName || 'N/A'}</td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 hidden md:table-cell">{item.taluk || 'N/A'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                          isDelivery
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}>
                          {status || 'N/A'}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="py-12">
                    <EmptyState title="No data found" message="Try adjusting your filters or search." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200/60 dark:border-slate-700/60">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, totalCount)} of {totalCount.toLocaleString()}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[60px] text-center">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ========== Reusable Filter Dropdown Component ==========
function FilterDropdown({ label, selected, items, isOpen, loading, searchValue, onSearchChange, onToggle, onSelect, disabled = false }) {
  return (
    <div className="relative flex-1">
      <button
        onClick={onToggle}
        disabled={disabled}
        className="w-full glass-card !rounded-xl px-4 py-3.5 flex items-center justify-between text-left hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={`text-sm font-medium ${selected ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
          {selected || label}
        </span>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
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
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={`Search...`}
                className="w-full px-3 py-2 text-sm bg-slate-100/80 dark:bg-slate-800/80 rounded-lg outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto max-h-56">
              {items.length === 0 ? (
                <p className="px-4 py-3 text-sm text-slate-400">No results</p>
              ) : (
                items.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => onSelect(item)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2 ${
                      selected === item ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {item}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
