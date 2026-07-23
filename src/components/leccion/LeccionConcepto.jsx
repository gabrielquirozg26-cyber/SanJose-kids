// src/components/leccion/LeccionConcepto.jsx
import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { mezclar } from '../../utils/leccionHelpers';
import AnimacionEscudo from './AnimacionEscudo';

// ── PARTÍCULAS DE FONDO ──────────────────────────────────────────────────
const BackgroundParticles = () => {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 3,
    duration: 6 + Math.random() * 8,
    delay: Math.random() * 4,
    opacity: 0.05 + Math.random() * 0.12,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, p.opacity, 0],
            y: [p.y, p.y - 15, p.y],
            x: [p.x, p.x + (Math.random() - 0.5) * 8, p.x],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
        />
      ))}
    </div>
  );
};

const LeccionConcepto = ({
  preguntas,
  onCompletar,
  vidas,
  restarVida,
  sumarMonedas,
  consumirItem,
  inventario,
  oracionActual,
  yaCompletadoAntes,
  completarNivel,
}) => {
  const [paso, setPaso] = useState(0);
  const [seleccion, setSeleccion] = useState(null);
  const [respondido, setRespondido] = useState(false);
  const [aciertos, setAciertos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [monedasGanadas, setMonedasGanadas] = useState(0);
  const [terminado, setTerminado] = useState(false);

  const [escudoActivo, setEscudoActivo] = useState(() => {
    return inventario.includes('escudo_miguel');
  });
  const [mostrarEscudo, setMostrarEscudo] = useState(false);
  const [escudosUsados, setEscudosUsados] = useState(0);
  const [usandoPocion, setUsandoPocion] = useState(false);
  const [opcionesFiltradas, setOpcionesFiltradas] = useState(null);
  const [mensajeFlotante, setMensajeFlotante] = useState(null);

  const procesandoRef = useRef(false);
  const [procesando, setProcesando] = useState(false);

  const pregunta = preguntas[paso];
  const tienePocion = inventario.includes('pocion_sabiduria');

  // Sincronizar escudo con inventario
  React.useEffect(() => {
    const tieneEscudo = inventario.includes('escudo_miguel');
    setEscudoActivo(tieneEscudo);
  }, [inventario]);

  const opcionesMezcladas = useMemo(() => {
    if (opcionesFiltradas) return opcionesFiltradas;
    return mezclar([...pregunta.opciones]);
  }, [pregunta?.id, opcionesFiltradas]);

  const usarPocionSabiduria = async () => {
    if (!tienePocion || usandoPocion || respondido) return;
    const correcta = pregunta.correcta;
    const incorrectas = pregunta.opciones.filter((op) => op !== correcta);
    let nuevasIncorrectas = [...incorrectas];
    if (nuevasIncorrectas.length >= 2) nuevasIncorrectas = nuevasIncorrectas.slice(0, -2);
    else nuevasIncorrectas = nuevasIncorrectas.slice(0, -1);
    const nuevasOpciones = [correcta, ...nuevasIncorrectas];
    setOpcionesFiltradas(mezclar(nuevasOpciones));
    setUsandoPocion(true);
    if (consumirItem) await consumirItem('pocion_sabiduria');
  };

  const handleSeleccion = (opcion) => {
    if (respondido) return;
    setSeleccion(opcion);
  };

  const handleComprobar = async () => {
    if (procesandoRef.current || respondido) return;
    if (!seleccion) return;

    procesandoRef.current = true;
    setProcesando(true);

    try {
      setRespondido(true);
      const esCorrecta = seleccion === pregunta.correcta;

      if (esCorrecta) {
        const ganancia = 25;
        await sumarMonedas(ganancia);
        setMonedasGanadas((prev) => prev + ganancia);
        setAciertos((prev) => prev + 1);
        setMensajeFlotante({ message: `+${ganancia} 🪙`, icon: '✨' });
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#facc15', '#fff'],
        });
      } else {
        if (escudoActivo) {
          const consumido = await consumirItem('escudo_miguel');
          if (consumido) {
            setEscudoActivo(false);
            setEscudosUsados((prev) => prev + 1);
            setMostrarEscudo(true);
            setMensajeFlotante({ message: '🛡️ Escudo te protegió', icon: '🛡️' });
          } else {
            setEscudoActivo(false);
            setErrores((prev) => prev + 1);
            setMensajeFlotante({ message: '⚠️ Error con el escudo', icon: '⚠️' });
          }
        } else {
          await restarVida();
          setErrores((prev) => prev + 1);
          setMensajeFlotante({ message: '❤️ -1 vida', icon: '❤️' });
        }
      }
    } catch (error) {
      console.error('❌ Error en handleComprobar:', error);
    } finally {
      procesandoRef.current = false;
      setProcesando(false);
    }
  };

  const handleSiguiente = () => {
    if (paso + 1 < preguntas.length) {
      setPaso(paso + 1);
      setSeleccion(null);
      setRespondido(false);
      setUsandoPocion(false);
      setOpcionesFiltradas(null);
    } else {
      setTerminado(true);
      const total = preguntas.length;
      const precision = total > 0 ? (aciertos / total) * 100 : 0;
      const aprobado = precision >= 70;
      const monedasFinal = monedasGanadas + (aprobado ? 100 : 0);
      const fueConPerfecta = errores === 0;
      const esPrimeraVez = !yaCompletadoAntes;

      if (aprobado && completarNivel) {
        completarNivel(fueConPerfecta, esPrimeraVez);
      }

      onCompletar({
        monedas: monedasFinal,
        errores: errores,
        total: total,
        escudosUsados: escudosUsados,
        precision: Math.round(precision),
        aprobado: aprobado,
        nivelId: oracionActual?.id,
      });
    }
  };

  const FloatingMessage = ({ message, icon }) => {
    React.useEffect(() => {
      const timer = setTimeout(() => setMensajeFlotante(null), 1200);
      return () => clearTimeout(timer);
    }, []);
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.8 }}
        className="fixed left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
      >
        <div className="flex flex-col items-center gap-1 bg-black/70 backdrop-blur-md rounded-2xl px-5 py-3 border border-yellow-400/40 shadow-2xl">
          {icon && <span className="text-3xl">{icon}</span>}
          <span className="font-black text-white text-lg whitespace-nowrap">{message}</span>
        </div>
      </motion.div>
    );
  };

  if (terminado) return null;

  const progreso = ((paso + 1) / preguntas.length) * 100;

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-slate-900 text-white font-sans flex flex-col relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── EFECTOS DE FONDO ── */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
      <BackgroundParticles />

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="w-full max-w-2xl mx-auto space-y-6 px-4 py-6">
        <AnimatePresence>
          {mensajeFlotante && (
            <FloatingMessage message={mensajeFlotante.message} icon={mensajeFlotante.icon} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {mostrarEscudo && <AnimacionEscudo onFin={() => setMostrarEscudo(false)} />}
        </AnimatePresence>

        {/* ── BARRA DE PROGRESO ── */}
        <motion.div
          className="glass-card rounded-3xl p-6 text-center border border-white/10 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <p className="text-white/60 text-xs font-black uppercase tracking-wider mb-2">
            Pregunta {paso + 1} de {preguntas.length}
          </p>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-400 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              initial={{ width: 0 }}
              animate={{ width: `${progreso}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <motion.h3
            className="text-2xl font-black text-white mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {pregunta.pregunta}
          </motion.h3>
        </motion.div>

        {/* ── BOTÓN DE POCIÓN ── */}
        {!respondido && tienePocion && !usandoPocion && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={usarPocionSabiduria}
            className="w-full py-2.5 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 font-black text-sm uppercase tracking-widest hover:bg-purple-500/30 transition-all"
          >
            🧪 Usar Poción de Sabiduría
          </motion.button>
        )}

        {/* ── OPCIONES ── */}
        <div className="space-y-3">
          {opcionesMezcladas.map((op, idx) => {
            const isSelected = seleccion === op && !respondido;
            const isCorrect = respondido && op === pregunta.correcta;
            const isWrong = respondido && seleccion === op && !isCorrect;

            return (
              <motion.button
                key={op}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleSeleccion(op)}
                disabled={respondido || procesando}
                whileHover={!respondido && !procesando ? { scale: 1.02 } : {}}
                whileTap={!respondido && !procesando ? { scale: 0.98 } : {}}
                className={`w-full p-4 rounded-2xl border-2 font-black text-left transition-all ${
                  isCorrect
                    ? 'border-green-400 bg-green-500/20 text-green-300 shadow-[0_0_30px_rgba(34,197,94,0.2)]'
                    : isWrong
                    ? 'border-red-400 bg-red-500/20 text-red-300 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
                    : isSelected
                    ? 'border-yellow-400 bg-yellow-500/20 text-white shadow-[0_0_30px_rgba(250,204,21,0.2)]'
                    : 'border-white/10 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 mt-0.5 ${
                      isCorrect
                        ? 'bg-green-500 text-white'
                        : isWrong
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-yellow-400 text-blue-900'
                        : 'bg-white/5 text-white/30'
                    }`}
                  >
                    {isCorrect
                      ? '✓'
                      : isWrong
                      ? '✗'
                      : String.fromCharCode(65 + opcionesMezcladas.indexOf(op))}
                  </span>
                  <span>{op}</span>
                  {isSelected && !respondido && (
                    <motion.span
                      className="ml-auto text-[10px] text-yellow-400"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      ◀
                    </motion.span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* ── EXPLICACIÓN ── */}
        <AnimatePresence>
          {respondido && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-2xl border text-sm leading-relaxed ${
                seleccion === pregunta.correcta
                  ? 'bg-green-500/10 border-green-500/20 text-green-200'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-200'
              }`}
            >
              <p className="font-black mb-1 text-[10px] uppercase tracking-widest opacity-70">
                {seleccion === pregunta.correcta
                  ? '✦ ¡Correcto! Explicación'
                  : '📖 Respuesta correcta'}
              </p>
              <p className="font-bold">{pregunta.explicacion}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── BOTONES ── */}
        <div className="space-y-3">
          {!respondido ? (
            <motion.button
              whileHover={seleccion && !procesando ? { scale: 1.02 } : {}}
              whileTap={seleccion && !procesando ? { scale: 0.98 } : {}}
              onClick={handleComprobar}
              disabled={!seleccion || procesando}
              className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all duration-300 shadow-xl ${
                seleccion && !procesando
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-blue-900 hover:shadow-2xl'
                  : 'bg-white/5 text-white/10 cursor-not-allowed shadow-none'
              }`}
            >
              {procesando ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                  Procesando...
                </div>
              ) : (
                'Confirmar respuesta'
              )}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSiguiente}
              className="w-full py-5 rounded-2xl bg-white text-black font-black text-lg uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all"
            >
              {paso < preguntas.length - 1 ? 'Siguiente pregunta →' : 'Ver resultados 🏆'}
            </motion.button>
          )}
        </div>

        {/* ── INDICADORES ── */}
        <motion.div
          className="flex justify-between items-center text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-red-400 animate-pulse">❤️</span>
              <span className="font-black text-white">{vidas}</span>
            </div>
            {escudoActivo && (
              <div className="flex items-center gap-1.5 text-yellow-400">
                <span>🛡️</span>
                <span className="font-black">Escudo activo</span>
              </div>
            )}
          </div>
          <div className="text-yellow-400 font-black">+{monedasGanadas} 🪙</div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LeccionConcepto;