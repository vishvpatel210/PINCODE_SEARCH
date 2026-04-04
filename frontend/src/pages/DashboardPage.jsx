import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, MapPin, Truck, Building2, Loader2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getStats, getStateDistribution, getDeliveryDistribution } from '../services/api';

const PIE_COLORS = ['#3b82f6', '#f59e0b'];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [stateData, setStateData] = useState([]);
  const [deliveryData, setDeliveryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const [s, sd, dd] = await Promise.all([
          getStats(),
          getStateDistribution(),
          getDeliveryDistribution(),
        ]);
        setStats(s);
        setStateData(sd.slice(0, 15)); // top 15 states
        setDeliveryData(dd);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-slate-500 dark:text-slate-400">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Pincodes', value: stats?.totalPincodes?.toLocaleString(), icon: MapPin, color: 'from-blue-500/10 to-violet-500/10', iconColor: 'text-blue-600 dark:text-blue-400' },
    { label: 'Total States', value: stats?.totalStates, icon: BarChart3, color: 'from-emerald-500/10 to-teal-500/10', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Delivery Offices', value: stats?.deliveryOffices?.toLocaleString(), icon: Truck, color: 'from-sky-500/10 to-cyan-500/10', iconColor: 'text-sky-600 dark:text-sky-400' },
    { label: 'Non-Delivery', value: stats?.nonDeliveryOffices?.toLocaleString(), icon: Building2, color: 'from-amber-500/10 to-orange-500/10', iconColor: 'text-amber-600 dark:text-amber-400' },
  ];

  const pieData = deliveryData
    ? [
        { name: 'Delivery', value: deliveryData.delivery },
        { name: 'Non-Delivery', value: deliveryData.nonDelivery },
      ]
    : [];

  return (
    <motion.div
      className="w-full max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            className="glass-card p-5 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            whileHover={{ y: -4, scale: 1.01 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{card.label}</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{card.value || '—'}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart - State Distribution */}
        <motion.div
          className="glass-card p-5 lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            State-wise Distribution (Top 15)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateData} margin={{ top: 5, right: 5, bottom: 60, left: 5 }}>
                <XAxis
                  dataKey="state"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '13px',
                  }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
                />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart - Delivery Distribution */}
        <motion.div
          className="glass-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-500" />
            Delivery Status
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    borderRadius: '12px',
                    color: '#e2e8f0',
                    fontSize: '13px',
                  }}
                  formatter={(val) => val.toLocaleString()}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-xs text-slate-600 dark:text-slate-400">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
