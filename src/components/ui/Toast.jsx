import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── TIPOS DE TOAST ──────────────────────────────────────────────────────
const TOAST_TYPES = {
  success: { icon: '✅', color: 'border-green-400/30 bg-green-500/20 text-green-300' },
  error: { icon: '❌', color: 'border-red-400/30 bg-red-500/20 text-red-300' },
  warning: { icon: '⚠️', color: 'border-yellow-400/30 bg-yellow-500/20 text-yellow-300' },
  info: { icon: 'ℹ️', color: 'border-blue-400/30 bg-blue-500/20 text-blue-300' },
};

// ── TOAST INDIVIDUAL ────────────────────────────────────────────────────
const ToastItem = ({ message, type = 'success', duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const { icon, color } = TOAST_TYPES[type] || TOAST_TYPES.success;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`px-6 py-3 rounded-2xl font-black text-sm shadow-2xl border ${color} bg-black/80 backdrop-blur pointer-events-auto`}
    >
      <div className="flex items-center gap-3">
        <span>{icon}</span>
        <span>{message}</span>
      </div>
    </motion.div>
  );
};

// ── CONTEXT PARA TOASTS ────────────────────────────────────────────────
const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <ToastItem
              key={toast.id}
              {...toast}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return context;
};

export default ToastProvider;