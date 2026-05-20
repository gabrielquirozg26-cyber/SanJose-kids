import React, { useState } from 'react';
import { useGame, MISIONES_DIARIAS, MISIONES_SEMANALES } from '../context/GameContext';
import confetti from 'canvas-confetti';

// ── Barra de progreso ──────────────────────────────────────────────────────
const BarraProgreso = ({ progreso, meta, color }) => {
  const pct = Math.min((progreso / meta) * 100, 100);
  return (
    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mt-2">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

// ── Tarjeta de misión ──────────────────────────────────────────────────────
const TarjetaMision = ({ def, estado, grupoKey, onReclamar }) => {
  const progreso   = estado?.progreso  ?? 0;
  const reclamada  = estado?.reclamada ?? false;
  const completada = progreso >= def.meta;
  const pct        = Math.min(Math.round((progreso / def.meta) * 100), 100);

  const [reclamando, setReclamando] = useState(false);

  const handleReclamar = async () => {
    if (reclamando || reclamada || !completada) return;
    setReclamando(true);
    const ok = await onReclamar(grupoKey, def.id, def.recompensa);
    if (ok) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#facc15', '#fff', '#3b82f6'],
      });
    }
    setReclamando(false);
  };

  return (
    <div className={`glass-card rounded-3xl p-5 border transition-all duration-300
      ${reclamada     ? 'border-white/5 opacity-60'
      : completada    ? 'border-yellow-400/40 shadow-[0_0_20px_rgba(250,204,21,0.1)]'
      :                 'border-white/10'}`}
    >
      <div className="flex items-start gap-4">
        {/* Icono */}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0
          ${reclamada  ? 'bg-white/5'
          : completada ? 'bg-yellow-500/20'
          :              'bg-white/5'}`}
        >
          {reclamada ? '✅' : def.icono}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <h3 className={`font-black text-sm truncate
              ${reclamada ? 'text-white/40' : 'text-white'}`}>
              {def.titulo}
            </h3>
            <span className="text-[9px] font-black text-yellow-400 shrink-0">
              🪙 +{def.recompensa}
            </span>
          </div>

          <p className={`text-xs leading-snug mb-2
            ${reclamada ? 'text-white/20' : 'text-white/50'}`}>
            {def.descripcion}
          </p>

          {/* Progreso */}
          {!reclamada && (
            <>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-white/40 font-bold">
                  {progreso} / {def.meta}
                </span>
                <span className={`text-[10px] font-black
                  ${completada ? 'text-yellow-400' : 'text-white/30'}`}>
                  {pct}%
                </span>
              </div>
              <BarraProgreso
                progreso={progreso}
                meta={def.meta}
                color={completada
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-300'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-400'}
              />
            </>
          )}
        </div>
      </div>

      {/* Botón reclamar */}
      {completada && !reclamada && (
        <button
          onClick={handleReclamar}
          disabled={reclamando}
          className="w-full mt-4 py-3 rounded-2xl bg-yellow-400 text-blue-900 font-black text-sm
            uppercase tracking-widest hover:bg-yellow-300 active:scale-95 transition-all
            shadow-lg shadow-yellow-400/20 disabled:opacity-50"
        >
          {reclamando ? 'Reclamando…' : `¡Reclamar 🪙 ${def.recompensa}!`}
        </button>
      )}

      {reclamada && (
        <p className="text-center text-[10px] text-white/25 font-black uppercase tracking-widest mt-3">
          Recompensa recibida ✓
        </p>
      )}
    </div>
  );
};

// ── Contador regresivo ─────────────────────────────────────────────────────
const CountdownBadge = ({ label, horas }) => (
  <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
    <span className="text-xs">⏱️</span>
    <span className="text-[10px] font-black text-white/50 uppercase tracking-wider">
      {label} · {horas}h
    </span>
  </div>
);

const horasHastaMedianoche = () => {
  const ahora = new Date();
  const medianoche = new Date();
  medianoche.setHours(24, 0, 0, 0);
  return Math.ceil((medianoche - ahora) / 3600000);
};

const horasHastaLunesSiguiente = () => {
  const ahora = new Date();
  const lunes = new Date();
  const diasHastaLunes = (8 - (lunes.getDay() || 7)) % 7 || 7;
  lunes.setDate(lunes.getDate() + diasHastaLunes);
  lunes.setHours(0, 0, 0, 0);
  return Math.ceil((lunes - ahora) / 3600000);
};

// ── Componente principal ───────────────────────────────────────────────────
const Misiones = () => {
  const { misionesState, reclamarMision } = useGame();
  const [tab, setTab] = useState('diarias');

  const diarias   = misionesState?.diarias   ?? {};
  const semanales = misionesState?.semanales ?? {};

  // Conteo de misiones completadas sin reclamar
  const pendientesDiarias   = MISIONES_DIARIAS.filter(d =>
    (diarias[d.id]?.progreso ?? 0) >= d.meta && !diarias[d.id]?.reclamada
  ).length;
  const pendientesSemanales = MISIONES_SEMANALES.filter(s =>
    (semanales[s.id]?.progreso ?? 0) >= s.meta && !semanales[s.id]?.reclamada
  ).length;
  const totalPendientes = pendientesDiarias + pendientesSemanales;

  return (
    <div className="py-6 space-y-4 animate-slide-up">

      {/* Cabecera */}
      <div className="glass-card rounded-3xl p-5 border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black text-yellow-400 uppercase tracking-[0.4em] mb-1">
              Centro de misiones
            </p>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
              Misiones
            </h2>
          </div>
          {totalPendientes > 0 && (
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/30 animate-bounce">
              <span className="text-blue-900 font-black text-sm">{totalPendientes}</span>
            </div>
          )}
        </div>

        {/* Contadores regresivos */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <CountdownBadge label="Diarias" horas={horasHastaMedianoche()} />
          <CountdownBadge label="Semanales" horas={horasHastaLunesSiguiente()} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'diarias',   label: 'Diarias',   badge: pendientesDiarias   },
          { id: 'semanales', label: 'Semanales', badge: pendientesSemanales },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-3 rounded-2xl font-black text-sm uppercase tracking-widest
              border transition-all relative
              ${tab === t.id
                ? 'bg-white text-black border-white'
                : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'}`}
          >
            {t.label}
            {t.badge > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-yellow-400
                flex items-center justify-center text-[10px] font-black text-blue-900">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista de misiones */}
      <div className="space-y-3">
        {tab === 'diarias' && (
          <>
            {MISIONES_DIARIAS.map(def => (
              <TarjetaMision
                key={def.id}
                def={def}
                estado={diarias[def.id]}
                grupoKey="diarias"
                onReclamar={reclamarMision}
              />
            ))}
            <p className="text-center text-white/20 text-[9px] font-black uppercase tracking-[0.3em] pt-2">
              Se renuevan cada día a medianoche
            </p>
          </>
        )}

        {tab === 'semanales' && (
          <>
            {MISIONES_SEMANALES.map(def => (
              <TarjetaMision
                key={def.id}
                def={def}
                estado={semanales[def.id]}
                grupoKey="semanales"
                onReclamar={reclamarMision}
              />
            ))}
            <p className="text-center text-white/20 text-[9px] font-black uppercase tracking-[0.3em] pt-2">
              Se renuevan cada lunes
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Misiones;
