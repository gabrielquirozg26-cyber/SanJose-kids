import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import RarezaBadge from '../components/RarezaBadge';

const SECCIONES = [
  'Guerreros de la Fe',
  'Amigos del Altar',
  'Protectores de la Creación',
  'Maestros de la Alegría',
  'Corazones de Oro'
];

const RAREZAS = ['comun', 'raro', 'legendario'];

// Estilos adicionales para la tarjeta según rareza (glow y fondo)
const TARJETA_ESTILOS = {
  comun: 'border-slate-500/30 bg-slate-500/5 hover:shadow-slate-400/20',
  raro: 'border-blue-500/40 bg-blue-500/5 hover:shadow-blue-400/30',
  legendario: 'border-yellow-500/50 bg-yellow-500/5 hover:shadow-yellow-400/50 hover:scale-105'
};

const Album = ({ onSeleccionarSanto }) => {
  const { coleccion, catalogoSantos } = useGame();
  const [busqueda, setBusqueda] = useState('');
  const [seccionActiva, setSeccionActiva] = useState('Todas');
  const [rarezaActiva, setRarezaActiva] = useState('Todas');

  const santosFiltrados = useMemo(() => {
    let filtrados = catalogoSantos || [];
    if (busqueda) {
      filtrados = filtrados.filter(s => s.nombre.toLowerCase().includes(busqueda.toLowerCase()));
    }
    if (seccionActiva !== 'Todas') {
      filtrados = filtrados.filter(s => s.seccion === seccionActiva);
    }
    if (rarezaActiva !== 'Todas') {
      filtrados = filtrados.filter(s => s.rareza === rarezaActiva);
    }
    return filtrados;
  }, [catalogoSantos, busqueda, seccionActiva, rarezaActiva]);

  const totalSantos = catalogoSantos?.length || 0;
  const desbloqueados = coleccion.length;

  // Agrupar por sección solo si no hay filtros activos
  const mostrarSecciones = seccionActiva === 'Todas' && rarezaActiva === 'Todas' && !busqueda;
  const santosAgrupados = useMemo(() => {
    if (!mostrarSecciones) return { 'Todos': santosFiltrados };
    const grupos = {};
    santosFiltrados.forEach(s => {
      if (!grupos[s.seccion]) grupos[s.seccion] = [];
      grupos[s.seccion].push(s);
    });
    return grupos;
  }, [santosFiltrados, mostrarSecciones]);

  return (
    <div className="py-6 space-y-6 animate-slide-up">
      {/* Cabecera */}
      <div className="text-center">
        <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.5em]">Mi Colección</p>
        <h2 className="text-3xl font-black text-white tracking-tighter">Álbum de Santos</h2>
        <p className="text-white/40 text-sm mt-1">{desbloqueados} / {totalSantos} desbloqueados</p>
      </div>

      {/* Buscador y filtros */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="🔍 Buscar santo..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-white placeholder:text-white/30 outline-none focus:border-blue-400 transition-all"
        />
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSeccionActiva('Todas')} className={`px-3 py-1 rounded-full text-xs font-black uppercase transition-all ${seccionActiva === 'Todas' ? 'bg-yellow-400 text-blue-900' : 'bg-white/10 text-white/70'}`}>Todo</button>
          {SECCIONES.map(sec => (
            <button key={sec} onClick={() => setSeccionActiva(sec)} className={`px-3 py-1 rounded-full text-xs font-black uppercase transition-all ${seccionActiva === sec ? 'bg-yellow-400 text-blue-900' : 'bg-white/10 text-white/70'}`}>{sec}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setRarezaActiva('Todas')} className={`px-3 py-1 rounded-full text-xs font-black uppercase transition-all ${rarezaActiva === 'Todas' ? 'bg-yellow-400 text-blue-900' : 'bg-white/10 text-white/70'}`}>Todas</button>
          {RAREZAS.map(rare => (
            <button key={rare} onClick={() => setRarezaActiva(rare)} className={`px-3 py-1 rounded-full text-xs font-black uppercase transition-all ${rarezaActiva === rare ? 'bg-yellow-400 text-blue-900' : 'bg-white/10 text-white/70'}`}>{rare}</button>
          ))}
        </div>
      </div>

      {/* Lista de santos (agrupados o en grid simple) */}
      {mostrarSecciones ? (
        Object.entries(santosAgrupados).map(([seccion, santos]) => (
          <div key={seccion} className="space-y-3">
            <h3 className="text-white/70 font-black text-sm uppercase tracking-wider border-l-4 border-yellow-400 pl-3">{seccion}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {santos.map(santo => (
                <TarjetaSanto key={santo.id} santo={santo} desbloqueado={coleccion.includes(santo.id)} onSeleccionar={onSeleccionarSanto} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {santosFiltrados.map(santo => (
            <TarjetaSanto key={santo.id} santo={santo} desbloqueado={coleccion.includes(santo.id)} onSeleccionar={onSeleccionarSanto} />
          ))}
        </div>
      )}

      {santosFiltrados.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-white/60 text-sm">No se encontraron santos con esos filtros.</p>
        </div>
      )}
    </div>
  );
};

// Componente Tarjeta de Santo (con efectos según rareza)
const TarjetaSanto = ({ santo, desbloqueado, onSeleccionar }) => {
  const [imagenError, setImagenError] = useState(false);
  const estiloTarjeta = TARJETA_ESTILOS[santo.rareza] || TARJETA_ESTILOS.comun;

  return (
    <button
      onClick={() => desbloqueado && onSeleccionar(santo)}
      className={`group relative glass-card rounded-2xl p-4 text-center transition-all duration-300 border ${estiloTarjeta} ${!desbloqueado ? 'opacity-60 grayscale blur-[1px] cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
      disabled={!desbloqueado}
    >
      <div className="relative w-full aspect-square flex items-center justify-center rounded-xl overflow-hidden">
        {santo.imagen && !imagenError ? (
          <img src={santo.imagen} alt={santo.nombre} className="w-full h-full object-cover" onError={() => setImagenError(true)} />
        ) : (
          <span className="text-6xl drop-shadow-md">{santo.icono}</span>
        )}
        {!desbloqueado && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-3xl">🔒</span>
          </div>
        )}
        {desbloqueado && santo.rareza === 'legendario' && (
          <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-yellow-400 animate-ping" />
        )}
      </div>
      <p className={`font-black text-sm mt-2 truncate ${santo.rareza === 'legendario' ? 'text-yellow-300' : 'text-white'}`}>{santo.nombre}</p>
      <RarezaBadge rareza={santo.rareza} className="mt-1" />
    </button>
  );
};

export default Album;