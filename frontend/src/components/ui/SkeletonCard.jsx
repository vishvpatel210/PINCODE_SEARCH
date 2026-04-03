import { motion } from 'framer-motion';

export default function SkeletonCard({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="glass-card p-5 animate-pulse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
}
