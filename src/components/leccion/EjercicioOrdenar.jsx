// src/components/leccion/EjercicioOrdenar.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mezclar } from '../../utils/leccionHelpers';

const EjercicioOrdenar = ({ verso, resultado, onRespuesta }) => {
  const [disponibles, setDisponibles] = useState([]);
  const [armada, setArmada] = useState([]);

  useEffect(() => {
    setDisponibles(mezclar(verso.palabrasOrdenar));
    setArmada([]);
  }, [verso.id]);

  useEffect(() => {
    onRespuesta(armada.join(' '));
  }, [armada, onRespuesta]);

  const agregarPalabra = (palabra, idx) => {
    if (resultado && resultado !== 'escudo') return;
    setArmada(prev => [...prev, palabra]);
    setDisponibles(prev => prev.filter((_, i) => i !== idx));
  };

  const quitarPalabra = (palabra, idx) => {
    if (resultado && resultado !== 'escudo') return;
    setArmada(prev => prev.filter((_, i) => i !== idx));
    setDisponibles(prev => [...prev, palabra]);
  };

  const quitarUltima = () => {
    if (resultado && resultado !== 'escudo') return;
    if (armada.length === 0) return;
    const ultima = armada[armada.length - 1];
    setArmada(prev => prev.slice(0, -1));
    setDisponibles(prev => [...prev, ultima]);
  };

  const isDisabled = resultado && resultado !== 'escudo';

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── TÍTULO ── */}
      <motion.p
        className="text-[9px] font-black text-yellow-400 uppercase tracking-[0.3em] mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        Ordena las palabras
      </motion.p>

      {/* ── ÁREA DE ARMADO ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`min-h-[72px] glass-card p-4 rounded-3xl border-2 mb-4 flex flex-wrap gap-2 items-start transition-all duration-300 shadow-xl ${
          resultado === 'acierto'
            ? 'border-green-400/60 bg-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.15)]'
            : resultado === 'error'
            ? 'border-red-400/60 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.15)]'
            : armada.length > 0
            ? 'border-blue-400/40 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
            : 'border-white/10'
        }`}
      >
        {armada.length === 0 ? (
          <motion.span
            className="text-white/20 text-sm font-bold self-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Toca las palabras para ordenarlas…
          </motion.span>
        ) : (
          <AnimatePresence>
            {armada.map((p, i) => (
              <motion.span
                key={`${p}-${i}`}
                initial={{ scale: 0.8, opacity: 0, rotateX: 30 }}
                animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                exit={{ scale: 0.8, opacity: 0, rotateX: -30 }}
                whileHover={!isDisabled ? { scale: 1.08 } : {}}
                whileTap={!isDisabled ? { scale: 0.9 } : {}}
                onClick={() => !isDisabled && quitarPalabra(p, i)}
                className={`px-3 py-1.5 rounded-xl font-black text-sm cursor-pointer transition-all ${
                  resultado === 'acierto'
                    ? 'bg-green-500/30 text-green-200 border border-green-400/30'
                    : resultado === 'error'
                    ? 'bg-red-500/30 text-red-200 border border-red-400/30'
                    : 'bg-blue-500/20 text-blue-200 border border-blue-400/30 hover:bg-blue-500/40'
                }`}
              >
                {p} ✕
              </motion.span>
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      {/* ── RESPUESTA CORRECTA (EN CASO DE ERROR) ── */}
      {resultado === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 px-4 py-2 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm"
        >
          <p className="text-[9px] text-white/40 uppercase tracking-widest font-black mb-1">
            Respuesta correcta
          </p>
          <p className="text-white/80 text-sm font-bold">
            {verso.palabrasOrdenar.join(' ')}
          </p>
        </motion.div>
      )}

      {/* ── PALABRAS DISPONIBLES ── */}
      <div className="flex flex-wrap gap-2 mb-3">
        {disponibles.map((p, i) => (
          <motion.button
            key={`${p}-${i}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            whileHover={!isDisabled ? { scale: 1.08, y: -2 } : {}}
            whileTap={!isDisabled ? { scale: 0.92 } : {}}
            onClick={() => agregarPalabra(p, i)}
            disabled={!!isDisabled}
            className="px-3 py-2 rounded-xl border font-black text-sm transition-all active:scale-95 bg-white/15 border-white/20 text-white hover:bg-white/25 hover:border-white/40 disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
          >
            {p}
          </motion.button>
        ))}
      </div>

      {/* ── BOTÓN BORRAR ÚLTIMA ── */}
      {!isDisabled && armada.length > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={quitarUltima}
          className="text-[10px] text-white/30 font-black uppercase tracking-widest hover:text-white/60 transition-colors"
        >
          ← Borrar última
        </motion.button>
      )}
    </motion.div>
  );
};

export default EjercicioOrdenar;