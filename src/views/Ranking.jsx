import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import RankingGrupos from './RankingGrupos';

const MEDALLAS = ['🥇', '🥈', '🥉'];
const Ranking = ({ onSeleccionarUsuario }) => {
  const { nombre, grupo, obtenerRanking, obtenerRankingGlobal } = useGame();
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modo, setModo] = useState('grupo'); // 'grupo', 'global', 'grupos'

  useEffect(() => {
    if (modo === 'grupos') return; // No cargar lista, se renderiza RankingGrupos aparte
    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        let data;
        if (modo === 'grupo') {
          if (!grupo || grupo === 'Sin Grupo') {
            setError('grupo');
            setCargando(false);
            return;
          }
          data = await obtenerRanking(grupo);
        } else {
          data = await obtenerRankingGlobal();
        }
        setLista(data);
      } catch (e) {
        console.error(e);
        setError('general');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [modo, grupo]);

  const UsuarioRow = ({ usuario, index }) => {
    const esMio = usuario.nombre === nombre;
    const avatar = usuario.avatar || '😇';
    const esImagen = avatar?.startsWith('data:image') || avatar?.startsWith('http')|| avatar?.startsWith('/images/');;

    return (
      <button
        onClick={() => onSeleccionarUsuario && onSeleccionarUsuario(usuario)}
        className="w-full flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
      >
        <div className="w-8 text-center shrink-0">
          {index < 3 ? (
            <span className="text-xl">{MEDALLAS[index]}</span>
          ) : (
            <span className="text-white/40 text-xs font-black">#{index + 1}</span>
          )}
        </div>
        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
          {esImagen ? (
            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-base">{avatar}</span>
          )}
        </div>
        <div className="flex-1 text-left">
          <p className="font-black text-sm text-white group-hover:text-yellow-300 transition-colors truncate">
            {usuario.nombre}
            {esMio && <span className="text-[9px] text-blue-400 ml-1">(tú)</span>}
          </p>
          <p className="text-white/30 text-[9px] font-bold">
            Nivel {usuario.nivelActual ?? 1} · Racha {usuario.racha ?? 0}🔥
            {modo === 'global' && usuario.grupo && <span> · {usuario.grupo}</span>}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-sm">🪙</span>
          <span className={`font-black text-sm ${esMio ? 'text-yellow-300' : 'text-white/70'}`}>
            {usuario.monedas ?? 0}
          </span>
        </div>
      </button>
    );
  };

  // Si el modo es 'grupos', renderizamos el componente especial
  if (modo === 'grupos') {
    return (
      <div>
        <div className="glass-card rounded-3xl p-4 border border-white/10 mb-4">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setModo('grupo')}
              className="flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all bg-white/5 text-white/40 border border-white/10"
            >
              Mi grupo
            </button>
            <button
              onClick={() => setModo('global')}
              className="flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all bg-white/5 text-white/40 border border-white/10"
            >
              Global
            </button>
            <button
              onClick={() => setModo('grupos')}
              className="flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all bg-yellow-400 text-blue-900"
            >
              Grupos
            </button>
          </div>
        </div>
        <RankingGrupos />
      </div>
    );
  }

  // Modo grupo o global: mostrar selector y lista
  const mostrarPodio = modo === 'grupo' && lista.length >= 3;
  const top3 = lista.slice(0, 3);

  return (
    <div className="py-6 space-y-4 animate-slide-up">
      <div className="glass-card rounded-3xl p-4 border border-white/10">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setModo('grupo')}
            className={`flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all
              ${modo === 'grupo'
                ? 'bg-yellow-400 text-blue-900'
                : 'bg-white/5 text-white/40 border border-white/10'}`}
          >
            Mi grupo
          </button>
          <button
            onClick={() => setModo('global')}
            className={`flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all
              ${modo === 'global'
                ? 'bg-yellow-400 text-blue-900'
                : 'bg-white/5 text-white/40 border border-white/10'}`}
          >
            Global
          </button>
          <button
            onClick={() => setModo('grupos')}
            className={`flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all
              ${modo === 'grupos'
                ? 'bg-yellow-400 text-blue-900'
                : 'bg-white/5 text-white/40 border border-white/10'}`}
          >
            Grupos
          </button>
        </div>
        <p className="text-[9px] font-black text-yellow-400 uppercase tracking-[0.4em] mb-1">
          {modo === 'grupo' ? `Ranking del grupo ${grupo}` : 'Todos los grupos'}
        </p>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
          {modo === 'grupo' ? grupo : 'Ranking Global'}
        </h2>
      </div>

      {cargando && (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-white/40 text-xs font-black uppercase tracking-widest">Cargando ranking…</p>
        </div>
      )}

      {!cargando && error === 'grupo' && (
        <div className="glass-card rounded-2xl p-6 text-center border border-white/10">
          <p className="text-white/60 font-black text-sm">Sin grupo asignado</p>
        </div>
      )}

      {!cargando && error === 'general' && (
        <div className="glass-card rounded-2xl p-6 text-center border border-red-500/20">
          <p className="text-red-400 font-black text-sm">Error al cargar el ranking</p>
        </div>
      )}

      {!cargando && !error && mostrarPodio && (
        <div className="flex items-end justify-center gap-4 pt-2 pb-4">
          {/* Podio: segundo, primero, tercero */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-3xl">{MEDALLAS[1]}</div>
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
              {(() => {
                const a = top3[1]?.avatar || '😇';
                const esImg = a?.startsWith('data:image') || a?.startsWith('http');
                return esImg ? <img src={a} className="w-full h-full object-cover" /> : <span className="text-2xl">{a}</span>;
              })()}
            </div>
            <p className="text-xs font-black truncate max-w-[70px]">{top3[1]?.nombre || '—'}</p>
            <div className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-300 text-[10px] font-black">🪙 {top3[1]?.monedas || 0}</div>
            <div className="w-12 h-10 rounded-t-lg bg-gradient-to-t from-slate-600 to-slate-400"></div>
          </div>
          <div className="flex flex-col items-center gap-2 scale-110">
            <div className="text-3xl">{MEDALLAS[0]}</div>
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-400 flex items-center justify-center overflow-hidden">
              {(() => {
                const a = top3[0]?.avatar || '😇';
                const esImg = a?.startsWith('data:image') || a?.startsWith('http');
                return esImg ? <img src={a} className="w-full h-full object-cover" /> : <span className="text-3xl">{a}</span>;
              })()}
            </div>
            <p className="text-sm font-black truncate max-w-[80px]">{top3[0]?.nombre || '—'}</p>
            <div className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-[10px] font-black">🪙 {top3[0]?.monedas || 0}</div>
            <div className="w-16 h-16 rounded-t-lg bg-gradient-to-t from-yellow-600 to-yellow-400"></div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="text-3xl">{MEDALLAS[2]}</div>
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
              {(() => {
                const a = top3[2]?.avatar || '😇';
                const esImg = a?.startsWith('data:image') || a?.startsWith('http');
                return esImg ? <img src={a} className="w-full h-full object-cover" /> : <span className="text-2xl">{a}</span>;
              })()}
            </div>
            <p className="text-xs font-black truncate max-w-[70px]">{top3[2]?.nombre || '—'}</p>
            <div className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-300 text-[10px] font-black">🪙 {top3[2]?.monedas || 0}</div>
            <div className="w-12 h-7 rounded-t-lg bg-gradient-to-t from-amber-800 to-amber-600"></div>
          </div>
        </div>
      )}

      {!cargando && !error && lista.length > 0 && (
        <div className="space-y-2">
          {lista.map((usuario, idx) => (
            <UsuarioRow key={usuario.uid || idx} usuario={usuario} index={idx} />
          ))}
          <p className="text-center text-white/20 text-[9px] font-black uppercase tracking-[0.3em] pt-2">
            Ordenado por monedas · {lista.length} jugadores
          </p>
        </div>
      )}

      {!cargando && !error && lista.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center border border-white/10">
          <p className="text-4xl mb-3">🏆</p>
          <p className="text-white font-black">¡Sé el primero del ranking!</p>
          <p className="text-white/40 text-xs mt-1">Completa lecciones para ganar monedas</p>
        </div>
      )}
    </div>
  );
};

export default Ranking;