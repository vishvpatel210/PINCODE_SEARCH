import { motion } from 'framer-motion';
import { Loader2, SearchX, Clock, X } from 'lucide-react';
import SuggestionItem from './SuggestionItem';

export default function SuggestionList({
  suggestions,
  query,
  isLoading,
  activeIndex,
  onSelect,
  history,
  onHistorySelect,
  onHistoryRemove,
  showHistory,
}) {
  // Show recent searches when input is empty
  if (showHistory && history.length > 0) {
    return (
      <motion.div
        className="absolute z-50 mt-2 w-full glass-card !rounded-xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/30"
        initial={{ opacity: 0, y: -8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={{ duration: 0.2 }}
      >
        <div className="px-4 py-2.5 border-b border-slate-200/60 dark:border-slate-700/50 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Recent Searches
          </span>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {history.map((term, i) => (
            <div
              key={term}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
              onClick={() => onHistorySelect(term)}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                <span className="text-sm text-slate-700 dark:text-slate-300">{term}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onHistoryRemove(term);
                }}
                className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <X className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        className="absolute z-50 mt-2 w-full glass-card !rounded-xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/30"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-center gap-2.5 py-8">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span className="text-sm text-slate-500 dark:text-slate-400">Searching...</span>
        </div>
      </motion.div>
    );
  }

  // No results
  if (query.length >= 2 && suggestions.length === 0) {
    return (
      <motion.div
        className="absolute z-50 mt-2 w-full glass-card !rounded-xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/30"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <SearchX className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No results found</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Try a different search term</p>
        </div>
      </motion.div>
    );
  }

  // Results list
  if (suggestions.length > 0) {
    return (
      <motion.div
        className="absolute z-50 mt-2 w-full glass-card !rounded-xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/30"
        initial={{ opacity: 0, y: -8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={{ duration: 0.2 }}
      >
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {suggestions.map((item, i) => (
            <SuggestionItem
              key={`${item.pincode}-${item.officeName}-${i}`}
              item={item}
              query={query}
              isActive={i === activeIndex}
              onClick={() => onSelect(item)}
            />
          ))}
        </div>
        <div className="px-4 py-2 border-t border-slate-200/60 dark:border-slate-700/50">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {suggestions.length} result{suggestions.length > 1 ? 's' : ''} — Use ↑↓ to navigate, Enter to select
          </p>
        </div>
      </motion.div>
    );
  }

  return null;
}
