import React, { useState, useEffect } from 'react';
import { useMissions } from '../context/MissionsContext';
import { useGame } from '../context/GameContext';
import confetti from 'canvas-confetti';

const Misiones = () => {
  const { misionesState, reclamarMision, MISIONES_DIARIAS, MISIONES_SEMANALES, loading } = useMissions();
  const { logrosPendientes, canjearLogro, titulosPorNivel } = useGame();
  const [reclamando, setReclamando] = useState(null);
  const [canjeando, setCanjeando] = useState(null);
  const [renderKey, setRenderKey] = useState(0);

  // Forzar re-render cuando cambie misionesState
  useEffect(() => {
    console.log('🔍 Misiones - misionesState:', misionesState);
    console.log('🔍 Misiones - diarias:', misionesState?.diarias);
    console.log('🔍 Misiones - semanales:', misionesState?.semanales);
    console.log('🔍 Misiones - keys diarias:', Object.keys(misionesState?.diarias || {}));
    console.log('🔍 Misiones - keys semanales:', Object.keys(misionesState?.semanales || {}));
    
    // Si hay datos, forzar re-render
    if (misionesState && Object.keys(misionesState.diarias || {}).length > 0) {
      setRenderKey(prev => prev + 1);
    }
  }, [misionesState]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-white/40 text-sm mt-4">Cargando misiones...</p>
      </div>
    );
  }

  // Si no hay misionesState o está vacío
  if (!misionesState || !misionesState.diarias || Object.keys(misionesState.diarias).length === 0) {
    return (
      <div className="py-6 space-y-8 animate-slide-up">
        <div className="text-center">
          <p className="text-[9px] font-black text-yellow-400 uppercase tracking-[0.5em]">Desafíos</p>
          <h2 className="text-3xl font-black text-white tracking-tighter">Misiones</h2>
          <p className="text-white/40 text-xs mt-1">Completa desafíos diarios y semanales para ganar monedas</p>
        </div>
        <div className="glass-card rounded-2xl p-8 text-center border border-white/10">
          <p className="text-4xl mb-3">🔄</p>
          <p className="text-white font-black">Cargando misiones...</p>
          <p className="text-white/40 text-xs mt-1">Espera un momento</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-yellow-400 text-blue-900 rounded-xl font-black text-sm"
          >
            Recargar 🔄
          </button>
        </div>
      </div>
    );
  }

  const diarias = misionesState.diarias || {};
  const semanales = misionesState.semanales || {};

  const handleReclamar = async (grupo, id, recompensa) => {
    setReclamando(id);
    const ok = await reclamarMision(grupo, id, recompensa);
    setReclamando(null);
    if (ok) {
      confetti({ particleCount: 80, spread: 50, origin: { y: 0.6 }, colors: ['#facc15', '#fff'] });
    }
  };

  const handleCanjear = async (logroId) => {
    setCanjeando(logroId);
    const ok = await canjearLogro(logroId);
    setCanjeando(null);
    if (ok) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#a855f7', '#facc15'] });
    }
  };

  // Mostrar debug de los datos que tenemos
  console.log('📊 Renderizando misiones - diarias keys:', Object.keys(diarias));
  console.log('📊 Renderizando misiones - semanales keys:', Object.keys(semanales));

  return (
    <div className="py-6 space-y-8 animate-slide-up" key={renderKey}>
      {/* Encabezado */}
      <div className="text-center">
        <p className="text-[9px] font-black text-yellow-400 uppercase tracking-[0.5em]">Desafíos</p>
        <h2 className="text-3xl font-black text-white tracking-tighter">Misiones</h2>
        <p className="text-white/40 text-xs mt-1">Completa desafíos diarios y semanales para ganar monedas</p>
      </div>

      {/* LOGROS DE NIVEL */}
      {logrosPendientes && logrosPendientes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🏆</span>
            <h3 className="text-white font-black text-sm uppercase tracking-wider bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
              Recompensas de nivel ({logrosPendientes.length})
            </h3>
          </div>
          <div className="space-y-3">
            {logrosPendientes.map(logro => {
              const titulo = titulosPorNivel?.find(t => t.id === logro.id);
              if (!titulo) return null;
              return (
                <div key={logro.id} className="glass-card rounded-2xl p-4 border border-purple-500/30 bg-purple-500/5 transition-all hover:scale-[1.01]">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">🎖️</span>
                    <div className="flex-1">
                      <p className="font-black text-white text-lg">{titulo.nombre}</p>
                      <p className="text-white/40 text-xs">Completa el nivel para desbloquear este título</p>
                    </div>
                    <button
                      onClick={() => handleCanjear(logro.id)}
                      disabled={canjeando === logro.id}
                      className="px-5 py-2 rounded-xl font-black text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 transition-all disabled:opacity-50"
                    >
                      {canjeando === logro.id ? '...' : 'Canjear'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MISIONES DIARIAS */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">☀️</span>
          <h3 className="text-white font-black text-sm uppercase tracking-wider bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
            Diarias ({Object.keys(diarias).length})
          </h3>
        </div>
        <div className="space-y-3">
          {MISIONES_DIARIAS.map(def => {
            const mision = diarias[def.id];
            if (!mision) {
              console.warn(`⚠️ Misión ${def.id} no encontrada en diarias`);
              return (
                <div key={def.id} className="glass-card rounded-2xl p-4 border border-red-500/30 bg-red-500/5">
                  <p className="text-red-400 text-sm">Error: {def.id} no encontrada</p>
                </div>
              );
            }
            const completada = mision.progreso >= def.meta;
            const reclamada = mision.reclamada;
            const porcentaje = Math.min((mision.progreso / def.meta) * 100, 100);
            const progresoMostrar = `${mision.progreso}/${def.meta}`;

            return (
              <div key={def.id} className={`glass-card rounded-2xl p-4 border transition-all hover:scale-[1.01] ${
                completada && !reclamada ? 'border-yellow-400/60 bg-yellow-400/10' : 'border-white/10'
              }`}>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{def.icono}</span>
                  <div className="flex-1">
                    <p className="font-black text-white text-sm">{def.titulo}</p>
                    <p className="text-white/40 text-xs">{def.descripcion}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full transition-all duration-500" style={{ width: `${porcentaje}%` }} />
                      </div>
                      <span className="text-white/40 text-[10px] font-black min-w-[30px] text-right">{progresoMostrar}</span>
                    </div>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="text-yellow-400 font-black text-sm">+{def.recompensa} 🪙</p>
                    {!reclamada && completada && (
                      <button
                        onClick={() => handleReclamar('diarias', def.id, def.recompensa)}
                        disabled={reclamando === def.id}
                        className="mt-2 px-4 py-1.5 rounded-xl font-black text-xs bg-yellow-400 text-blue-900 hover:scale-105 transition-all"
                      >
                        {reclamando === def.id ? '...' : 'Reclamar'}
                      </button>
                    )}
                    {reclamada && <p className="text-green-400 text-[10px] font-black mt-2">✓ Reclamada</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MISIONES SEMANALES */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🌟</span>
          <h3 className="text-white font-black text-sm uppercase tracking-wider bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Semanales ({Object.keys(semanales).length})
          </h3>
        </div>
        <div className="space-y-3">
          {MISIONES_SEMANALES.map(def => {
            const mision = semanales[def.id];
            if (!mision) {
              console.warn(`⚠️ Misión ${def.id} no encontrada en semanales`);
              return (
                <div key={def.id} className="glass-card rounded-2xl p-4 border border-red-500/30 bg-red-500/5">
                  <p className="text-red-400 text-sm">Error: {def.id} no encontrada</p>
                </div>
              );
            }
            const completada = mision.progreso >= def.meta;
            const reclamada = mision.reclamada;
            const porcentaje = Math.min((mision.progreso / def.meta) * 100, 100);
            const progresoMostrar = `${mision.progreso}/${def.meta}`;

            return (
              <div key={def.id} className={`glass-card rounded-2xl p-4 border transition-all hover:scale-[1.01] ${
                completada && !reclamada ? 'border-blue-400/60 bg-blue-400/10' : 'border-white/10'
              }`}>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{def.icono}</span>
                  <div className="flex-1">
                    <p className="font-black text-white text-sm">{def.titulo}</p>
                    <p className="text-white/40 text-xs">{def.descripcion}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-500" style={{ width: `${porcentaje}%` }} />
                      </div>
                      <span className="text-white/40 text-[10px] font-black min-w-[30px] text-right">{progresoMostrar}</span>
                    </div>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="text-yellow-400 font-black text-sm">+{def.recompensa} 🪙</p>
                    {!reclamada && completada && (
                      <button
                        onClick={() => handleReclamar('semanales', def.id, def.recompensa)}
                        disabled={reclamando === def.id}
                        className="mt-2 px-4 py-1.5 rounded-xl font-black text-xs bg-yellow-400 text-blue-900 hover:scale-105 transition-all"
                      >
                        {reclamando === def.id ? '...' : 'Reclamar'}
                      </button>
                    )}
                    {reclamada && <p className="text-green-400 text-[10px] font-black mt-2">✓ Reclamada</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Misiones;
