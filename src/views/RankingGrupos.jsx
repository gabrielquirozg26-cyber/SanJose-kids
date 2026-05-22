import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';

const MEDALLAS = ['🥇', '🥈', '🥉', '📜', '📜'];
const COLORES_GRUPO = [
  { bg: 'from-amber-500/20 to-amber-400/10', border: 'border-amber-400/40', text: 'text-amber-300', glow: 'shadow-amber-400/20' },
  { bg: 'from-slate-400/20 to-slate-300/10', border: 'border-slate-400/40', text: 'text-slate-300', glow: 'shadow-slate-400/20' },
  { bg: 'from-rose-500/20 to-rose-400/10', border: 'border-rose-400/40', text: 'text-rose-300', glow: 'shadow-rose-400/20' },
  { bg: 'from-emerald-500/20 to-emerald-400/10', border: 'border-emerald-400/40', text: 'text-emerald-300', glow: 'shadow-emerald-400/20' },
  { bg: 'from-indigo-500/20 to-indigo-400/10', border: 'border-indigo-400/40', text: 'text-indigo-300', glow: 'shadow-indigo-400/20' },
];

const RankingGrupos = () => {
  const { obtenerRankingGrupos } = useGame();
  const [grupos, setGrupos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [expandidos, setExpandidos] = useState({});

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const data = await obtenerRankingGrupos();
        setGrupos(data);
      } catch (e) {
        console.error(e);
        setError('general');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const toggleExpandir = (nombreGrupo) => {
    setExpandidos(prev => ({ ...prev, [nombreGrupo]: !prev[nombreGrupo] }));
  };

  if (cargando) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <div className="w-8 h-8 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin" />
        <p className="text-white/40 text-xs font-black uppercase tracking-widest">Cargando grupos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center border border-red-500/20">
        <p className="text-red-400 font-black text-sm">Error al cargar ranking de grupos</p>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6 animate-slide-up">
      <div className="text-center mb-2">
        <p className="text-[9px] font-black text-yellow-400 uppercase tracking-[0.4em]">Competencia entre grupos</p>
        <h2 className="text-3xl font-black text-white tracking-tighter">Ranking de Grupos</h2>
        <p className="text-white/40 text-xs mt-1">Ordenado por monedas totales del grupo</p>
      </div>

      {grupos.map((grupo, idx) => {
        const estaExpandido = expandidos[grupo.nombre];
        const topAmostrar = estaExpandido ? grupo.estudiantes.slice(0, 10) : grupo.top3;
        const estilo = COLORES_GRUPO[idx % COLORES_GRUPO.length];
        const medalla = idx < 3 ? MEDALLAS[idx] : `#${idx+1}`;

        return (
          <div
            key={grupo.nombre}
            className={`glass-card rounded-3xl border bg-gradient-to-b ${estilo.bg} ${estilo.border} overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.01]`}
          >
            {/* Cabecera del grupo */}
            <div className="p-5 pb-3 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{medalla}</div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tighter">{grupo.nombre}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-yellow-400 font-black text-sm">🏆 {grupo.monedasTotal} monedas</span>
                      <span className="text-white/30 text-[10px]">· {grupo.estudiantes.length} miembros</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleExpandir(grupo.nombre)}
                  className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 font-black text-[10px] uppercase tracking-wider hover:bg-white/20 transition-all flex items-center gap-1"
                >
                  {estaExpandido ? '▲ Ver menos' : '▼ Ver líderes'}
                </button>
              </div>
            </div>

            {/* Lista de top usuarios */}
            <div className="p-4 space-y-2">
              {topAmostrar.map((usuario, i) => {
                const avatar = usuario.avatar || '😇';
                const esImagen = avatar?.startsWith('data:image') || avatar?.startsWith('http');
                return (
                  <div
                    key={usuario.uid}
                    className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                  >
                    <div className="w-8 text-center">
                      {i < 3 ? (
                        <span className="text-xl">{MEDALLAS[i]}</span>
                      ) : (
                        <span className="text-white/40 text-xs font-black">#{i+1}</span>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                      {esImagen ? (
                        <img src={avatar} alt={usuario.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-base">{avatar}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-sm text-white truncate">{usuario.nombre}</p>
                      <p className="text-white/30 text-[9px] font-bold">Nivel {usuario.nivelActual} · Racha {usuario.racha}🔥</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">🪙</span>
                      <span className="font-black text-sm text-yellow-400">{usuario.monedas}</span>
                    </div>
                  </div>
                );
              })}
              {!estaExpandido && grupo.estudiantes.length > 3 && (
                <button
                  onClick={() => toggleExpandir(grupo.nombre)}
                  className="w-full text-center py-2 text-white/40 text-[10px] font-black uppercase tracking-wider hover:text-yellow-400 transition-colors"
                >
                  + {grupo.estudiantes.length - 3} más. Toca para verlos
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RankingGrupos;