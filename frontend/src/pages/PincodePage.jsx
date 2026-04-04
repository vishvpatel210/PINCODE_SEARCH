import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Building2, Truck, Globe, Layers, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { getPincodeDetails } from '../services/api';

export default function PincodePage() {
  const { pincode } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!pincode) return;
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await getPincodeDetails(pincode);
        setData(Array.isArray(result) ? result : [result]);
      } catch (err) {
        setError(err?.response?.data?.message || 'Pincode not found');
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [pincode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-slate-500 dark:text-slate-400">Loading pincode details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">{error}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">The pincode "{pincode}" could not be found.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link
        to="/explore"
        className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Explore
      </Link>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 dark:from-blue-500/20 dark:to-violet-500/20 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          Pincode: {pincode}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-[52px]">
          {data.length} post office{data.length > 1 ? 's' : ''} found
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item, i) => (
          <PincodeCard key={i} data={item} index={i} />
        ))}
      </div>
    </motion.div>
  );
}

function PincodeCard({ data, index }) {
  const status = (data.deliveryStatus || '').trim();
  const isDelivery = status.toLowerCase().includes('delivery') && !status.toLowerCase().includes('non');

  const fields = [
    { label: 'Pincode', value: data.pincode, icon: MapPin, bgColor: 'bg-emerald-500/10', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'District', value: data.districtName, icon: Globe, bgColor: 'bg-violet-500/10', iconColor: 'text-violet-600 dark:text-violet-400' },
    { label: 'State', value: (data.stateName || '').trim(), icon: Layers, bgColor: 'bg-blue-500/10', iconColor: 'text-blue-600 dark:text-blue-400' },
    { label: 'Taluk', value: data.taluk, icon: MapPin, bgColor: 'bg-cyan-500/10', iconColor: 'text-cyan-600 dark:text-cyan-400' },
  ];

  return (
    <motion.div
      className="glass-card p-5 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      whileHover={{ y: -4, scale: 1.01 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 dark:from-blue-500/20 dark:to-violet-500/20 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-tight">
            {data.officeName || 'N/A'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Post Office</p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2.5 mt-4">
        {fields.map((field) => (
          field.value && (
            <div key={field.label} className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg ${field.bgColor} flex items-center justify-center`}>
                <field.icon className={`w-4 h-4 ${field.iconColor}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{field.label}</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{field.value}</p>
              </div>
            </div>
          )
        ))}

        {/* Delivery Status */}
        {status && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
              <Truck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Delivery</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                isDelivery
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
              }`}>
                {status}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
