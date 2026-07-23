// src/components/leccion/EjercicioEscritura.jsx
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const EjercicioEscritura = ({ verso, resultado, escrito, onEscribir }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!resultado && inputRef.current) {
      inputRef.current.focus();
    }
  }, [verso.id, resultado]);

  const partes = verso.texto.split(verso.palabraFaltante);
  const pista = verso.palabraFaltante[0] + '_'.repeat(Math.max(0, verso.palabraFaltante.length - 1));

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── TÍTULO ── */}
      <motion.p
        className="text-[9px] font-black text-purple-400 uppercase tracking-[0.3em] mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        Escribe la palabra que falta
      </motion.p>

      {/* ── TEXTO CON ESPACIO ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4 sm:p-6 rounded-3xl border border-white/10 mb-6 text-lg sm:text-xl font-black leading-relaxed text-white/90 shadow-xl"
      >
        {partes[0]}
        <motion.span
          animate={
            escrito
              ? {
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    '0 0 0px rgba(250,204,21,0)',
                    '0 0 20px rgba(250,204,21,0.2)',
                    '0 0 0px rgba(250,204,21,0)',
                  ],
                }
              : {}
          }
          transition={{ duration: 0.4 }}
          className={`inline-block mx-1 px-3 py-0.5 rounded-xl border-b-2 min-w-[60px] text-center transition-all duration-300 ${
            !escrito
              ? 'text-white/20 border-white/20'
              : resultado === 'acierto'
              ? 'text-green-300 border-green-400 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
              : resultado === 'error'
              ? 'text-red-300 border-red-400 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
              : 'text-yellow-300 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.2)]'
          }`}
        >
          {escrito || pista}
        </motion.span>
        {partes[1]}
      </motion.div>

      {/* ── INPUT ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <input
          ref={inputRef}
          type="text"
          value={escrito}
          onChange={(e) => !resultado && onEscribir(e.target.value)}
          onKeyDown={(e) =>
            e.key === 'Enter' &&
            escrito &&
            !resultado &&
            document.getElementById('btn-comprobar')?.click()
          }
          placeholder={`Pista: empieza con "${verso.palabraFaltante[0]}"`}
          disabled={!!resultado}
          className={`w-full bg-white/5 border-2 rounded-2xl px-5 py-4 font-black text-lg text-white outline-none transition-all placeholder:text-white/20 placeholder:font-normal placeholder:text-sm ${
            resultado === 'acierto'
              ? 'border-green-400 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.1)]'
              : resultado === 'error'
              ? 'border-red-400 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
              : escrito
              ? 'border-blue-400 focus:border-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
              : 'border-white/10 focus:border-white/30'
          }`}
        />
      </motion.div>

      {/* ── RESPUESTA CORRECTA (EN CASO DE ERROR) ── */}
      {resultado === 'error' && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm font-black text-white/60"
        >
          Era: <span className="text-yellow-400">{verso.palabraFaltante}</span>
        </motion.p>
      )}
    </motion.div>
  );
};

export default EjercicioEscritura;