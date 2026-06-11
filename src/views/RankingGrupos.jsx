import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';

const MEDALLAS = ['🥇', '🥈', '🥉'];

const renderAvatar = (avatar, size = 'w-8 h-8', textSize = 'text-base') => {
  const esImagen = avatar?.startsWith('data:image') || avatar?.startsWith('http') || avatar?.startsWith('/images/');
  if (esImagen) return <img src={avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />;
  return <span className={textSize}>{avatar || '😇'}</span>;
};

const RankingGrupos = ({ onCambiarModo }) => {
  const { obtenerRankingGrupos } = useGame();
  const [grupos, setGrupos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [expandidos, setExpandidos] = useState({});

  useEffect(() => {
    obtenerRankingGrupos()
      .then(setGrupos)
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>;
  if (!grupos.length) return <div className="glass-card p-6 text-center">No hay grupos aún.</div>;

  const maxMonedas = grupos[0]?.monedasTotal || 1;

  return (
    <div className="py-6 space-y-6 animate-slide-up">
      {/* === BOTONES DE CAMBIO DE MODO === */}
      <div className="glass-card rounded-3xl p-1 flex gap-1 border border-white/10">
        <button onClick={() => onCambiarModo?.('grupo')} className="flex-1 py-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-white/70 hover:bg-white/10">
          Mi grupo
        </button>
        <button onClick={() => onCambiarModo?.('global')} className="flex-1 py-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-white/70 hover:bg-white/10">
          Global
        </button>
        <button onClick={() => onCambiarModo?.('grupos')} disabled className="flex-1 py-2 rounded-2xl font-black text-xs uppercase tracking-widest bg-yellow-400 text-blue-900 shadow-lg">
          Grupos
        </button>
      </div>

      <div className="text-center">
        <p className="text-[9px] font-black text-yellow-400 uppercase tracking-[0.5em]">Competencia entre grupos</p>
        <h2 className="text-3xl font-black text-white tracking-tighter">Ranking de Grupos</h2>
      </div>

      {grupos.map((grupo, idx) => {
        const expandido = expandidos[grupo.nombre];
        const mostrando = expandido ? grupo.estudiantes : grupo.top3;
        const medalla = idx < 3 ? MEDALLAS[idx] : `#${idx+1}`;
        const porcentaje = (grupo.monedasTotal / maxMonedas) * 100;
        const colores = ['border-amber-400/30 from-amber-500/10', 'border-slate-400/30 from-slate-500/10', 'border-rose-400/30 from-rose-500/10', 'border-emerald-400/30 from-emerald-500/10', 'border-indigo-400/30 from-indigo-500/10'][idx % 5];

        return (
          <div key={grupo.nombre} className={`glass-card rounded-3xl border ${colores} bg-gradient-to-br overflow-hidden transition-all hover:shadow-xl`}>
            <div className="p-5 pb-3 border-b border-white/10">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{medalla}</span>
                  <div>
                    <h3 className="text-2xl font-black text-white">{grupo.nombre}</h3>
                    <p className="text-yellow-400 font-black text-sm">🏆 {grupo.monedasTotal.toLocaleString()} monedas · {grupo.estudiantes.length} miembros</p>
                  </div>
                </div>
                <button onClick={() => setExpandidos(prev => ({ ...prev, [grupo.nombre]: !prev[grupo.nombre] }))} className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-[10px] font-black uppercase hover:bg-white/20 transition-all">
                  {expandido ? '▲ Ver menos' : '▼ Ver líderes'}
                </button>
              </div>
              <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-1000" style={{ width: `${porcentaje}%` }} />
              </div>
            </div>
            <div className="p-4 space-y-2">
              {mostrando.map((user, i) => (
                <div key={user.uid} className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="w-8 text-center">{i < 3 ? MEDALLAS[i] : <span className="text-white/40 text-xs">#{i+1}</span>}</div>
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center">
                    {renderAvatar(user.avatar, 'w-8 h-8', 'text-base')}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-sm text-white truncate">{user.nombre}</p>
                    <p className="text-white/30 text-[9px]">Nivel {user.nivelActual} · Racha {user.racha}🔥</p>
                  </div>
                  <div className="bg-black/20 px-2 py-1 rounded-full">
                    <span className="text-yellow-400 font-black text-sm">🪙 {user.monedas.toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {!expandido && grupo.estudiantes.length > 3 && (
                <button onClick={() => setExpandidos(prev => ({ ...prev, [grupo.nombre]: true }))} className="w-full text-center py-2 text-white/40 text-[10px] font-black uppercase hover:text-yellow-400 transition-colors">
                  + {grupo.estudiantes.length - 3} más
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