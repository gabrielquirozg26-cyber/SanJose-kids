// src/components/leccion/EjercicioOrdenar.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mezclar } from '../../utils/leccionHelpers';

// ── ESTADO INICIAL ──
const estadoInicial = (palabras) => ({
  disponibles: mezclar(palabras),
  armada: [],
});

// ── REDUCER PURO ──
const ordenarReducer = (state, action) => {
  switch (action.type) {
    case 'INICIAR':
      return estadoInicial(action.palabras);

    case 'AGREGAR': {
      const { palabra, idx } = action.payload;
      // ✅ Validación: la palabra debe existir en la posición indicada
      if (idx >= state.disponibles.length || state.disponibles[idx] !== palabra) {
        return state;
      }
      return {
        disponibles: state.disponibles.filter((_, i) => i !== idx),
        armada: [...state.armada, palabra],
      };
    }

    case 'QUITAR': {
      const { palabra, idx } = action.payload;
      // ✅ Validación: la palabra debe existir en la posición indicada de armada
      if (idx >= state.armada.length || state.armada[idx] !== palabra) {
        return state;
      }
      return {
        disponibles: [...state.disponibles, palabra],
        armada: state.armada.filter((_, i) => i !== idx),
      };
    }

    case 'QUITAR_ULTIMA': {
      if (state.armada.length === 0) return state;
      const ultima = state.armada[state.armada.length - 1];
      return {
        disponibles: [...state.disponibles, ultima],
        armada: state.armada.slice(0, -1),
      };
    }

    default:
      return state;
  }
};

const EjercicioOrdenar = ({ verso, resultado, onRespuesta }) => {
  // ── ESTADO ──
  const [state, setState] = useState(() => estadoInicial(verso.palabrasOrdenar));
  const [procesando, setProcesando] = useState(false);

  // ✅ COLA DE OPERACIONES: garantiza ejecución secuencial
  const colaRef = useRef([]);
  const ejecutandoRef = useRef(false);
  const timeoutRef = useRef(null);

  // ── INICIALIZAR AL CAMBIAR VERSO ──
  useEffect(() => {
    setState(estadoInicial(verso.palabrasOrdenar));
    setProcesando(false);
    ejecutandoRef.current = false;
    colaRef.current = [];
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [verso.id]);

  // ── NOTIFICAR AL PADRE ──
  useEffect(() => {
    onRespuesta(state.armada.join(' '));
  }, [state.armada, onRespuesta]);

  // ── PROCESADOR DE COLA ──
  const procesarSiguiente = useCallback(() => {
    // Si ya hay una operación en curso o la cola está vacía, salir
    if (ejecutandoRef.current || colaRef.current.length === 0) return;

    // ✅ Tomar la siguiente operación de la cola
    ejecutandoRef.current = true;
    setProcesando(true);

    const { tipo, payload } = colaRef.current.shift();

    // ✅ Ejecutar la operación
    setState((prev) => {
      let nuevoEstado = prev;
      switch (tipo) {
        case 'AGREGAR': {
          const { palabra, idx } = payload;
          if (idx >= prev.disponibles.length || prev.disponibles[idx] !== palabra) {
            return prev;
          }
          nuevoEstado = {
            disponibles: prev.disponibles.filter((_, i) => i !== idx),
            armada: [...prev.armada, palabra],
          };
          break;
        }
        case 'QUITAR': {
          const { palabra, idx } = payload;
          if (idx >= prev.armada.length || prev.armada[idx] !== palabra) {
            return prev;
          }
          nuevoEstado = {
            disponibles: [...prev.disponibles, palabra],
            armada: prev.armada.filter((_, i) => i !== idx),
          };
          break;
        }
        case 'QUITAR_ULTIMA': {
          if (prev.armada.length === 0) return prev;
          const ultima = prev.armada[prev.armada.length - 1];
          nuevoEstado = {
            disponibles: [...prev.disponibles, ultima],
            armada: prev.armada.slice(0, -1),
          };
          break;
        }
        default:
          return prev;
      }
      return nuevoEstado;
    });

    // ✅ Desbloquear después de un tiempo (permitir render)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      ejecutandoRef.current = false;
      setProcesando(false);

      // ✅ Procesar siguiente operación en la cola (si existe)
      if (colaRef.current.length > 0) {
        procesarSiguiente();
      }
    }, 80); // 80ms es suficiente para el render
  }, []);

  // ── ENCOLAR OPERACIÓN ──
  const encolar = useCallback((tipo, payload) => {
    // ✅ Si está bloqueado por resultado, ignorar
    if (resultado && resultado !== 'escudo') return;

    // ✅ Encender la operación
    colaRef.current.push({ tipo, payload });

    // ✅ Si no hay nada en ejecución, empezar a procesar
    if (!ejecutandoRef.current) {
      procesarSiguiente();
    }
  }, [resultado, procesarSiguiente]);

  // ── HANDLERS ──
  const agregarPalabra = useCallback((palabra, idx) => {
    encolar('AGREGAR', { palabra, idx });
  }, [encolar]);

  const quitarPalabra = useCallback((palabra, idx) => {
    encolar('QUITAR', { palabra, idx });
  }, [encolar]);

  const quitarUltima = useCallback(() => {
    encolar('QUITAR_ULTIMA', {});
  }, [encolar]);

  // ── ESTADO DE DESHABILITADO ──
  const isDisabled = (resultado && resultado !== 'escudo') || procesando || colaRef.current.length > 0;

  return (
    <div className="w-full">
      <p className="text-[9px] font-black text-yellow-400 uppercase tracking-[0.3em] mb-3">
        Ordena las palabras
      </p>

      {/* ── ÁREA DE ARMADO ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`min-h-[72px] glass-card p-4 rounded-3xl border-2 mb-4 flex flex-wrap gap-2 items-start transition-all duration-300 ${
          resultado === 'acierto'
            ? 'border-green-400/60 bg-green-500/10'
            : resultado === 'error'
            ? 'border-red-400/60 bg-red-500/10'
            : state.armada.length > 0
            ? 'border-blue-400/40'
            : 'border-white/10'
        }`}
      >
        {state.armada.length === 0 ? (
          <span className="text-white/20 text-sm font-bold self-center">
            Toca las palabras para ordenarlas…
          </span>
        ) : (
          <AnimatePresence>
            {state.armada.map((p, i) => (
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

      {/* ── RESPUESTA CORRECTA (SI ERROR) ── */}
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
        {state.disponibles.map((p, i) => (
          <motion.button
            key={`${p}-${i}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            whileHover={!isDisabled ? { scale: 1.08, y: -2 } : {}}
            whileTap={!isDisabled ? { scale: 0.92 } : {}}
            onClick={() => !isDisabled && agregarPalabra(p, i)}
            disabled={isDisabled}
            className="px-3 py-2 rounded-xl border font-black text-sm transition-all active:scale-95 bg-white/15 border-white/20 text-white hover:bg-white/25 hover:border-white/40 disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
          >
            {p}
          </motion.button>
        ))}
      </div>

      {/* ── BOTÓN BORRAR ÚLTIMA ── */}
      {!isDisabled && state.armada.length > 0 && (
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
    </div>
  );
};

export default EjercicioOrdenar;