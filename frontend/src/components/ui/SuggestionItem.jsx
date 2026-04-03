import { motion } from 'framer-motion';
import { Building2, MapPin } from 'lucide-react';

function HighlightText({ text, query }) {
  if (!query || !text) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SuggestionItem({ item, query, isActive, onClick }) {
  const office = item.officeName || '';
  const pincode = String(item.pincode || '');
  const district = item.districtName || '';

  return (
    <motion.button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors duration-150 ${
        isActive
          ? 'bg-blue-50 dark:bg-blue-900/25'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
      }`}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
        isActive
          ? 'bg-gradient-to-br from-blue-500/20 to-violet-500/20'
          : 'bg-slate-100 dark:bg-slate-800'
      }`}>
        <Building2 className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500'}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
          <HighlightText text={office} query={query} />
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{pincode}</span>
          <span className="text-slate-300 dark:text-slate-600 text-xs">•</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
            <MapPin className="w-3 h-3 inline flex-shrink-0" />
            <HighlightText text={district} query={query} />
          </span>
        </div>
      </div>
    </motion.button>
  );
}
