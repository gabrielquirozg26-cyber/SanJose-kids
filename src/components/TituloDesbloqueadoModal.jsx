import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

const rarezaColores = {
  comun: 'border-slate-400 text-slate-200 from-slate-500/30',
  raro: 'border-blue-400 text-blue-200 from-blue-500/30',
  epico: 'border-purple-400 text-purple-200 from-purple-500/30',
  legendario: 'border-yellow-400 text-yellow-200 from-yellow-500/30',
  divino: 'border-cyan-400 text-cyan-200 from-cyan-500/30',
};

const TituloDesbloqueadoModal = ({ isOpen, onClose, titulo }) => {
  useEffect(() => {
    if (isOpen && titulo) {
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 }, colors: ['#facc15', '#fff', '#a855f7'] });
      const audio = new Audio('/sounds/unlock.mp3'); // opcional
      audio.play().catch(e => console.log('Audio no soportado'));
    }
  }, [isOpen, titulo]);

  if (!isOpen || !titulo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className={`max-w-sm w-full rounded-3xl bg-gradient-to-b ${rarezaColores[titulo.rareza]} p-1 animate-slide-up`}>
        <div className="bg-black/80 rounded-3xl p-6 text-center space-y-3">
          <div className="text-6xl animate-bounce">🏆</div>
          <p className="text-white/70 text-xs font-black uppercase tracking-widest">¡Nuevo título desbloqueado!</p>
          <h2 className="text-3xl font-black bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">
            {titulo.nombre}
          </h2>
          <div className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase border ${rarezaColores[titulo.rareza].split(' ')[0]} ${rarezaColores[titulo.rareza].split(' ')[1]}`}>
            {titulo.rareza.toUpperCase()}
          </div>
          <p className="text-white/60 text-sm">Ya puedes equiparlo desde tu perfil.</p>
          <button onClick={onClose} className="btn-primary w-full py-3 text-sm">
            ¡Increíble! ✨
          </button>
        </div>
      </div>
    </div>
  );
};

export default TituloDesbloqueadoModal;