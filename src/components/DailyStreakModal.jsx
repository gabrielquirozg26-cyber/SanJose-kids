import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

const DailyStreakModal = ({ isOpen, onClose, racha, recompensa }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Confeti más elaborado según la racha
      const intensity = Math.min(racha, 30) / 30; // más racha = más confeti
      confetti({
        particleCount: Math.floor(200 + intensity * 300),
        spread: 120,
        origin: { y: 0.4 },
        colors: ['#facc15', '#ffffff', '#ff8c00', '#ffdd00'],
        startVelocity: 20,
        ticks: 200,
      });
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.3 },
          colors: ['#ffaa00', '#ffdd44'],
        });
      }, 300);

      // Reproducir sonido (opcional, descomentar si tienes el archivo)
      // if (audioRef.current) {
      //   audioRef.current.play().catch(e => console.log('Audio no permitido'));
      // }
    }
  }, [isOpen, racha]);

  if (!isOpen) return null;

  // Mensaje y emoji según la racha
  let mensaje = '';
  let emoji = '🔥';
  let bgGradient = 'from-yellow-500/30 to-orange-500/30';
  if (racha === 1) {
    mensaje = '¡Primer día de racha! 🌱';
    emoji = '🌱';
    bgGradient = 'from-green-500/30 to-emerald-500/30';
  } else if (racha >= 2 && racha <= 6) {
    mensaje = `¡${racha} días seguidos! 🚀`;
    emoji = '🚀';
    bgGradient = 'from-blue-500/30 to-cyan-500/30';
  } else if (racha >= 7 && racha <= 14) {
    mensaje = `¡${racha} días! Eres un campeón 🏆`;
    emoji = '🏆';
    bgGradient = 'from-yellow-500/30 to-amber-500/30';
  } else if (racha >= 15) {
    mensaje = `✨ LEYENDA ✨ · ${racha} días`;
    emoji = '👑';
    bgGradient = 'from-purple-500/30 to-pink-500/30';
  }

  return (
    <>
      {/* Audio opcional */}
      {/* <audio ref={audioRef} src="/sounds/fanfare.mp3" preload="auto" /> */}

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className={`relative glass-card rounded-3xl p-6 max-w-sm w-full text-center space-y-4 border-2 ${bgGradient} shadow-2xl transform transition-all duration-500 animate-slide-up`}>
          {/* Efecto de llamas animadas en el borde */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl blur-lg opacity-50 animate-pulse" />
          
          <div className="relative z-10">
            <div className="text-8xl animate-bounce drop-shadow-2xl">{emoji}</div>
            <h2 className="text-3xl font-black text-white mt-2 tracking-tighter">
              ¡Racha de <span className="text-yellow-400">{racha}</span> días!
            </h2>
            <p className="text-white/80 text-sm mt-1">{mensaje || '¡Sigue así!'}</p>
            
            <div className="my-4 bg-white/10 rounded-2xl p-4 border border-yellow-400/40 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl animate-pulse">🪙</span>
                <span className="text-yellow-400 font-black text-4xl">+{recompensa}</span>
              </div>
              <p className="text-white/60 text-xs mt-1">Bonus por constancia</p>
            </div>

            {/* Barra de progreso de racha (sugerencia visual) */}
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((racha / 30) * 100, 100)}%` }}
              />
            </div>
            <p className="text-white/30 text-[10px] mt-1">
              {racha >= 30 ? '¡Racha legendaria!' : `¡A por los ${Math.ceil(racha / 10) * 10} días!`}
            </p>

            <button 
              onClick={onClose}
              className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-blue-900 font-black text-sm uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              ¡Increíble! ✨
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DailyStreakModal;