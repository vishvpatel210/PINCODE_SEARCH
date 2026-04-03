import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '../../hooks/useDebounce';
import { autoSuggest } from '../../services/api';
import SuggestionList from '../ui/SuggestionList';

export default function AutoSuggestSearch({ onResultSelect, history, onHistorySelect, onHistoryRemove }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);
  const debouncedQuery = useDebounce(query, 350);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const abortRef = useRef(null);

  // Fetch suggestions on debounced query change
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      setHasSearched(false);
      return;
    }

    // Cancel previous request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const data = await autoSuggest(debouncedQuery, controller.signal);
        setSuggestions(Array.isArray(data) ? data : []);
        setHasSearched(true);
        setActiveIndex(-1);
      } catch (err) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          setSuggestions([]);
          setHasSearched(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();

    return () => controller.abort();
  }, [debouncedQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      const list = suggestions.length > 0 ? suggestions : [];
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev < list.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : list.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < list.length) {
          handleSelect(list[activeIndex]);
        }
      } else if (e.key === 'Escape') {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    },
    [suggestions, activeIndex]
  );

  const handleSelect = useCallback(
    (item) => {
      const label = item.officeName || String(item.pincode) || '';
      setQuery(label);
      setSuggestions([]);
      setIsFocused(false);
      setHasSearched(false);
      if (onResultSelect) onResultSelect(item);
    },
    [onResultSelect]
  );

  const handleHistoryClick = useCallback(
    (term) => {
      setQuery(term);
      setIsFocused(false);
      if (onHistorySelect) onHistorySelect(term);
    },
    [onHistorySelect]
  );

  const clearInput = () => {
    setQuery('');
    setSuggestions([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const showDropdown = isFocused && (
    isLoading ||
    suggestions.length > 0 ||
    (hasSearched && query.length >= 2) ||
    (query.length === 0 && history.length > 0)
  );

  return (
    <motion.div
      ref={containerRef}
      className="w-full max-w-2xl mx-auto relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      {/* Input */}
      <div className="relative group">
        {/* Glow */}
        <div
          className={`absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur transition-opacity duration-500 ${
            isFocused ? 'opacity-20' : 'opacity-0'
          }`}
        />
        <div className="relative flex items-center glass-card overflow-hidden !rounded-2xl">
          <div className="pl-5 pr-2">
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search pincode, district, or post office..."
            className="flex-1 py-4 px-2 bg-transparent text-lg outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
          />
          <div className="flex items-center gap-1 pr-3">
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              </motion.div>
            )}
            {query && (
              <motion.button
                onClick={clearInput}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.85 }}
              >
                <X className="w-4 h-4 text-slate-400" />
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <SuggestionList
            suggestions={suggestions}
            query={query}
            isLoading={isLoading && query.length >= 2}
            activeIndex={activeIndex}
            onSelect={handleSelect}
            history={history}
            onHistorySelect={handleHistoryClick}
            onHistoryRemove={onHistoryRemove}
            showHistory={query.length === 0 && history.length > 0}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
