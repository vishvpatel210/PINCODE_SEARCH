import { Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchHistory({ history, onSearch, onRemove }) {
  if (!history.length) return null;

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto mt-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Recent Searches
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {history.map((pin) => (
            <motion.div
              key={pin}
              className="group flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer transition-all duration-200"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => onSearch(pin)}
              layout
            >
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{pin}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(pin);
                }}
                className="ml-0.5 p-0.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <X className="w-3 h-3 text-slate-400" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
