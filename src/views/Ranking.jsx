import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';

const MEDALLAS = ['🥇', '🥈', '🥉'];

// ── Podio ──────────────────────────────────────────────────────────────────
const PodioCard = ({ usuario, posicion, destacado = false }) => (
  <div className={`flex flex-col items-center gap-2 ${destacado ? 'scale-110' : ''}`}>
    <p className="text-2xl">{MEDALLAS[posicion - 1]}</p>
    <div className={`rounded-full flex items-center justify-center text-2xl border-2
      ${destacado ? 'w-16 h-16 bg-yellow-500/20 border-yellow-400/60' : 'w-12 h-12 bg-white/10 border-white/20'}`}>
      😇
    </div>
    <p className={`font-black text-center truncate max-w-[70px] ${destacado ? 'text-white text-xs' : 'text-white/60 text-[10px]'}`}>
      {usuario?.nombre ?? '—'}
    </p>
    <div className="px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
      <span className="text-yellow-300 font-black text-[10px]">🪙 {usuario?.monedas ?? 0}</span>
    </div>
    <div className={`w-16 rounded-t-lg bg-linear-to-t
      ${posicion === 1 ? 'h-16 from-yellow-600 to-yellow-400'
      : posicion === 2 ? 'h-10 from-slate-600 to-slate-400'
      :                  'h-7  from-amber-800 to-amber-600'}`}
    />
  </div>
);

// ── Ranking principal ──────────────────────────────────────────────────────
const Ranking = () => {
  const { grupo, nombre, obtenerRanking } = useGame();
  const [lista, setLista]       = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        const data = await obtenerRanking(grupo);
        setLista(data);
      } catch (e) {
        // Si falla por índice faltante, damos instrucción clara
        const msg = e?.message ?? '';
        if (msg.includes('index') || msg.includes('Index')) {
          setError('índice');
        } else {
          setError('general');
        }
      } finally {
        setCargando(false);
      }
    };
    if (grupo && grupo !== 'Sin Grupo') cargar();
    else { setCargando(false); setError('grupo'); }
  }, [grupo]);

  const miPosicion = lista.findIndex(u => u.nombre === nombre) + 1;

  return (
    <div className="py-6 space-y-4 animate-slide-up">

      {/* Cabecera */}
      <div className="glass-card rounded-3xl p-5 border border-white/10">
        <p className="text-[9px] font-black text-yellow-400 uppercase tracking-[0.4em] mb-1">Ranking del grupo</p>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{grupo}</h2>
        {miPosicion > 0 && (
          <p className="text-blue-300 text-xs font-bold mt-1">Tú estás en el puesto #{miPosicion}</p>
        )}
      </div>

      {/* Estados: cargando / error / vacío */}
      {cargando && (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-white/40 text-xs font-black uppercase tracking-widest">Cargando ranking…</p>
        </div>
      )}

      {!cargando && error === 'índice' && (
        <div className="glass-card rounded-2xl p-6 border border-yellow-500/20 space-y-3">
          <p className="text-yellow-400 font-black text-sm">⚠️ Falta configurar Firestore</p>
          <p className="text-white/60 text-xs leading-relaxed">
            Ve a Firebase Console → Firestore → Índices → Crear índice compuesto:
          </p>
          <div className="bg-white/5 rounded-xl p-3 text-xs font-mono text-white/70 space-y-1">
            <p>Colección: <span className="text-yellow-300">usuarios</span></p>
            <p>Campo 1: <span className="text-blue-300">grupo</span> — Ascending</p>
            <p>Campo 2: <span className="text-blue-300">monedas</span> — Descending</p>
          </div>
          <p className="text-white/40 text-[10px]">Firebase también te mostrará el link directo en la consola del navegador.</p>
        </div>
      )}

      {!cargando && error === 'general' && (
        <div className="glass-card rounded-2xl p-6 text-center border border-red-500/20">
          <p className="text-red-400 font-black text-sm">Error al cargar el ranking</p>
          <p className="text-white/30 text-xs mt-1">Verifica tu conexión a internet</p>
        </div>
      )}

      {!cargando && error === 'grupo' && (
        <div className="glass-card rounded-2xl p-6 text-center border border-white/10">
          <p className="text-white/60 font-black text-sm">Sin grupo asignado</p>
        </div>
      )}

      {/* Podio top 3 */}
      {!cargando && !error && lista.length >= 3 && (
        <div className="flex items-end justify-center gap-4 pt-2 pb-4">
          <PodioCard usuario={lista[1]} posicion={2} />
          <PodioCard usuario={lista[0]} posicion={1} destacado />
          <PodioCard usuario={lista[2]} posicion={3} />
        </div>
      )}

      {/* Lista completa */}
      {!cargando && !error && lista.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center border border-white/10">
          <p className="text-4xl mb-3">🏆</p>
          <p className="text-white font-black">¡Sé el primero del ranking!</p>
          <p className="text-white/40 text-xs mt-1">Completa lecciones para ganar monedas</p>
        </div>
      )}

      {!cargando && !error && lista.length > 0 && (
        <div className="space-y-2">
          {lista.map((usuario, i) => {
            const esMio = usuario.nombre === nombre;
            return (
              <div key={usuario.uid ?? i}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all
                  ${esMio ? 'bg-blue-500/15 border-blue-400/40' : 'bg-white/5 border-white/5'}`}
              >
                <div className="w-8 text-center shrink-0">
                  {i < 3
                    ? <span className="text-xl">{MEDALLAS[i]}</span>
                    : <span className="text-white/40 font-black text-sm">#{i + 1}</span>
                  }
                </div>

                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0
                  ${esMio ? 'bg-blue-500/30 border border-blue-400/50' : 'bg-white/10'}`}>
                  😇
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`font-black text-sm truncate ${esMio ? 'text-blue-200' : 'text-white'}`}>
                    {usuario.nombre} {esMio && <span className="text-[9px] text-blue-400">(tú)</span>}
                  </p>
                  <p className="text-white/30 text-[10px] font-bold">
                    Nivel {usuario.nivelActual ?? 1} · Racha {usuario.racha ?? 0}🔥
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-base">🪙</span>
                  <span className={`font-black text-sm ${esMio ? 'text-yellow-300' : 'text-white/70'}`}>
                    {usuario.monedas ?? 0}
                  </span>
                </div>
              </div>
            );
          })}

          <p className="text-center text-white/20 text-[9px] font-black uppercase tracking-[0.3em] pt-2">
            Ordenado por monedas · {lista.length} jugadores
          </p>
        </div>
      )}
    </div>
  );
};

export default Ranking;
