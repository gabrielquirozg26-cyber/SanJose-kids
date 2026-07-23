// src/components/leccion/ProgressBar.jsx
import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ progreso, paso, total, tipo, titulo, icono }) => {
  const tipoLabel = {
    seleccion: '🔤 Completar',
    ordenar: '🔀 Ordenar',
    escritura: '✍️ Escribir',
  };

  const tipoColor = {
    seleccion: 'text-blue-300 border-blue-500/30 bg-blue-500/10',
    ordenar: 'text-yellow-300 border-yellow-500/30 bg-yellow-500/10',
    escritura: 'text-purple-300 border-purple-500/30 bg-purple-500/10',
  };

  // Efectos de partículas para el icono
  const particleVariants = {
    initial: { scale: 1, rotate: 0 },
    animate: {
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className="flex items-center justify-between px-4 sm:px-5 max-w-2xl mx-auto w-full mb-3">
      {/* ── TÍTULO CON ICONO ── */}
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.span
          className="text-lg sm:text-xl"
          variants={particleVariants}
          initial="initial"
          animate="animate"
        >
          {icono}
        </motion.span>
        <span className="text-[8px] sm:text-[9px] font-black text-yellow-400 uppercase tracking-[0.3em]">
          {titulo}
        </span>
      </motion.div>

      {/* ── TIPO DE EJERCICIO ── */}
      <motion.span
        className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border ${tipoColor[tipo] || tipoColor.seleccion} backdrop-blur-sm`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
      >
        {tipoLabel[tipo] || 'Ejercicio'}
      </motion.span>
    </div>
  );
};

export default ProgressBar;