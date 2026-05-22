import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';

const MEDALLAS = ['🥇', '🥈', '🥉'];
const COLORES_GRUPO = [
  'from-indigo-500/20 to-indigo-400/10 border-indigo-400/30',
  'from-rose-500/20 to-rose-400/10 border-rose-400/30',
  'from-emerald-500/20 to-emerald-400/10 border-emerald-400/30',
  'from-amber-500/20 to-amber-400/10 border-amber-400/30',
  'from-sky-500/20 to-sky-400/10 border-sky-400/30',
];

const Ranking = ({ onSeleccionarUsuario }) => {
  const { nombre, obtenerRankingGrupos } = useGame();
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

  const handleUsuarioClick = (usuario) => {
    if (onSeleccionarUsuario) {
      onSeleccionarUsuario(usuario);
    }
  };

  if (cargando) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-white/40 text-xs font-black uppercase tracking-widest">Cargando ranking de grupos…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center border border-red-500/20">
        <p className="text-red-400 font-black text-sm">Error al cargar el ranking</p>
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
        const colorClase = COLORES_GRUPO[idx % COLORES_GRUPO.length];
        const estaExpandido = expandidos[grupo.nombre];
        const topAmostrar = estaExpandido ? grupo.estudiantes.slice(0, 10) : grupo.top3;

        return (
          <div key={grupo.nombre} className={`glass-card rounded-3xl border bg-gradient-to-b ${colorClase} p-5 transition-all duration-300 hover:shadow-xl`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{MEDALLAS[idx] || `#${idx+1}`}</span>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tighter">{grupo.nombre}</h3>
                  <p className="text-white/50 text-xs font-bold">🏆 {grupo.monedasTotal} monedas totales</p>
                </div>
              </div>
              <button
                onClick={() => toggleExpandir(grupo.nombre)}
                className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 font-black text-[10px] uppercase tracking-wider hover:bg-white/20 transition-all"
              >
                {estaExpandido ? 'Ver menos ▲' : 'Ver líderes ▼'}
              </button>
            </div>

            <div className="space-y-2 mt-2">
              {topAmostrar.map((usuario, i) => (
                <button
                  key={usuario.uid}
                  onClick={() => handleUsuarioClick(usuario)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                >
                  <div className="w-8 text-center">
                    {i < 3 ? <span className="text-xl">{MEDALLAS[i]}</span> : <span className="text-white/40 text-xs font-black">#{i+1}</span>}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-base">😇</div>
                  <div className="flex-1 text-left">
                    <p className="font-black text-sm text-white group-hover:text-yellow-300 transition-colors">{usuario.nombre}</p>
                    <p className="text-white/30 text-[9px] font-bold">Nivel {usuario.nivelActual} · Racha {usuario.racha}🔥</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">🪙</span>
                    <span className="font-black text-sm text-yellow-400">{usuario.monedas}</span>
                  </div>
                </button>
              ))}
              {!estaExpandido && grupo.estudiantes.length > 3 && (
                <p className="text-center text-white/30 text-[10px] font-black uppercase tracking-wider pt-2">
                  +{grupo.estudiantes.length - 3} más. Toca "Ver líderes"
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Ranking;