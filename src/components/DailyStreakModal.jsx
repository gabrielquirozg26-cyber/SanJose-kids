import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

const DailyStreakModal = ({ isOpen, onClose, racha, recompensa }) => {
  useEffect(() => {
    if (isOpen) {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.4 }, colors: ['#facc15', '#ffffff'] });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card rounded-3xl p-6 max-w-sm w-full text-center space-y-4 animate-slide-up border border-yellow-400/30">
        <div className="text-7xl animate-bounce">🔥</div>
        <h2 className="text-2xl font-black text-white">¡Racha de {racha} días!</h2>
        <p className="text-white/70 text-sm">Has completado tu primera lección del día</p>
        <div className="bg-yellow-400/20 rounded-2xl p-4 border border-yellow-400/40">
          <span className="text-yellow-400 font-black text-3xl">+{recompensa} 🪙</span>
          <p className="text-white/60 text-xs">Bonus por constancia</p>
        </div>
        <p className="text-white/40 text-xs">
          {racha >= 7 ? "¡Eres una leyenda! Sigue así." : racha >= 3 ? "¡Vas excelente!" : "¡Cada día cuenta!"}
        </p>
        <button onClick={onClose} className="btn-primary w-full py-3 text-sm">
          ¡Increíble! ✨
        </button>
      </div>
    </div>
  );
};

export default DailyStreakModal;