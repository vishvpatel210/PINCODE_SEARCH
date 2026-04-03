import { MapPin, Building2, Truck, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResultCard({ data, index = 0, isFavorite, onToggleFavorite }) {
  return (
    <motion.div
      className="glass-card p-5 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5 transition-all duration-300 group cursor-default"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      whileHover={{ y: -4, scale: 1.01 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 dark:from-blue-500/20 dark:to-violet-500/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-tight">
              {data.officeName || data.OfficeName || data.office_name || 'N/A'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Post Office</p>
          </div>
        </div>
        {onToggleFavorite && (
          <motion.button
            onClick={() => onToggleFavorite(data)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            whileTap={{ scale: 0.8 }}
          >
            <Star
              className={`w-4.5 h-4.5 transition-colors ${
                isFavorite
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-300 dark:text-slate-600'
              }`}
            />
          </motion.button>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2.5 mt-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pincode</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {data.pincode || data.Pincode || 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">District / State</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {data.district || data.District || 'N/A'}{' '}
              <span className="text-slate-400 dark:text-slate-500">•</span>{' '}
              {data.state || data.State || 'N/A'}
            </p>
          </div>
        </div>

        {(data.deliveryStatus || data.DeliveryStatus || data.delivery_status) && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
              <Truck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Delivery</p>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                  (data.deliveryStatus || data.DeliveryStatus || data.delivery_status || '')
                    .toLowerCase()
                    .includes('delivery')
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                }`}
              >
                {data.deliveryStatus || data.DeliveryStatus || data.delivery_status || 'N/A'}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
