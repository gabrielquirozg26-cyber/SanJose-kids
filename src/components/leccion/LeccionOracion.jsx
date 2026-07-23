// src/components/leccion/LeccionOracion.jsx
import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useLeccion from '../../hooks/useLeccion';
import HeaderLeccion from './HeaderLeccion';
import ProgressBar from './ProgressBar';
import EjercicioSeleccion from './EjercicioSeleccion';
import EjercicioOrdenar from './EjercicioOrdenar';
import EjercicioEscritura from './EjercicioEscritura';
import AnimacionEscudo from './AnimacionEscudo';
import PantallaVictoria from './PantallaVictoria';

// ── PARTÍCULAS DE FONDO ──────────────────────────────────────────────────
const BackgroundParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 3,
    duration: 5 + Math.random() * 10,
    delay: Math.random() * 5,
    opacity: 0.05 + Math.random() * 0.15,
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
            y: [p.y, p.y - 20, p.y],
            x: [p.x, p.x + (Math.random() - 0.5) * 10, p.x],
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

const LeccionOracion = ({
  oracionActual,
  setEnLeccion,
  completarNivel,
  sumarMonedas,
  restarVida,
  consumirItem,
  inventario,
  nivelesCompletados,
  vidas,
  onCompletar,
  onVolverMapa,
}) => {
  const {
    paso,
    resultado,
    seleccionada,
    setSeleccionada,
    respuestaOrden,
    setRespOrden,
    escrito,
    setEscrito,
    errores,
    monedasAc,
    escudoActivo,
    mostrarEscudo,
    setMostrarEscudo,
    escudosUsados,
    usandoPocion,
    opcionesFiltradas,
    mensajeFlotante,
    handleCerrarMensajeFlotante,
    verso,
    tipo,
    progreso,
    isComplete,
    tienePocion,
    banco,
    procesando,
    handleValidar,
    handleSiguiente,
    handleUsarPocion,
  } = useLeccion({
    oracionActual,
    setEnLeccion,
    completarNivel,
    sumarMonedas,
    restarVida,
    consumirItem,
    inventario,
    nivelesCompletados,
    vidas,
  });

  const hasCompleted = useRef(false);

  const handleComplete = useCallback(() => {
    if (isComplete && banco.length > 0 && !hasCompleted.current) {
      hasCompleted.current = true;
      const precision = Math.round(((banco.length - errores) / banco.length) * 100);
      onCompletar({
        monedas: monedasAc,
        errores: errores,
        total: banco.length,
        escudosUsados: escudosUsados,
        precision: precision,
      });
    }
  }, [isComplete, banco.length, errores, monedasAc, escudosUsados, onCompletar]);

  useEffect(() => {
    handleComplete();
  }, [handleComplete]);

  // Si está completado, mostrar pantalla de victoria
  if (isComplete && banco.length > 0) {
    return (
      <PantallaVictoria
        oracion={oracionActual}
        monedasGanadas={monedasAc}
        errores={errores}
        totalVersos={banco.length}
        escudosUsados={escudosUsados}
        onVolverMapa={onVolverMapa}
      />
    );
  }

  // ── MENSAJE FLOTANTE ──
  const FloatingMessage = ({ message, icon }) => {
    useEffect(() => {
      const timer = setTimeout(handleCerrarMensajeFlotante, 1200);
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

      {/* ── MENSAJE FLOTANTE ── */}
      <AnimatePresence>
        {mensajeFlotante && (
          <FloatingMessage
            message={mensajeFlotante.message}
            icon={mensajeFlotante.icon}
          />
        )}
      </AnimatePresence>

      {/* ── ANIMACIÓN DEL ESCUDO ── */}
      <AnimatePresence>
        {mostrarEscudo && (
          <AnimacionEscudo onFin={() => setMostrarEscudo(false)} />
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <HeaderLeccion
        titulo={oracionActual.nombre}
        icono={oracionActual.icono}
        progreso={progreso}
        vidas={vidas}
        escudoActivo={escudoActivo}
        onCerrar={() => setEnLeccion(false)}
      />

      {/* ── BARRA DE PROGRESO ── */}
      <ProgressBar
        progreso={progreso}
        paso={paso}
        total={banco.length}
        tipo={tipo}
        titulo={oracionActual.nombre}
        icono={oracionActual.icono}
      />

      {/* ── CONTENIDO PRINCIPAL ── */}
      <motion.main
        className="flex-1 flex flex-col justify-center px-5 max-w-2xl mx-auto w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="relative">
          {tipo === 'seleccion' && (
            <EjercicioSeleccion
              verso={verso}
              resultado={resultado === 'escudo' ? null : resultado}
              seleccionada={seleccionada}
              onSeleccionar={setSeleccionada}
              opcionesFiltradas={opcionesFiltradas}
            />
          )}
          {tipo === 'ordenar' && (
            <EjercicioOrdenar
              verso={verso}
              resultado={resultado === 'escudo' ? null : resultado}
              onRespuesta={setRespOrden}
            />
          )}
          {tipo === 'escritura' && (
            <EjercicioEscritura
              verso={verso}
              resultado={resultado === 'escudo' ? null : resultado}
              escrito={escrito}
              onEscribir={setEscrito}
            />
          )}
        </div>
      </motion.main>

      {/* ── FOOTER ── */}
      <motion.footer
        className="p-6 pb-10 max-w-2xl mx-auto w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {!resultado || resultado === 'escudo' ? (
          <>
            {/* Botón de poción */}
            {tipo === 'seleccion' && tienePocion && !usandoPocion && !resultado && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUsarPocion}
                className="w-full mb-3 py-2.5 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 font-black text-sm uppercase tracking-widest hover:bg-purple-500/30 transition-all"
              >
                🧪 Usar Poción de Sabiduría
              </motion.button>
            )}

            {/* Botón comprobar */}
            <motion.button
              id="btn-comprobar"
              whileHover={
                !procesando &&
                ((tipo === 'seleccion' && seleccionada) ||
                  (tipo === 'ordenar' &&
                    respuestaOrden.trim().split(' ').length ===
                      verso?.palabrasOrdenar?.length) ||
                  (tipo === 'escritura' && escrito.trim().length > 0))
                  ? { scale: 1.03, y: -2 }
                  : {}
              }
              whileTap={
                !procesando &&
                ((tipo === 'seleccion' && seleccionada) ||
                  (tipo === 'ordenar' &&
                    respuestaOrden.trim().split(' ').length ===
                      verso?.palabrasOrdenar?.length) ||
                  (tipo === 'escritura' && escrito.trim().length > 0))
                  ? { scale: 0.95 }
                  : {}
              }
              onClick={handleValidar}
              disabled={
                procesando ||
                !(
                  (tipo === 'seleccion' && seleccionada) ||
                  (tipo === 'ordenar' &&
                    respuestaOrden.trim().split(' ').length ===
                      verso?.palabrasOrdenar?.length) ||
                  (tipo === 'escritura' && escrito.trim().length > 0)
                )
              }
              className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all duration-300 shadow-xl ${
                !procesando &&
                ((tipo === 'seleccion' && seleccionada) ||
                  (tipo === 'ordenar' &&
                    respuestaOrden.trim().split(' ').length ===
                      verso?.palabrasOrdenar?.length) ||
                  (tipo === 'escritura' && escrito.trim().length > 0))
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-blue-900 hover:shadow-2xl'
                  : 'bg-white/5 text-white/10 cursor-not-allowed shadow-none'
              }`}
            >
              {procesando ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                  Procesando...
                </div>
              ) : (
                'Comprobar'
              )}
            </motion.button>
          </>
        ) : resultado === 'acierto' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full p-5 rounded-2xl flex items-center justify-between border backdrop-blur-xl bg-green-500/20 border-green-500/30 shadow-lg shadow-green-500/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-xl bg-green-500">
                ⚡
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-50 text-green-300">
                  ¡Perfecto!
                </p>
                <p className="text-base font-black text-green-300">
                  +{tipo === 'seleccion' ? 25 : tipo === 'ordenar' ? 35 : 40}{' '}
                  Monedas ✨
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSiguiente}
              className="bg-white text-black px-8 py-3 rounded-2xl font-black text-sm shadow-xl"
            >
              {paso < banco.length - 1 ? 'CONTINUAR' : 'VER RESULTADOS'}
            </motion.button>
          </motion.div>
        ) : resultado === 'escudo' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full p-5 rounded-2xl flex items-center justify-between border backdrop-blur-xl bg-yellow-500/20 border-yellow-500/30 shadow-lg shadow-yellow-500/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-xl bg-yellow-500">
                🛡️
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-50 text-yellow-300">
                  ¡Protegido!
                </p>
                <p className="text-base font-black text-yellow-300">
                  El escudo absorbió el error
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSiguiente}
              className="bg-white text-black px-8 py-3 rounded-2xl font-black text-sm shadow-xl"
            >
              {paso < banco.length - 1 ? 'CONTINUAR' : 'VER RESULTADOS'}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full p-5 rounded-2xl flex items-center justify-between border backdrop-blur-xl bg-red-500/20 border-red-500/30 shadow-lg shadow-red-500/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-xl bg-red-500">
                🔥
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-50 text-red-300">
                  Casi…
                </p>
                <p className="text-base font-black text-red-300">
                  ❤️ Has perdido una vida
                </p>
                <p className="text-xs font-bold text-red-400/70">
                  Era: "{verso?.palabraFaltante}"
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSiguiente}
              className="bg-white text-black px-8 py-3 rounded-2xl font-black text-sm shadow-xl"
            >
              {paso < banco.length - 1 ? 'CONTINUAR' : 'VER RESULTADOS'}
            </motion.button>
          </motion.div>
        )}
      </motion.footer>
    </motion.div>
  );
};

export default LeccionOracion;