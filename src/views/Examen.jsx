import React, { useState, useMemo, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import confetti from 'canvas-confetti';
import examenData from '../data/examen.json';

// ── Helpers ────────────────────────────────────────────────────────────────
const mezclar = (arr) => [...arr].sort(() => Math.random() - 0.5);

const getPreguntasUnidad = (claveUnidad, cantidad = 8) => {
  const unidad = examenData[claveUnidad];
  if (!unidad) return [];
  const todas = unidad.oraciones.flatMap(o => o.preguntas);
  return mezclar(todas).slice(0, cantidad);
};

// ══════════════════════════════════════════════════════════════════════════
// PANTALLA DE RESULTADOS
// ══════════════════════════════════════════════════════════════════════════
const ResultadosExamen = ({
  preguntas, respuestas, unidadNombre,
  monedasGanadas, aprobado, onContinuar, onReintentar,
}) => {
  const correctas = preguntas.filter((p, i) => respuestas[i] === p.correcta).length;
  const total     = preguntas.length;
  const precision = Math.round((correctas / total) * 100);

  useEffect(() => {
    if (!aprobado) return;
    const boom = () => confetti({
      particleCount: 250, spread: 130, origin: { y: 0.4 },
      colors: ['#facc15', '#fff', '#10b981', '#3b82f6'],
    });
    boom();
    setTimeout(boom, 800);
  }, []);

  return (
    <div className="min-h-screen bg-[#050b14] text-white font-sans flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-yellow-400/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm space-y-5 animate-slide-up">

        {/* Resultado principal */}
        <div className="text-center space-y-3">
          <div className={`w-28 h-28 rounded-full mx-auto flex items-center justify-center text-6xl border-4
            ${aprobado
              ? 'bg-green-500/10 border-green-400/60 shadow-[0_0_50px_rgba(34,197,94,0.3)]'
              : 'bg-red-500/10 border-red-400/60 shadow-[0_0_30px_rgba(239,68,68,0.2)]'}`}>
            {aprobado ? '🏆' : '📖'}
          </div>
          <div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Examen de unidad</p>
            <h1 className="text-2xl font-black text-white tracking-tighter mt-1">{unidadNombre}</h1>
          </div>
          <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border font-black text-sm tracking-widest uppercase
            ${aprobado
              ? 'bg-green-500/15 border-green-400/40 text-green-400'
              : 'bg-red-500/15 border-red-400/40 text-red-400'}`}>
            {aprobado ? '✅ Aprobado — +200🪙' : '❌ Reprueba — Inténtalo de nuevo'}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className={`glass-card rounded-2xl p-4 text-center border ${precision >= 70 ? 'border-green-400/30' : 'border-red-400/30'}`}>
            <p className="text-2xl mb-1">{precision >= 90 ? '💯' : precision >= 70 ? '🎯' : '📉'}</p>
            <p className={`font-black text-xl ${precision >= 70 ? 'text-green-400' : 'text-red-400'}`}>{precision}%</p>
            <p className="text-white/30 text-[9px] font-black uppercase tracking-wider mt-0.5">Precisión</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center border border-white/10">
            <p className="text-2xl mb-1">✅</p>
            <p className="text-white font-black text-xl">{correctas}/{total}</p>
            <p className="text-white/30 text-[9px] font-black uppercase tracking-wider mt-0.5">Correctas</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center border border-yellow-400/20">
            <p className="text-2xl mb-1">🪙</p>
            <p className="text-yellow-400 font-black text-xl">+{monedasGanadas + (aprobado ? 200 : 0)}</p>
            <p className="text-white/30 text-[9px] font-black uppercase tracking-wider mt-0.5">Ganadas</p>
          </div>
        </div>

        {/* Revisión de respuestas */}
        <div className="glass-card rounded-3xl p-4 border border-white/10 space-y-3 max-h-72 overflow-y-auto">
          <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">Revisión de respuestas</p>
          {preguntas.map((p, i) => {
            const acertada = respuestas[i] === p.correcta;
            return (
              <div key={p.id} className={`rounded-2xl p-3 border text-xs space-y-1.5
                ${acertada ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                <p className="font-black text-white leading-snug">{p.pregunta}</p>
                {!acertada && (
                  <p className="text-red-300 font-bold">Tu respuesta: {respuestas[i] ?? 'Sin responder'}</p>
                )}
                <p className={`font-bold ${acertada ? 'text-green-300' : 'text-yellow-300'}`}>
                  {acertada ? '✓' : '→'} {p.correcta}
                </p>
                <p className="text-white/40 italic leading-snug">{p.explicacion}</p>
              </div>
            );
          })}
        </div>

        {/* Botones */}
        <div className="space-y-3">
          {aprobado ? (
            <button onClick={onContinuar}
              className="w-full py-5 rounded-2xl bg-yellow-400 text-blue-900 font-black text-lg
                uppercase tracking-widest shadow-xl shadow-yellow-400/20 hover:bg-yellow-300 active:scale-95 transition-all">
              ¡Continuar! 🚀
            </button>
          ) : (
            <>
              <button onClick={onReintentar}
                className="w-full py-4 rounded-2xl bg-white text-black font-black text-base
                  uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                Reintentar examen
              </button>
              <button onClick={onContinuar}
                className="w-full py-3 rounded-2xl border border-white/20 text-white/60 font-black text-sm
                  uppercase tracking-widest hover:border-white/40 active:scale-95 transition-all">
                Volver al mapa
              </button>
            </>
          )}
        </div>

        {!aprobado && (
          <p className="text-center text-white/30 text-xs italic">
            Necesitas 70% para aprobar. Repasa las oraciones y vuelve a intentarlo.
          </p>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// EXAMEN PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════
const ExamenPrincipal = ({ claveUnidad, unidadNombre, onTerminar }) => {
  const { vidas, restarVida, sumarMonedas, aprobarExamen } = useGame();

  const preguntas = useMemo(() => getPreguntasUnidad(claveUnidad, 8), [claveUnidad]);

  const [paso, setPaso]             = useState(0);
  const [seleccionada, setSelec]    = useState(null);
  const [confirmada, setConfirmada] = useState(false);
  const [respuestas, setRespuestas] = useState([]);
  const [mostrarRes, setMostrarRes] = useState(false);
  const [monedasAc, setMonedasAc]   = useState(0);
  const [aprobado, setAprobado]     = useState(false);

  const pregunta = preguntas[paso];
  const progreso = ((paso + 1) / preguntas.length) * 100;

  const opciones = useMemo(() =>
    pregunta ? mezclar(pregunta.opciones) : [],
    [pregunta?.id]
  );

  if (!pregunta && !mostrarRes) return null;

  const confirmar = async () => {
    if (!seleccionada) return;
    setConfirmada(true);
    const esCorrecta = seleccionada === pregunta.correcta;
    if (esCorrecta) {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 }, colors: ['#facc15', '#fff'] });
      await sumarMonedas(50);
      setMonedasAc(p => p + 50);
    } else {
      await restarVida();
    }
  };

  const siguiente = async () => {
    const nuevasResp = [...respuestas, seleccionada];
    setRespuestas(nuevasResp);

    if (paso < preguntas.length - 1) {
      setPaso(p => p + 1);
      setSelec(null);
      setConfirmada(false);
    } else {
      // Calcular resultado final
      const correctas  = preguntas.filter((p, i) => nuevasResp[i] === p.correcta).length;
      const precision  = Math.round((correctas / preguntas.length) * 100);
      const pasó       = precision >= 70;
      setAprobado(pasó);

      if (pasó) await aprobarExamen(claveUnidad);

      setMostrarRes(true);
    }
  };

  if (mostrarRes) {
    return (
      <ResultadosExamen
        preguntas={preguntas}
        respuestas={respuestas}
        unidadNombre={unidadNombre}
        monedasGanadas={monedasAc}
        aprobado={aprobado}
        onContinuar={onTerminar}
        onReintentar={() => {
          setPaso(0); setSelec(null); setConfirmada(false);
          setRespuestas([]); setMostrarRes(false); setMonedasAc(0); setAprobado(false);
        }}
      />
    );
  }

  const esCorrecta = seleccionada === pregunta.correcta;

  return (
    <div className="min-h-screen bg-[#050b14] text-white font-sans flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="p-5 flex items-center gap-4 max-w-2xl mx-auto w-full">
        <button onClick={onTerminar}
          className="text-white/30 hover:text-white/60 transition-colors text-xl font-black p-1">✕</button>
        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full transition-all duration-700"
            style={{ width: `${progreso}%` }} />
        </div>
        <div className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
          <span className="text-red-400 animate-pulse">❤️</span>
          <span className="font-black text-sm">{vidas}</span>
        </div>
      </header>

      {/* Badge */}
      <div className="flex items-center justify-between px-5 max-w-2xl mx-auto w-full mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎓</span>
          <span className="text-[9px] font-black text-yellow-400 uppercase tracking-[0.3em]">{unidadNombre}</span>
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border
          text-yellow-300 border-yellow-500/30 bg-yellow-500/10">
          Examen · {paso + 1}/{preguntas.length}
        </span>
      </div>

      {/* Pregunta */}
      <main className="flex-1 flex flex-col justify-center px-5 max-w-2xl mx-auto w-full">
        <div className="space-y-4">

          <div className="glass-card p-7 rounded-3xl border border-white/10 shadow-2xl">
            <p className="text-[9px] font-black text-yellow-400 uppercase tracking-[0.3em] mb-3">
              Pregunta de catequesis
            </p>
            <h2 className="text-xl font-black text-white leading-snug">{pregunta.pregunta}</h2>
          </div>

          <div className="space-y-3">
            {opciones.map((op, i) => {
              const esSelec    = op === seleccionada;
              const esCorr     = op === pregunta.correcta;
              const mostrarBien = confirmada && esCorr;
              const mostrarMal  = confirmada && esSelec && !esCorr;

              return (
                <button key={i} onClick={() => !confirmada && setSelec(op)}
                  className={`w-full p-5 rounded-2xl border-2 font-bold text-sm text-left transition-all duration-200 active:scale-[0.99] leading-snug
                    ${mostrarBien                       ? 'border-green-400 bg-green-500/20 text-green-200' : ''}
                    ${mostrarMal                        ? 'border-red-400 bg-red-500/20 text-red-200' : ''}
                    ${esSelec && !confirmada            ? 'border-yellow-400 bg-yellow-500/10 text-white scale-[1.01]' : ''}
                    ${!esSelec && !confirmada           ? 'border-white/10 bg-white/5 text-white/70 hover:border-white/30' : ''}
                    ${confirmada && !esSelec && !esCorr ? 'border-white/5 bg-white/5 text-white/30 opacity-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 mt-0.5
                      ${mostrarBien ? 'bg-green-500 text-white'
                      : mostrarMal  ? 'bg-red-500 text-white'
                      : esSelec     ? 'bg-yellow-400 text-blue-900'
                      :               'bg-white/5 text-white/30'}`}>
                      {mostrarBien ? '✓' : mostrarMal ? '✗' : String.fromCharCode(65 + i)}
                    </span>
                    <span>{op}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explicación */}
          {confirmada && (
            <div className={`p-4 rounded-2xl border animate-slide-up text-sm leading-relaxed
              ${esCorrecta ? 'bg-green-500/10 border-green-500/20 text-green-200' : 'bg-blue-500/10 border-blue-500/20 text-blue-200'}`}>
              <p className="font-black mb-1 text-[10px] uppercase tracking-widest opacity-70">
                {esCorrecta ? '✦ ¡Correcto! Explicación' : '📖 Respuesta correcta'}
              </p>
              <p className="font-bold">{pregunta.explicacion}</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 pb-10 max-w-2xl mx-auto w-full">
        {!confirmada ? (
          <button onClick={confirmar} disabled={!seleccionada}
            className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all duration-300
              ${seleccionada
                ? 'bg-yellow-400 text-blue-900 shadow-xl shadow-yellow-400/20 hover:bg-yellow-300 hover:scale-[1.02] active:scale-95'
                : 'bg-white/5 text-white/10 cursor-not-allowed'}`}>
            Confirmar respuesta
          </button>
        ) : (
          <button onClick={siguiente}
            className="w-full py-5 rounded-2xl bg-white text-black font-black text-lg
              uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
            {paso < preguntas.length - 1 ? 'Siguiente pregunta →' : 'Ver resultados 🏆'}
          </button>
        )}
      </footer>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// INTRO + WRAPPER
// ══════════════════════════════════════════════════════════════════════════
const Examen = ({ claveUnidad, unidadNombre, onCerrar }) => {
  const [iniciado, setIniciado] = useState(false);

  if (!iniciado) {
    return (
      <div className="min-h-screen bg-[#050b14] text-white font-sans flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-sm space-y-6 animate-slide-up text-center">
          <div className="w-24 h-24 rounded-full bg-yellow-400/10 border-2 border-yellow-400/40
            flex items-center justify-center text-5xl mx-auto shadow-[0_0_40px_rgba(250,204,21,0.25)]">
            🎓
          </div>

          <div>
            <p className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.5em] mb-2">Examen de unidad</p>
            <h1 className="text-3xl font-black text-white tracking-tighter">{unidadNombre}</h1>
          </div>

          <div className="glass-card rounded-3xl p-5 border border-white/10 text-left space-y-3">
            <p className="text-white font-black text-sm">Antes de empezar:</p>
            <ul className="space-y-2">
              {[
                ['📝', '8 preguntas de comprensión catequética'],
                ['🚫', 'Sin pistas — debes conocer la doctrina'],
                ['❤️', 'Cada error te cuesta una vida'],
                ['🪙', '+50 monedas por respuesta correcta'],
                ['🏆', '+200 monedas extra si apruebas'],
                ['✅', 'Necesitas 70% para aprobar'],
                ['📖', 'Al final verás la explicación de cada respuesta'],
              ].map(([icono, texto]) => (
                <li key={texto} className="flex items-start gap-2 text-white/60 text-xs">
                  <span className="shrink-0 mt-0.5">{icono}</span>
                  <span>{texto}</span>
                </li>
              ))}
            </ul>
          </div>

          <button onClick={() => setIniciado(true)}
            className="w-full py-5 rounded-2xl bg-yellow-400 text-blue-900 font-black text-lg
              uppercase tracking-widest shadow-xl shadow-yellow-400/20 hover:bg-yellow-300 active:scale-95 transition-all">
            Comenzar examen 🎓
          </button>

          <button onClick={onCerrar}
            className="text-white/30 text-sm font-black uppercase tracking-widest hover:text-white/50 transition-colors">
            Volver al mapa
          </button>
        </div>
      </div>
    );
  }

  return <ExamenPrincipal claveUnidad={claveUnidad} unidadNombre={unidadNombre} onTerminar={onCerrar} />;
};

export default Examen;
