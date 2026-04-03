import { SearchX } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmptyState({ title = 'No results found', message = 'Try searching with a different pincode.' }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-5 shadow-inner">
        <SearchX className="w-10 h-10 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-xs">{message}</p>
    </motion.div>
  );
}
