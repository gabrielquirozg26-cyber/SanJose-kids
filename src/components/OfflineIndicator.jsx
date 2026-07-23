// src/components/OfflineIndicator.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-red-500/90 backdrop-blur-md py-3 px-4 text-center shadow-lg"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">📡</span>
            <p className="font-black text-white text-sm uppercase tracking-widest">
              Sin conexión · Algunas funciones no están disponibles
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;