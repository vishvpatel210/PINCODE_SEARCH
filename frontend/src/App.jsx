import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, Sparkles, Zap } from 'lucide-react';

import Navbar from './components/layout/Navbar';
import SearchBar from './components/ui/SearchBar';
import ResultCard from './components/ui/ResultCard';
import SkeletonCard from './components/ui/SkeletonCard';
import EmptyState from './components/ui/EmptyState';
import StateExplorer from './components/features/StateExplorer';
import SearchHistory from './components/features/SearchHistory';
import AutoSuggestSearch from './components/features/AutoSuggestSearch';
import FavoritesList from './components/features/FavoritesList';
import { useToast } from './components/ui/Toast';
import { useLocalStorage } from './hooks/useLocalStorage';
import { searchByPincode } from './services/api';

const tabs = [
  { id: 'search', label: 'Pincode Search', icon: Search },
  { id: 'smart', label: 'Smart Search', icon: Zap },
  { id: 'explore', label: 'State Explorer', icon: Globe },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [history, setHistory] = useLocalStorage('pincode-history', []);
  const [smartHistory, setSmartHistory] = useLocalStorage('pincode-smart-history', []);
  const [favorites, setFavorites] = useLocalStorage('pincode-favorites', []);
  const { addToast } = useToast();

  const handleSearch = useCallback(
    async (pincode) => {
      setIsLoading(true);
      setHasSearched(true);
      setResults([]);
      try {
        const data = await searchByPincode(pincode);
        const items = Array.isArray(data) ? data : data.data ? data.data : [data];
        setResults(items);
        // Update history
        setHistory((prev) => {
          const filtered = prev.filter((p) => p !== pincode);
          return [pincode, ...filtered].slice(0, 5);
        });
        if (items.length > 0) {
          addToast(`Found ${items.length} result${items.length > 1 ? 's' : ''} for ${pincode}`, 'success');
        } else {
          addToast(`No results for pincode ${pincode}`, 'error');
        }
      } catch (err) {
        addToast(err?.response?.data?.message || 'Failed to fetch pincode details', 'error');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [addToast, setHistory]
  );

  const handleToggleFavorite = useCallback(
    (item) => {
      const pin = item.pincode || item.Pincode || '';
      setFavorites((prev) => {
        const exists = prev.some((f) => (f.pincode || f.Pincode) === pin);
        if (exists) {
          addToast('Removed from favorites', 'success');
          return prev.filter((f) => (f.pincode || f.Pincode) !== pin);
        } else {
          addToast('Added to favorites ⭐', 'success');
          return [...prev, item];
        }
      });
    },
    [addToast, setFavorites]
  );

  const removeFromHistory = useCallback(
    (pin) => setHistory((prev) => prev.filter((p) => p !== pin)),
    [setHistory]
  );

  const handleSmartSelect = useCallback(
    (item) => {
      const pin = String(item.pincode || '');
      if (pin) {
        // Save to smart history
        const label = `${item.officeName || ''} - ${pin}`;
        setSmartHistory((prev) => {
          const filtered = prev.filter((p) => p !== label);
          return [label, ...filtered].slice(0, 5);
        });
        handleSearch(pin);
        setActiveTab('search');
      }
    },
    [handleSearch, setSmartHistory]
  );

  const removeFromSmartHistory = useCallback(
    (term) => setSmartHistory((prev) => prev.filter((p) => p !== term)),
    [setSmartHistory]
  );

  const isFav = useCallback(
    (item) => {
      const pin = item.pincode || item.Pincode || '';
      return favorites.some((f) => (f.pincode || f.Pincode) === pin);
    },
    [favorites]
  );

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-800/40 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              India's Smartest Pincode Tool
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-3">
            Find Any{' '}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
              Pincode
            </span>{' '}
            Instantly
          </h1>
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Search by pincode or explore states and districts to find post office details across India.
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-600 rounded-lg shadow-lg shadow-blue-500/25"
                    layoutId="activeTab"
                    transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                  />
                )}
                <tab.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10 hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
              <SearchHistory history={history} onSearch={handleSearch} onRemove={removeFromHistory} />

              {/* Results Grid */}
              <div className="mt-8">
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    <SkeletonCard count={3} />
                  </div>
                ) : results.length > 0 ? (
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {results.map((item, i) => (
                      <ResultCard
                        key={i}
                        data={item}
                        index={i}
                        isFavorite={isFav(item)}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </motion.div>
                ) : hasSearched ? (
                  <EmptyState />
                ) : null}
              </div>
            </motion.div>
          )}

          {activeTab === 'smart' && (
            <motion.div
              key="smart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AutoSuggestSearch
                onResultSelect={handleSmartSelect}
                history={smartHistory}
                onHistorySelect={(term) => {
                  // Extract pincode from "OfficeName - 123456" format
                  const match = term.match(/(\d{6})/);
                  if (match) {
                    handleSearch(match[1]);
                    setActiveTab('search');
                  }
                }}
                onHistoryRemove={removeFromSmartHistory}
              />
            </motion.div>
          )}

          {activeTab === 'explore' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StateExplorer favorites={favorites} onToggleFavorite={handleToggleFavorite} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-200/60 dark:border-slate-800/60">
            <FavoritesList
              favorites={favorites}
              onRemove={handleToggleFavorite}
              onSearch={(pin) => {
                setActiveTab('search');
                handleSearch(pin);
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-slate-200/60 dark:border-slate-800/60">
        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} Pincode Finder — Built with ❤️ using React & Tailwind CSS
        </p>
      </footer>
    </div>
  );
}
