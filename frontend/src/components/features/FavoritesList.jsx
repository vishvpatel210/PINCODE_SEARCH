import { Star, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FavoritesList({ favorites, onRemove, onSearch }) {
  if (!favorites.length) return null;

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-4.5 h-4.5 text-amber-400 fill-amber-400" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Favorites</h2>
        <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium">
          {favorites.length}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence>
          {favorites.map((item, i) => {
            const pin = item.pincode || item.Pincode || '';
            const office = item.officeName || item.OfficeName || item.office_name || 'N/A';
            const district = item.district || item.District || '';
            const state = item.state || item.State || '';
            return (
              <motion.div
                key={pin + '-' + i}
                className="glass-card !rounded-xl p-4 flex items-center justify-between group hover:shadow-lg transition-all duration-300 cursor-pointer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                whileHover={{ y: -2 }}
                onClick={() => onSearch(pin)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400/20 to-orange-400/20 dark:from-amber-500/20 dark:to-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{pin}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {office} • {district}, {state}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(item);
                  }}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
