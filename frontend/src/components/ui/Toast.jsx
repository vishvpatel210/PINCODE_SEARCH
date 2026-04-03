import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = toast.type === 'success';

  return (
    <motion.div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-lg ${
        isSuccess
          ? 'bg-emerald-50/90 border-emerald-200/60 dark:bg-emerald-900/40 dark:border-emerald-700/40'
          : 'bg-red-50/90 border-red-200/60 dark:bg-red-900/40 dark:border-red-700/40'
      }`}
      initial={{ opacity: 0, y: 20, x: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      {isSuccess ? (
        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      )}
      <p className={`text-sm font-medium ${isSuccess ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'}`}>
        {toast.message}
      </p>
      <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors ml-2">
        <X className="w-3.5 h-3.5 text-slate-400" />
      </button>
    </motion.div>
  );
}

export const useToast = () => useContext(ToastContext);
