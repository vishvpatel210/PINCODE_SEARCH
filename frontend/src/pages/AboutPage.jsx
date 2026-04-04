import { motion } from 'framer-motion';
import { MapPin, Code2, Heart, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <motion.div
      className="w-full max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 dark:from-blue-500/20 dark:to-violet-500/20 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">About Pincode Finder</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">India's Smartest Pincode Tool</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Pincode Finder is a modern, fast tool for searching Indian PIN codes.
            Whether you need to find a post office, explore delivery areas, or browse
            by state and district — this tool makes it easy and instant.
          </p>
          <p>
            Built with a comprehensive database of over 154,000 postal records,
            covering all states, districts, and taluks across India.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {[
            { icon: Globe, label: 'Coverage', value: '36+ States & UTs', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
            { icon: Code2, label: 'Technology', value: 'React + Node.js', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
            { icon: Heart, label: 'Made with', value: 'Love & Coffee', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center`}>
                <item.icon className={`w-4.5 h-4.5 ${item.color}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
