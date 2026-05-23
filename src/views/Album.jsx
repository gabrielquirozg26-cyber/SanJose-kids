import React from 'react';
import { useGame } from '../context/GameContext';

const RAREZA_COLOR = {
  comun: { bg: 'from-slate-500/20 to-slate-400/10', border: 'border-slate-400/30', text: 'text-slate-300', tag: 'Común' },
  raro: { bg: 'from-blue-500/20 to-blue-400/10', border: 'border-blue-400/40', text: 'text-blue-300', tag: 'Raro' },
  legendario: { bg: 'from-yellow-500/20 to-yellow-400/10', border: 'border-yellow-400/50', text: 'text-yellow-300', tag: 'Legendario' },
};

const Album = ({ onSeleccionarSanto }) => {
  const { coleccion, catalogoSantos } = useGame();

  if (!catalogoSantos || catalogoSantos.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-white/60">Cargando santos...</p>
      </div>
    );
  }

  // Agrupar por sección
  const secciones = {};
  catalogoSantos.forEach(santo => {
    if (!secciones[santo.seccion]) secciones[santo.seccion] = [];
    secciones[santo.seccion].push(santo);
  });

  return (
    <div className="py-6 space-y-8 animate-slide-up">
      <div className="text-center mb-2">
        <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.4em]">Mi Álbum</p>
        <h2 className="text-3xl font-black text-white tracking-tighter">Santos para Coleccionar</h2>
        <p className="text-white/40 text-xs mt-1">{coleccion.length} / {catalogoSantos.length} desbloqueados</p>
      </div>

      {Object.entries(secciones).map(([nombreSeccion, santos]) => (
        <div key={nombreSeccion} className="space-y-3">
          <h3 className="text-lg font-black text-white/70 border-l-4 border-yellow-400 pl-3 uppercase tracking-wider">
            {nombreSeccion}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {santos.map(santo => {
              const desbloqueado = coleccion.includes(santo.id);
              const estilo = RAREZA_COLOR[santo.rareza];
              const tieneImagen = santo.imagen && santo.imagen !== '';

              return (
                <button
                  key={santo.id}
                  onClick={() => {
                    if (desbloqueado && onSeleccionarSanto) {
                      onSeleccionarSanto(santo);
                    }
                  }}
                  className={`glass-card rounded-2xl p-3 text-center border transition-all duration-300
                    ${desbloqueado ? estilo.border : 'border-white/10 opacity-60 cursor-not-allowed'}
                    ${desbloqueado ? 'hover:scale-105 cursor-pointer' : ''}
                    ${!desbloqueado ? 'bg-white/5' : `bg-gradient-to-b ${estilo.bg}`}`}
                  disabled={!desbloqueado}
                >
                  <div className={`relative w-20 h-20 mx-auto rounded-2xl flex items-center justify-center overflow-hidden
                    ${desbloqueado ? '' : 'grayscale blur-[1px]'}`}
                  >
                    {desbloqueado ? (
                      tieneImagen ? (
                        <img 
                          src={santo.imagen} 
                          alt={santo.nombre}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Si la imagen falla, mostrar emoji
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<span class="text-5xl">${santo.icono || '❓'}</span>`;
                          }}
                        />
                      ) : (
                        <span className="text-5xl">{santo.icono || '❓'}</span>
                      )
                    ) : (
                      <span className="text-5xl">❓</span>
                    )}
                    {!desbloqueado && (
                      <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                        <span className="text-2xl">🔒</span>
                      </div>
                    )}
                  </div>
                  <p className={`font-black text-sm mt-2 truncate ${desbloqueado ? 'text-white' : 'text-white/30'}`}>
                    {santo.nombre}
                  </p>
                  <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${estilo.border} ${estilo.text} mt-1`}>
                    {estilo.tag}
                  </span>
                  {desbloqueado && santo.rareza === 'legendario' && (
                    <div className="mt-1 text-yellow-400 text-[10px] animate-pulse">✨</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Album;