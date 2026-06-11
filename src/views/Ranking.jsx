import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import RankingGrupos from './RankingGrupos';

const MEDALLAS = ['🥇', '🥈', '🥉'];

const renderAvatar = (usuario, size = 'w-10 h-10', textSize = 'text-xl') => {
  const avatar = usuario.avatar || '😇';
  const esImagen = avatar?.startsWith('data:image') || avatar?.startsWith('http') || avatar?.startsWith('/images/');
  if (esImagen) return <img src={avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span class="${textSize}">😇</span>`; }} />;
  return <span className={textSize}>{avatar}</span>;
};

const UsuarioRow = ({ usuario, index, nombreActual, onSeleccionarUsuario }) => {
  const esMio = usuario.nombre === nombreActual;
  return (
    <button
      onClick={() => onSeleccionarUsuario?.(usuario)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02] active:scale-95 ${
        esMio ? 'bg-yellow-400/20 border border-yellow-400/40' : 'bg-white/5 border border-white/10 hover:bg-white/10'
      }`}
    >
      <div className="w-8 text-center shrink-0">
        {index < 3 ? <span className="text-2xl">{MEDALLAS[index]}</span> : <span className="text-white/40 text-xs font-black">#{index + 1}</span>}
      </div>
      <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
        {renderAvatar(usuario, 'w-10 h-10', 'text-xl')}
      </div>
      <div className="flex-1 text-left">
        <p className="font-black text-sm text-white truncate">{usuario.nombre}{esMio && <span className="text-[9px] text-blue-400 ml-1">(tú)</span>}</p>
        <p className="text-white/40 text-[10px] font-bold">Nivel {usuario.nivelActual ?? 1} · Racha {usuario.racha ?? 0}🔥</p>
      </div>
      <div className="flex items-center gap-1 shrink-0 bg-black/20 px-2 py-1 rounded-full">
        <span className="text-sm">🪙</span>
        <span className="font-black text-sm text-yellow-300">{usuario.monedas?.toLocaleString() ?? 0}</span>
      </div>
    </button>
  );
};

const Podio = ({ top3 }) => {
  if (!top3 || top3.length < 3) return null;
  return (
    <div className="flex items-end justify-center gap-4 pt-4 pb-6">
      {/* 2do lugar */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-3xl">{MEDALLAS[1]}</div>
        <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
          {renderAvatar(top3[1], 'w-14 h-14', 'text-2xl')}
        </div>
        <p className="text-xs font-black truncate max-w-[70px]">{top3[1]?.nombre}</p>
        <div className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-300 text-[10px] font-black">🪙 {top3[1]?.monedas?.toLocaleString()}</div>
        <div className="w-12 h-10 rounded-t-lg bg-gradient-to-t from-slate-600 to-slate-400"></div>
      </div>
      {/* 1er lugar */}
      <div className="flex flex-col items-center gap-2 scale-110 -mt-4">
        <div className="text-4xl">{MEDALLAS[0]}</div>
        <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden ring-2 ring-yellow-400">
          {renderAvatar(top3[0], 'w-16 h-16', 'text-3xl')}
        </div>
        <p className="text-sm font-black truncate max-w-[80px]">{top3[0]?.nombre}</p>
        <div className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-[10px] font-black">🪙 {top3[0]?.monedas?.toLocaleString()}</div>
        <div className="w-16 h-16 rounded-t-lg bg-gradient-to-t from-yellow-600 to-yellow-400"></div>
      </div>
      {/* 3er lugar */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-3xl">{MEDALLAS[2]}</div>
        <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
          {renderAvatar(top3[2], 'w-14 h-14', 'text-2xl')}
        </div>
        <p className="text-xs font-black truncate max-w-[70px]">{top3[2]?.nombre}</p>
        <div className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-300 text-[10px] font-black">🪙 {top3[2]?.monedas?.toLocaleString()}</div>
        <div className="w-12 h-7 rounded-t-lg bg-gradient-to-t from-amber-800 to-amber-600"></div>
      </div>
    </div>
  );
};

const Ranking = ({ onSeleccionarUsuario }) => {
  const { nombre, grupo, obtenerRanking, obtenerRankingGlobal } = useGame();
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modo, setModo] = useState('grupo');

  useEffect(() => {
    if (modo === 'grupos') return;
    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        let data;
        if (modo === 'grupo') {
          if (!grupo || grupo === 'Sin Grupo') { setError('grupo'); setCargando(false); return; }
          data = await obtenerRanking(grupo);
        } else {
          data = await obtenerRankingGlobal();
        }
        setLista(data);
      } catch { setError('general'); } finally { setCargando(false); }
    };
    cargar();
  }, [modo, grupo]);

  if (modo === 'grupos') return <RankingGrupos onCambiarModo={setModo} />;

  const mostrarPodio = lista.length >= 3;
  const top3 = lista.slice(0, 3);

  return (
    <div className="py-6 space-y-5 animate-slide-up">
      {/* Tabs */}
      <div className="glass-card rounded-3xl p-1 flex gap-1 border border-white/10">
        <button onClick={() => setModo('grupo')} className={`flex-1 py-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${modo === 'grupo' ? 'bg-yellow-400 text-blue-900 shadow-lg' : 'text-white/70 hover:bg-white/10'}`}>Mi grupo</button>
        <button onClick={() => setModo('global')} className={`flex-1 py-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${modo === 'global' ? 'bg-yellow-400 text-blue-900 shadow-lg' : 'text-white/70 hover:bg-white/10'}`}>Global</button>
        <button onClick={() => setModo('grupos')} className={`flex-1 py-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${modo === 'grupos' ? 'bg-yellow-400 text-blue-900 shadow-lg' : 'text-white/70 hover:bg-white/10'}`}>Grupos</button>
      </div>

      <div className="glass-card rounded-3xl p-5 text-center relative overflow-hidden border border-white/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl" />
        <p className="text-[9px] font-black text-yellow-400 uppercase tracking-[0.4em]">{modo === 'grupo' ? `Ranking del grupo ${grupo}` : 'Todos los grupos'}</p>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mt-1">{modo === 'grupo' ? grupo : 'Ranking Global'}</h2>
      </div>

      {cargando && (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="w-10 h-10 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin" />
          <p className="text-white/40 text-xs font-black animate-pulse">Cargando ranking…</p>
        </div>
      )}

      {error === 'grupo' && <div className="glass-card rounded-2xl p-6 text-center"><p className="text-white/60">No perteneces a ningún grupo.</p></div>}
      {error === 'general' && <div className="glass-card rounded-2xl p-6 text-center"><p className="text-red-400">Error al cargar el ranking.</p></div>}

      {!cargando && !error && mostrarPodio && <Podio top3={top3} />}

      {!cargando && !error && lista.length > 0 && (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {lista.map((usuario, idx) => (
            <UsuarioRow key={usuario.uid || idx} usuario={usuario} index={idx} nombreActual={nombre} onSeleccionarUsuario={onSeleccionarUsuario} />
          ))}
        </div>
      )}

      {!cargando && !error && lista.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-4xl mb-3">🏆</p>
          <p className="text-white font-black">¡Sé el primero del ranking!</p>
        </div>
      )}
    </div>
  );
};

export default Ranking;