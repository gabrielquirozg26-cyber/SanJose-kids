import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from '../components/ui/Toast';
import RankingGrupos from './RankingGrupos';
import { motion, AnimatePresence } from 'framer-motion';

const MEDALLAS = ['🥇', '🥈', '🥉'];

// Colores de posición
const POSICION_COLORS = {
  0: 'from-yellow-400/30 to-amber-400/20 border-yellow-400/40 shadow-yellow-400/20',
  1: 'from-slate-300/20 to-slate-400/10 border-slate-300/30 shadow-slate-300/10',
  2: 'from-amber-600/20 to-amber-700/10 border-amber-500/30 shadow-amber-500/10',
};

// ── RENDER AVATAR MEJORADO ──────────────────────────────────────────────
const renderAvatar = (usuario, size = 'w-10 h-10', textSize = 'text-xl') => {
  const avatar = usuario.avatar || '😇';
  const esImagen = avatar?.startsWith('data:image') || avatar?.startsWith('http') || avatar?.startsWith('/images/');
  
  if (esImagen) {
    return (
      <img 
        src={avatar} 
        alt="Avatar" 
        className="w-full h-full object-cover rounded-full"
        onError={(e) => {
          e.target.style.display = 'none';
          // Mostrar emoji de respaldo
          const parent = e.target.parentElement;
          if (parent) {
            parent.innerHTML = `<span class="${textSize}">😇</span>`;
          }
        }}
      />
    );
  }
  return <span className={textSize}>{avatar || '😇'}</span>;
};

// ── FILA DE USUARIO ──────────────────────────────────────────────────────
const UsuarioRow = ({ usuario, index, nombreActual, onSeleccionarUsuario }) => {
  const esMio = usuario.nombre === nombreActual;
  const esTop3 = index < 3;
  const colorClass = POSICION_COLORS[index] || 'border-white/10';

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      onClick={() => onSeleccionarUsuario?.(usuario)}
      className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl transition-all hover:scale-[1.02] active:scale-95 ${
        esMio 
          ? 'bg-yellow-400/20 border border-yellow-400/40 shadow-[0_0_20px_rgba(250,204,21,0.1)]' 
          : `bg-gradient-to-r ${colorClass} border bg-white/5 hover:bg-white/10`
      }`}
    >
      {/* Posición */}
      <div className="w-6 sm:w-8 text-center shrink-0">
        {esTop3 ? (
          <span className="text-lg sm:text-2xl">{MEDALLAS[index]}</span>
        ) : (
          <span className="text-white/40 text-[10px] sm:text-xs font-black">#{index + 1}</span>
        )}
      </div>

      {/* Avatar */}
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
        {renderAvatar(usuario, 'w-8 h-8 sm:w-10 sm:h-10', 'text-base sm:text-xl')}
      </div>

      {/* Nombre y datos */}
      <div className="flex-1 text-left min-w-0">
        <p className="font-black text-xs sm:text-sm text-white truncate">
          {usuario.nombre}
          {esMio && <span className="text-[8px] sm:text-[9px] text-yellow-400 ml-0.5 sm:ml-1">(tú)</span>}
        </p>
        <p className="text-white/40 text-[8px] sm:text-[10px] font-bold truncate">
          Nivel {usuario.nivelActual ?? 1} · Racha {usuario.racha ?? 0}🔥
          {usuario.grupo && <span className="hidden sm:inline ml-1">· {usuario.grupo}</span>}
        </p>
      </div>

      {/* Monedas */}
      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 bg-black/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
        <span className="text-xs sm:text-sm">🪙</span>
        <span className={`font-black text-xs sm:text-sm ${esMio ? 'text-yellow-300' : 'text-white/70'}`}>
          {usuario.monedas?.toLocaleString() ?? 0}
        </span>
      </div>
    </motion.button>
  );
};

// ── PODIO 3D ────────────────────────────────────────────────────────────
const Podio = ({ top3 }) => {
  if (!top3 || top3.length < 3) return null;

  const podiumHeight = (pos) => {
    if (pos === 0) return 'h-14 sm:h-20';
    if (pos === 1) return 'h-10 sm:h-14';
    return 'h-8 sm:h-10';
  };

  const podiumColors = ['from-yellow-400 to-amber-500', 'from-slate-400 to-slate-500', 'from-amber-600 to-amber-700'];

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-6 pt-4 sm:pt-6 pb-6 sm:pb-10 px-2 sm:px-4">
      {top3.map((user, idx) => {
        const pos = idx === 0 ? 0 : idx === 1 ? 1 : 2;
        const scale = pos === 0 ? 'scale-105 sm:scale-110' : 'scale-100';
        const translateY = pos === 0 ? '-translate-y-2 sm:-translate-y-4' : '';

        return (
          <motion.div
            key={user.uid}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15, duration: 0.5, type: 'spring' }}
            className={`flex flex-col items-center gap-1 sm:gap-2 ${scale} ${translateY} relative`}
          >
            {/* Efecto de brillo para el primero */}
            {pos === 0 && (
              <div className="absolute -inset-2 sm:-inset-4 bg-yellow-400/20 rounded-full blur-xl sm:blur-2xl animate-pulse" />
            )}
            
            {/* Medalla */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.15 + 0.2, type: 'spring' }}
              className="text-3xl sm:text-5xl drop-shadow-lg"
            >
              {MEDALLAS[pos]}
            </motion.div>
            
            {/* Avatar con glow */}
            <div className="relative">
              {pos === 0 && (
                <div className="absolute -inset-1 sm:-inset-2 rounded-full bg-yellow-400/40 blur-lg sm:blur-xl animate-pulse" />
              )}
              {pos === 1 && (
                <div className="absolute -inset-1 rounded-full bg-slate-400/20 blur-lg" />
              )}
              {pos === 2 && (
                <div className="absolute -inset-1 rounded-full bg-amber-500/20 blur-lg" />
              )}
              <div className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 overflow-hidden ${
                pos === 0 ? 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)] sm:shadow-[0_0_40px_rgba(250,204,21,0.4)]' : 
                pos === 1 ? 'border-slate-300 shadow-[0_0_20px_rgba(200,200,200,0.2)]' : 
                'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
              } bg-white/10 flex items-center justify-center`}>
                {renderAvatar(user, 'w-12 h-12 sm:w-16 sm:h-16', 'text-2xl sm:text-3xl')}
              </div>
            </div>

            {/* Nombre */}
            <p className="font-black text-[10px] sm:text-sm text-white truncate max-w-[50px] sm:max-w-[80px]">{user.nombre}</p>

            {/* Monedas */}
            <div className={`px-1.5 sm:px-3 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black ${
              pos === 0 ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30' : 
              'bg-white/10 text-white/70 border border-white/10'
            }`}>
              🪙 {user.monedas?.toLocaleString()}
            </div>

            {/* Podio */}
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: '100%' }}
              transition={{ delay: idx * 0.15 + 0.3, duration: 0.5 }}
              className={`w-10 sm:w-14 ${podiumHeight(pos)} rounded-t-lg sm:rounded-t-xl bg-gradient-to-t ${podiumColors[pos]} opacity-80 shadow-inner`}
            >
              <div className="w-full h-full flex items-end justify-center text-white/20 text-[8px] sm:text-xs font-black pb-0.5 sm:pb-1">
                {pos === 0 ? '👑' : ''}
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ── RANKING PRINCIPAL ──────────────────────────────────────────────────
const Ranking = ({ onSeleccionarUsuario }) => {
  const { nombre, grupo, obtenerRanking, obtenerRankingGlobal } = useGame();
  const { showToast } = useToast();
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modo, setModo] = useState('grupo');
  const [miPosicion, setMiPosicion] = useState(null);
  
  const toastMostradoRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (modo === 'grupos') {
      setCargando(false);
      return;
    }
    
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
        
        const posicion = data.findIndex(u => u.nombre === nombre);
        if (posicion !== -1) {
          setMiPosicion(posicion + 1);
          
          if (!toastMostradoRef.current && !cargando) {
            toastMostradoRef.current = true;
            const posicionTexto = posicion === 0 ? '🥇 1º' : posicion === 1 ? '🥈 2º' : posicion === 2 ? '🥉 3º' : `#${posicion + 1}`;
            const emoji = posicion === 0 ? '👑' : posicion < 3 ? '🌟' : '📈';
            
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            
            timeoutRef.current = setTimeout(() => {
              try {
                showToast(
                  `${emoji} Estás en la posición ${posicionTexto} en el ranking`,
                  posicion < 3 ? 'success' : 'info',
                  4000
                );
              } catch (e) {}
            }, 600);
          }
        }
      } catch (e) {
        console.error(e);
        setError('general');
      } finally {
        setCargando(false);
      }
    };
    cargar();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [modo, grupo, obtenerRanking, obtenerRankingGlobal, nombre]);

  useEffect(() => {
    toastMostradoRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [modo]);

  if (modo === 'grupos') {
    return <RankingGrupos onCambiarModo={setModo} />;
  }

  const mostrarPodio = lista.length >= 3;
  const top3 = lista.slice(0, 3);

  return (
    <div className="py-4 sm:py-6 space-y-4 sm:space-y-5 animate-slide-up">
      {/* Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl sm:rounded-3xl p-1 flex gap-0.5 sm:gap-1 border border-white/10 overflow-x-auto"
      >
        {[
          { id: 'grupo', label: `🏠 ${grupo}` },
          { id: 'global', label: '🌍 Global' },
          { id: 'grupos', label: '📊 Grupos' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setModo(t.id)}
            className={`flex-1 py-1.5 sm:py-2 px-1 sm:px-2 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
              modo === t.id 
                ? 'bg-yellow-400 text-blue-900 shadow-lg' 
                : 'text-white/70 hover:bg-white/10'
            }`}
          >
            {t.label}
          </button>
        ))}
      </motion.div>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-center relative overflow-hidden border border-white/10"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 sm:w-32 sm:h-32 bg-yellow-400/20 rounded-full blur-2xl" />
        
        <p className="text-[8px] sm:text-[9px] font-black text-yellow-400 uppercase tracking-[0.3em] sm:tracking-[0.4em]">
          {modo === 'grupo' ? `Ranking del grupo ${grupo}` : 'Todos los grupos'}
        </p>
        <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tighter mt-0.5 sm:mt-1">
          {modo === 'grupo' ? grupo : 'Ranking Global'}
        </h2>
        
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-2 sm:mt-3 text-white/40 text-[8px] sm:text-[10px] font-black">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <span>👥</span>
            <span>{lista.length} catequistas</span>
          </div>
          {miPosicion && (
            <div className={`flex items-center gap-0.5 sm:gap-1 ${miPosicion <= 3 ? 'text-yellow-400' : 'text-white/40'}`}>
              <span>🏅</span>
              <span>Tu posición: #{miPosicion}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Loading */}
      <AnimatePresence mode="wait">
        {cargando && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 py-8 sm:py-12"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin" />
            <p className="text-white/40 text-[10px] sm:text-xs font-black animate-pulse">Cargando ranking…</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Errores */}
      {error === 'grupo' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-4 sm:p-6 text-center border border-white/10"
        >
          <p className="text-3xl sm:text-4xl mb-2 sm:mb-3">👥</p>
          <p className="text-white/60 text-sm sm:text-base">No perteneces a ningún grupo.</p>
          <p className="text-white/30 text-[10px] sm:text-xs mt-1">Contacta a tu catequista para asignarte a uno.</p>
        </motion.div>
      )}
      {error === 'general' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-4 sm:p-6 text-center border border-red-500/20"
        >
          <p className="text-3xl sm:text-4xl mb-2 sm:mb-3">⚠️</p>
          <p className="text-red-400 text-sm sm:text-base">Error al cargar el ranking.</p>
          <p className="text-red-400/50 text-[10px] sm:text-xs mt-1">Intenta más tarde</p>
        </motion.div>
      )}

      {/* Podio */}
      {!cargando && !error && mostrarPodio && <Podio top3={top3} />}

      {/* Lista de usuarios */}
      {!cargando && !error && lista.length > 0 && (
        <div className="space-y-1.5 sm:space-y-2 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-0.5 sm:pr-1">
          {lista.map((usuario, idx) => (
            <UsuarioRow 
              key={usuario.uid || idx} 
              usuario={usuario} 
              index={idx} 
              nombreActual={nombre} 
              onSeleccionarUsuario={onSeleccionarUsuario} 
            />
          ))}
          <div className="text-center pt-2 sm:pt-3">
            <p className="text-white/20 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">
              🏅 {lista.length} catequistas en el ranking
            </p>
          </div>
        </div>
      )}

      {/* Vacío */}
      {!cargando && !error && lista.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 sm:p-8 text-center border border-white/10"
        >
          <p className="text-4xl sm:text-6xl mb-3 sm:mb-4">🏆</p>
          <p className="text-white font-black text-sm sm:text-base">¡Sé el primero del ranking!</p>
          <p className="text-white/40 text-[10px] sm:text-xs mt-1 sm:mt-2">Completa lecciones para ganar monedas y subir posiciones</p>
          <div className="mt-3 sm:mt-4 inline-block px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20">
            <span className="text-yellow-400 text-[9px] sm:text-[10px] font-black">🚀 Empieza tu aventura</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Ranking;