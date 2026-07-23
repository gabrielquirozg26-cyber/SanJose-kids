// src/components/leccion/HeaderLeccion.jsx
import React from 'react';
import { motion } from 'framer-motion';

const HeaderLeccion = ({
  titulo,
  icono,
  progreso,
  vidas,
  escudoActivo,
  onCerrar,
}) => {
  return (
    <header className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4 max-w-2xl mx-auto w-full">
      {/* ── BOTÓN CERRAR ── */}
      <motion.button
        whileHover={{ scale: 1.15, rotate: 90 }}
        whileTap={{ scale: 0.85 }}
        onClick={onCerrar}
        className="text-white/40 hover:text-white/80 text-xl font-black p-2 rounded-full hover:bg-white/10 transition-all duration-300"
        aria-label="Cerrar lección"
      >
        ✕
      </motion.button>

      {/* ── BARRA DE PROGRESO ── */}
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-300 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progreso}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            boxShadow: '0 0 15px rgba(250,204,21,0.3)',
          }}
        />
      </div>

      {/* ── INDICADORES ── */}
      <div className="flex items-center gap-2">
        {/* ESCUDO ACTIVO */}
        {escudoActivo && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-xl bg-yellow-400/30 blur-md animate-pulse" />
            <div className="relative bg-yellow-400/20 border border-yellow-400/40 px-2 py-1.5 rounded-xl flex items-center gap-1 shadow-lg shadow-yellow-400/20">
              <span className="text-sm animate-pulse">🛡️</span>
            </div>
          </motion.div>
        )}

        {/* VIDAS */}
        <motion.div
          className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 backdrop-blur-sm"
          animate={
            vidas <= 2
              ? {
                  boxShadow: [
                    '0 0 5px rgba(239,68,68,0.2)',
                    '0 0 20px rgba(239,68,68,0.4)',
                    '0 0 5px rgba(239,68,68,0.2)',
                  ],
                }
              : {}
          }
          transition={{ duration: 1, repeat: Infinity }}
        >
          <span className="text-red-400 animate-pulse">❤️</span>
          <span className="font-black text-sm text-white">{vidas}</span>
        </motion.div>
      </div>
    </header>
  );
};

export default HeaderLeccion;