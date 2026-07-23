// src/components/leccion/EjercicioSeleccion.jsx
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { mezclar } from '../../utils/leccionHelpers';

const EjercicioSeleccion = ({
  verso,
  resultado,
  seleccionada,
  onSeleccionar,
  opcionesFiltradas,
}) => {
  const opciones = useMemo(() => {
    if (opcionesFiltradas) return opcionesFiltradas;
    return mezclar(verso.opcionesSeleccion);
  }, [verso.id, opcionesFiltradas]);

  const partes = verso.texto.split(verso.palabraFaltante);

  // Variants para animaciones de entrada
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  const textVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delay: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.2 },
    },
  };

  return (
    <motion.div
      className="w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── TÍTULO ── */}
      <motion.p
        className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] mb-3"
        variants={textVariants}
        initial="hidden"
        animate="visible"
      >
        Elige la palabra correcta
      </motion.p>

      {/* ── TEXTO CON ESPACIO ── */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="glass-card p-4 sm:p-6 rounded-3xl border border-white/10 mb-6 text-lg sm:text-xl font-black leading-relaxed text-white/90 shadow-xl"
      >
        {partes[0]}
        <motion.span
          animate={
            seleccionada
              ? {
                  scale: [1, 1.15, 1],
                  boxShadow: [
                    '0 0 0px rgba(250,204,21,0)',
                    '0 0 30px rgba(250,204,21,0.3)',
                    '0 0 0px rgba(250,204,21,0)',
                  ],
                }
              : {}
          }
          transition={{ duration: 0.4 }}
          className={`inline-block mx-1 px-3 py-0.5 rounded-xl border-b-2 transition-all duration-300 ${
            !seleccionada
              ? 'text-white/20 border-white/20 bg-white/5'
              : resultado === 'acierto'
              ? 'text-green-300 border-green-400 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
              : resultado === 'error'
              ? 'text-red-300 border-red-400 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
              : 'text-yellow-300 border-yellow-400 bg-yellow-500/10 shadow-[0_0_20px_rgba(250,204,21,0.2)]'
          }`}
        >
          {seleccionada || '___'}
        </motion.span>
        {partes[1]}
      </motion.div>

      {/* ── OPCIONES ── */}
      <div className="grid grid-cols-2 gap-3">
        {opciones.map((op, i) => {
          const esSelec = op === seleccionada;
          const esCorrecta = op === verso.palabraFaltante;
          const isDisabled = resultado && resultado !== 'escudo';

          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={!isDisabled ? { scale: 1.04, y: -2 } : {}}
              whileTap={!isDisabled ? { scale: 0.94 } : {}}
              onClick={() => !isDisabled && onSeleccionar(op)}
              disabled={!!isDisabled}
              className={`p-4 rounded-2xl border-2 font-black text-sm transition-all duration-200 ${
                esSelec && !isDisabled
                  ? 'bg-blue-600/20 border-blue-400 text-white shadow-[0_0_30px_rgba(59,130,246,0.3)] scale-[1.02]'
                  : resultado === 'acierto' && esCorrecta
                  ? 'border-green-400 bg-green-500/20 text-green-300 shadow-[0_0_30px_rgba(34,197,94,0.3)]'
                  : resultado === 'error' && esSelec && !esCorrecta
                  ? 'border-red-400 bg-red-500/20 text-red-300 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
                  : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30 hover:bg-white/10'
              }`}
            >
              {op}
              {esSelec && !isDisabled && (
                <motion.span
                  className="ml-2 text-[10px] text-blue-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  ✓
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default EjercicioSeleccion;