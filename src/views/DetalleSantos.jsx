import React from 'react';

const RAREZA_COLOR = {
  comun: { bg: 'from-slate-500/20 to-slate-400/10', border: 'border-slate-400/30', text: 'text-slate-300' },
  raro: { bg: 'from-blue-500/20 to-blue-400/10', border: 'border-blue-400/40', text: 'text-blue-300' },
  legendario: { bg: 'from-yellow-500/20 to-yellow-400/10', border: 'border-yellow-400/50', text: 'text-yellow-300' },
};

const DetalleSantos = ({ santo, onVolver }) => {
  // Si no hay santo, mostramos error y botón para volver
  if (!santo) {
    return (
      <div className="py-6 text-center">
        <p className="text-white/60">Error: No se pudo cargar el santo.</p>
        <button onClick={onVolver} className="mt-4 btn-primary">
          Volver al álbum
        </button>
      </div>
    );
  }

  const estilo = RAREZA_COLOR[santo.rareza] || RAREZA_COLOR.comun;
  const tieneImagen = santo.imagen && santo.imagen !== '';

  return (
    <div className="py-6 animate-slide-up">
      {/* Botón volver */}
      <button 
        onClick={onVolver} 
        className="mb-4 text-white/40 hover:text-white/80 flex items-center gap-2 text-sm font-black uppercase tracking-wider transition-colors"
      >
        ← Volver al álbum
      </button>

      {/* Tarjeta principal */}
      <div className={`glass-card rounded-3xl p-6 border ${estilo.border} bg-gradient-to-b ${estilo.bg}`}>
        <div className="flex flex-col items-center text-center space-y-4">
          
          {/* Imagen del santo (grande) */}
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-yellow-400/20 to-amber-400/20 blur-xl opacity-50" />
            <div className={`relative w-40 h-40 rounded-3xl bg-white/10 flex items-center justify-center overflow-hidden shadow-2xl border-2 ${estilo.border}`}>
              {tieneImagen ? (
                <img 
                  src={santo.imagen} 
                  alt={santo.nombre}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Si la imagen falla, mostrar emoji
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<span class="text-7xl">${santo.icono || '❓'}</span>`;
                  }}
                />
              ) : (
                <span className="text-7xl">{santo.icono || '❓'}</span>
              )}
            </div>
            {/* Badge de rareza flotante */}
            <div className="absolute -top-2 -right-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20">
              <span className={`text-[9px] font-black uppercase ${estilo.text}`}>
                {santo.rareza.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Nombre */}
          <h2 className="text-3xl font-black text-white tracking-tighter">{santo.nombre}</h2>
          
          {/* Rareza (visible) */}
          <span className={`inline-block text-xs font-black uppercase px-3 py-1 rounded-full border ${estilo.border} ${estilo.text}`}>
            {santo.rareza.toUpperCase()}
          </span>

          {/* Descripción corta */}
          {santo.descripcion && (
            <p className="text-white/70 text-sm italic max-w-xs">{santo.descripcion}</p>
          )}

          {/* Información detallada */}
          <div className="w-full space-y-4 text-left mt-2">
            {/* Festividad */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-yellow-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <span>🎉</span> Festividad
              </p>
              <p className="text-white font-bold text-sm mt-1">{santo.festividad || 'Por confirmar'}</p>
            </div>

            {/* Biografía */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-yellow-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <span>📖</span> Biografía
              </p>
              <p className="text-white/80 text-sm mt-1 leading-relaxed">{santo.biografia || 'Sin información disponible'}</p>
            </div>

            {/* Enseñanza */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-yellow-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <span>✨</span> Enseñanza
              </p>
              <p className="text-white/80 text-sm mt-1 leading-relaxed">{santo.ensenanza || 'Sin información disponible'}</p>
            </div>
          </div>

          {/* Decoración de rareza legendaria */}
          {santo.rareza === 'legendario' && (
            <div className="flex gap-1 mt-2">
              {[...Array(3)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-xs animate-pulse">✨</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetalleSantos;