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
        <button onClick={onVolver} className="mt-4 text-white bg-blue-500 px-4 py-2 rounded-xl">
          Volver al álbum
        </button>
      </div>
    );
  }

  const estilo = RAREZA_COLOR[santo.rareza] || RAREZA_COLOR.comun;

  return (
    <div className="py-6 animate-slide-up">
      <button 
        onClick={onVolver} 
        className="mb-4 text-white/40 hover:text-white/80 flex items-center gap-2 text-sm font-black uppercase tracking-wider transition-colors"
      >
        ← Volver al álbum
      </button>
      <div className={`glass-card rounded-3xl p-6 border ${estilo.border} bg-gradient-to-b ${estilo.bg}`}>
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-32 h-32 rounded-3xl bg-white/10 flex items-center justify-center text-8xl shadow-2xl">
            {santo.icono || '❓'}
          </div>
          <h2 className="text-3xl font-black text-white">{santo.nombre || 'Santo'}</h2>
          <span className={`inline-block text-xs font-black uppercase px-3 py-1 rounded-full border ${estilo.border} ${estilo.text}`}>
            {santo.rareza ? santo.rareza.toUpperCase() : 'COMÚN'}
          </span>
          <div className="w-full space-y-4 text-left mt-4">
            <div className="bg-white/5 rounded-2xl p-4">
              <p className="text-yellow-400 text-[10px] font-black uppercase tracking-wider">🎉 Festividad</p>
              <p className="text-white font-bold text-sm mt-1">{santo.festividad || 'Por confirmar'}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4">
              <p className="text-yellow-400 text-[10px] font-black uppercase tracking-wider">📖 Biografía</p>
              <p className="text-white/80 text-sm mt-1 leading-relaxed">{santo.biografia || 'Sin información disponible'}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4">
              <p className="text-yellow-400 text-[10px] font-black uppercase tracking-wider">✨ Enseñanza</p>
              <p className="text-white/80 text-sm mt-1 leading-relaxed">{santo.ensenanza || 'Sin información disponible'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleSantos;