import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import santosData from '../data/santos.json';

// ── RAREZAS ──────────────────────────────────────────────────────────────
const RAREZA_CONFIG = {
  comun: { label: 'Común', color: 'border-slate-500/30 bg-slate-500/10 text-slate-300', glow: 'shadow-slate-500/10', bg: 'from-slate-900/40 to-slate-800/20' },
  raro: { label: 'Raro', color: 'border-blue-500/30 bg-blue-500/10 text-blue-300', glow: 'shadow-blue-500/10', bg: 'from-blue-900/40 to-blue-800/20' },
  epico: { label: 'Épico', color: 'border-purple-500/30 bg-purple-500/10 text-purple-300', glow: 'shadow-purple-500/10', bg: 'from-purple-900/40 to-purple-800/20' },
  legendario: { label: 'Legendario', color: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300', glow: 'shadow-yellow-500/10', bg: 'from-yellow-900/40 to-amber-800/20' },
  mitico: { label: 'Mítico', color: 'border-orange-500/30 bg-orange-500/10 text-orange-300', glow: 'shadow-orange-500/10', bg: 'from-orange-900/40 to-orange-800/20' },
  divino: { label: 'Divino', color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300', glow: 'shadow-cyan-500/10', bg: 'from-cyan-900/40 to-cyan-800/20' },
};

const RAREZA_ORDER = {
  comun: 0,
  raro: 1,
  epico: 2,
  legendario: 3,
  mitico: 4,
  divino: 5,
};

// ── COMPONENTE PARA IMAGEN CON FALLBACK ──────────────────────────────────
const SantoImage = ({ santo, coleccionado, className = '' }) => {
  const [error, setError] = useState(false);
  
  // Si no está coleccionado o hay error, mostrar icono
  if (!coleccionado || error || !santo.imagen) {
    return (
      <div className={`text-5xl sm:text-7xl ${!coleccionado ? 'grayscale opacity-50' : ''}`}>
        {santo.icono || '🙏'}
      </div>
    );
  }

  return (
    <img
      src={santo.imagen}
      alt={santo.nombre}
      className={`w-full h-full object-cover rounded-t-2xl ${className}`}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
};

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────
const Album = ({ onSeleccionarSanto }) => {
  const { coleccion } = useGame();
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [seccionActiva, setSeccionActiva] = useState('todos');

  // ── OBTENER SECCIONES ÚNICAS ──
  const secciones = useMemo(() => {
    const seccionesSet = new Set(santosData.santos.map(s => s.seccion));
    return ['todos', ...Array.from(seccionesSet)];
  }, []);

  // ── FILTRAR SANTOS ──
  const santosFiltrados = useMemo(() => {
    let santos = santosData.santos;

    if (seccionActiva !== 'todos') {
      santos = santos.filter(s => s.seccion === seccionActiva);
    }

    if (filtro !== 'todos') {
      santos = santos.filter(s => s.rareza === filtro);
    }

    if (busqueda.trim()) {
      const term = busqueda.toLowerCase().trim();
      santos = santos.filter(s => 
        s.nombre.toLowerCase().includes(term) || 
        s.descripcion.toLowerCase().includes(term)
      );
    }

    return santos.sort((a, b) => {
      const aCol = coleccion.includes(a.id);
      const bCol = coleccion.includes(b.id);
      if (aCol && !bCol) return -1;
      if (!aCol && bCol) return 1;
      return RAREZA_ORDER[b.rareza] - RAREZA_ORDER[a.rareza];
    });
  }, [seccionActiva, filtro, busqueda, coleccion]);

  const santosColeccion = santosData.santos.filter(s => coleccion.includes(s.id));
  const progreso = (santosColeccion.length / santosData.santos.length) * 100;

  const contarPorRareza = (rareza) => {
    const total = santosData.santos.filter(s => s.rareza === rareza).length;
    const obtenidos = santosColeccion.filter(s => s.rareza === rareza).length;
    return { total, obtenidos };
  };

  return (
    <div className="py-4 sm:py-6 space-y-4 sm:space-y-6 animate-slide-up">
      {/* ── ENCABEZADO ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-block px-4 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/40 mb-2">
          <p className="text-[8px] sm:text-[9px] font-black text-yellow-400 uppercase tracking-[0.4em]">📖 Colección</p>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter">Álbum de Santos</h2>
        <p className="text-white/40 text-xs sm:text-sm mt-1">Colecciona todos los santos abriendo cofres</p>
        
        {/* Progreso de colección */}
        <div className="mt-3 max-w-xs mx-auto px-2">
          <div className="flex justify-between text-white/30 text-[8px] sm:text-[9px] font-black mb-1">
            <span>Progreso de colección</span>
            <span>{santosColeccion.length} / {santosData.santos.length}</span>
          </div>
          <div className="h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progreso}%` }}
              transition={{ duration: 1.5 }}
              className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-300 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* ── FILTROS POR RAREZA ── */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-1 bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/10 overflow-x-auto"
      >
        {[
          { id: 'todos', label: '📋 Todos' },
          { id: 'comun', label: '⚪ Común' },
          { id: 'raro', label: '🔵 Raro' },
          { id: 'epico', label: '🟣 Épico' },
          { id: 'legendario', label: '🟡 Legendario' },
          { id: 'mitico', label: '🟠 Mítico' },
          { id: 'divino', label: '🔷 Divino' },
        ].map(t => {
          const stats = t.id !== 'todos' ? contarPorRareza(t.id) : null;
          return (
            <button
              key={t.id}
              onClick={() => setFiltro(t.id)}
              className={`flex items-center gap-1 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full font-black text-[8px] sm:text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                filtro === t.id 
                  ? `bg-yellow-400 text-blue-900 shadow-lg` 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span>{t.label}</span>
              {stats && (
                <span className={`text-[7px] sm:text-[9px] ${filtro === t.id ? 'text-blue-900/60' : 'text-white/30'}`}>
                  ({stats.obtenidos}/{stats.total})
                </span>
              )}
            </button>
          );
        })}
      </motion.div>

      {/* ── BUSCADOR ── */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative"
      >
        <input
          type="text"
          placeholder="🔍 Buscar santo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 text-white text-sm sm:text-base placeholder:text-white/20 outline-none focus:border-yellow-400 transition-all"
        />
        <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm sm:text-base">
          🔍
        </span>
        {busqueda && (
          <button
            onClick={() => setBusqueda('')}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white text-sm"
          >
            ✕
          </button>
        )}
      </motion.div>

      {/* ── SECCIONES ── */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-1 sm:gap-2 overflow-x-auto pb-1"
      >
        {secciones.map(sec => (
          <button
            key={sec}
            onClick={() => setSeccionActiva(sec)}
            className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-black text-[8px] sm:text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
              seccionActiva === sec
                ? 'bg-yellow-400/20 border border-yellow-400/40 text-yellow-300'
                : 'text-white/40 border border-white/10 hover:bg-white/5'
            }`}
          >
            {sec === 'todos' ? '📚 Todas' : sec}
          </button>
        ))}
      </motion.div>

      {/* ── LISTA DE SANTOS ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${seccionActiva}-${filtro}-${busqueda}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
        >
          {santosFiltrados.length > 0 ? (
            santosFiltrados.map((santo, index) => {
              const coleccionado = coleccion.includes(santo.id);
              const rarezaConfig = RAREZA_CONFIG[santo.rareza] || RAREZA_CONFIG.comun;
              
              return (
                <motion.button
                  key={santo.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={coleccionado ? { scale: 1.05, y: -4 } : {}}
                  whileTap={coleccionado ? { scale: 0.95 } : {}}
                  onClick={() => coleccionado && onSeleccionarSanto?.(santo)}
                  className={`relative glass-card rounded-2xl overflow-hidden border transition-all ${
                    coleccionado 
                      ? `${rarezaConfig.color} ${rarezaConfig.glow} hover:shadow-xl cursor-pointer` 
                      : 'border-white/10 opacity-60 cursor-default'
                  }`}
                >
                  {/* Contenedor de imagen/icono */}
                  <div className={`relative w-full aspect-square ${coleccionado ? rarezaConfig.bg : 'bg-white/5'}`}>
                    <SantoImage 
                      santo={santo} 
                      coleccionado={coleccionado}
                      className="w-full h-full"
                    />
                    
                    {/* Badge de rareza */}
                    <div className={`absolute top-1 right-1 sm:top-2 sm:right-2 px-1.5 sm:px-2 py-0.5 rounded-full text-[6px] sm:text-[8px] font-black uppercase ${
                      coleccionado ? rarezaConfig.color : 'bg-white/5 text-white/30 border border-white/10'
                    }`}>
                      {coleccionado ? santo.rareza : '🔒'}
                    </div>

                    {/* Efecto de descubrimiento */}
                    {coleccionado && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    )}
                  </div>

                  {/* Información */}
                  <div className="p-2 sm:p-3 text-center">
                    <p className={`font-black text-[10px] sm:text-sm truncate ${
                      coleccionado ? 'text-white' : 'text-white/30'
                    }`}>
                      {santo.nombre}
                    </p>
                    {coleccionado ? (
                      <p className="text-[8px] sm:text-[10px] text-green-400 font-black">✓ Coleccionado</p>
                    ) : (
                      <p className="text-[8px] sm:text-[10px] text-white/20 font-black">🔒 Bloqueado</p>
                    )}
                  </div>
                </motion.button>
              );
            })
          ) : (
            <div className="col-span-full glass-card rounded-2xl p-8 sm:p-12 text-center border border-white/10">
              <p className="text-5xl sm:text-6xl mb-3 sm:mb-4">🔍</p>
              <p className="text-white font-black text-sm sm:text-base">No se encontraron santos</p>
              <p className="text-white/40 text-xs sm:text-sm mt-1">Intenta con otros filtros</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── ESTADÍSTICAS ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10"
      >
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-center">
          <div>
            <p className="text-white/40 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Total</p>
            <p className="text-white font-black text-lg sm:text-xl">{santosData.santos.length}</p>
          </div>
          <div>
            <p className="text-green-400 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Coleccionados</p>
            <p className="text-green-400 font-black text-lg sm:text-xl">{santosColeccion.length}</p>
          </div>
          <div>
            <p className="text-white/40 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Por descubrir</p>
            <p className="text-white font-black text-lg sm:text-xl">{santosData.santos.length - santosColeccion.length}</p>
          </div>
          <div>
            <p className="text-yellow-400 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Progreso</p>
            <p className="text-yellow-400 font-black text-lg sm:text-xl">{Math.round(progreso)}%</p>
          </div>
        </div>
      </motion.div>

      {/* ── ESTILOS ── */}
      <style>{`
        .grayscale {
          filter: grayscale(100%);
        }
      `}</style>
    </div>
  );
};

export default Album;