import { useState, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SearchBar({ onSearch, isLoading }) {
  const [value, setValue] = useState('');

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const trimmed = value.trim();
      if (trimmed && /^\d{6}$/.test(trimmed)) {
        onSearch(trimmed);
      }
    },
    [value, onSearch]
  );

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-violet-600 rounded-2xl opacity-0 group-focus-within:opacity-20 blur transition-opacity duration-500" />

        <div className="relative flex items-center glass-card overflow-hidden !rounded-2xl">
          <div className="pl-5 pr-2">
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit pincode..."
            className="flex-1 py-4 px-2 bg-transparent text-lg outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
            maxLength={6}
            inputMode="numeric"
          />
          <motion.button
            type="submit"
            disabled={isLoading || value.trim().length !== 6}
            className="m-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center gap-2"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.form>
  );
}
