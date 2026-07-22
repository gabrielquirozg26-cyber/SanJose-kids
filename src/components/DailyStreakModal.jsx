import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const DailyStreakModal = ({ isOpen, onClose, racha, recompensa }) => {
  const audioRef = useRef(null);

  // ── CONFETI Y EFECTOS ──
  useEffect(() => {
    if (isOpen) {
      const intensity = Math.min(racha, 30) / 30;
      
      // Confeti principal
      confetti({
        particleCount: Math.floor(200 + intensity * 300),
        spread: 130,
        origin: { y: 0.3 },
        colors: ['#facc15', '#ffffff', '#ff8c00', '#ffdd00', '#3b82f6', '#a855f7'],
        startVelocity: 25,
        ticks: 250,
      });
      
      // Segundo burst
      setTimeout(() => {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#ffaa00', '#ffdd44', '#ffffff'],
        });
      }, 300);

      // Tercer burst para rachas altas
      if (racha >= 7) {
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.2 },
            colors: ['#facc15', '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff'],
          });
        }, 600);
      }

      // Sonido (opcional)
      // if (audioRef.current) {
      //   audioRef.current.play().catch(() => {});
      // }
    }
  }, [isOpen, racha]);

  if (!isOpen) return null;

  // ── CONFIGURACIÓN SEGÚN RACHA ──
  const getConfig = () => {
    if (racha === 1) {
      return {
        emoji: '🌱',
        titulo: '¡Primer día!',
        mensaje: 'Has comenzado tu camino de fe. ¡Sigue así!',
        bgGradient: 'from-green-500/30 to-emerald-500/30',
        borderColor: 'border-green-400/60',
        textColor: 'text-green-400',
        iconBg: 'bg-green-500/20',
      };
    }
    if (racha >= 2 && racha <= 6) {
      return {
        emoji: '🚀',
        titulo: `¡${racha} días seguidos!`,
        mensaje: 'Estás construyendo un gran hábito de fe.',
        bgGradient: 'from-blue-500/30 to-cyan-500/30',
        borderColor: 'border-blue-400/60',
        textColor: 'text-blue-400',
        iconBg: 'bg-blue-500/20',
      };
    }
    if (racha >= 7 && racha <= 14) {
      return {
        emoji: '🏆',
        titulo: `¡${racha} días! Eres un campeón`,
        mensaje: 'Tu constancia es admirable. ¡Sigue brillando!',
        bgGradient: 'from-yellow-500/30 to-amber-500/30',
        borderColor: 'border-yellow-400/60',
        textColor: 'text-yellow-400',
        iconBg: 'bg-yellow-500/20',
      };
    }
    if (racha >= 15 && racha <= 29) {
      return {
        emoji: '👑',
        titulo: `✨ LEYENDA ✨ · ${racha} días`,
        mensaje: 'Eres un verdadero guerrero de la fe. ¡Increíble!',
        bgGradient: 'from-purple-500/30 to-pink-500/30',
        borderColor: 'border-purple-400/60',
        textColor: 'text-purple-400',
        iconBg: 'bg-purple-500/20',
      };
    }
    if (racha >= 30) {
      return {
        emoji: '💎',
        titulo: `🔥 RACHA DIVINA 🔥 · ${racha} días`,
        mensaje: '¡Eres una leyenda viva! Dios te bendice grandemente.',
        bgGradient: 'from-amber-500/30 via-orange-500/30 to-red-500/30',
        borderColor: 'border-orange-400/60',
        textColor: 'text-orange-400',
        iconBg: 'bg-orange-500/20',
      };
    }
    return {
      emoji: '🔥',
      titulo: `¡Racha de ${racha} días!`,
      mensaje: '¡Sigue adelante en tu camino de fe!',
      bgGradient: 'from-yellow-500/30 to-orange-500/30',
      borderColor: 'border-yellow-400/60',
      textColor: 'text-yellow-400',
      iconBg: 'bg-yellow-500/20',
    };
  };

  const config = getConfig();

  // ── ANIMACIONES ──
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 25,
        duration: 0.5
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: 50,
      transition: { duration: 0.3 }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: 'spring', 
        stiffness: 400, 
        damping: 15,
        delay: 0.2
      }
    }
  };

  const pulseVariants = {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.1, 1],
      transition: { 
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <>
      {/* Audio opcional */}
      {/* <audio ref={audioRef} src="/sounds/level-up.mp3" preload="auto" /> */}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-sm"
            >
              {/* Efecto de brillo exterior */}
              <div className={`absolute -inset-1 rounded-3xl bg-gradient-to-r ${config.bgGradient} blur-xl opacity-50 animate-pulse`} />

              {/* Contenido del modal */}
              <div className={`relative glass-card rounded-3xl p-6 sm:p-8 border-2 ${config.borderColor} bg-black/60 backdrop-blur-xl shadow-2xl overflow-hidden`}>
                {/* Decoración de fondo */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/5 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-400/5 rounded-full blur-[80px]" />

                {/* Fuego/llamas decorativas (solo rachas altas) */}
                {racha >= 7 && (
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl animate-pulse" />
                )}

                <div className="relative z-10 text-center space-y-5">
                  {/* Icono con animación */}
                  <motion.div
                    variants={iconVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex justify-center"
                  >
                    <div className={`relative ${config.iconBg} rounded-full p-4 sm:p-5 border ${config.borderColor} shadow-lg`}>
                      <motion.div
                        variants={pulseVariants}
                        initial="initial"
                        animate="animate"
                        className="text-6xl sm:text-7xl drop-shadow-2xl"
                      >
                        {config.emoji}
                      </motion.div>
                      {racha >= 30 && (
                        <div className="absolute -top-2 -right-2 animate-ping">
                          <span className="text-xl">⭐</span>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Título */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className={`text-2xl sm:text-3xl font-black ${config.textColor} tracking-tighter`}>
                      {config.titulo}
                    </h2>
                    <p className="text-white/70 text-xs sm:text-sm mt-1">
                      {config.mensaje}
                    </p>
                  </motion.div>

                  {/* Recompensa */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring' }}
                    className={`glass-card rounded-2xl p-4 sm:p-5 border ${config.borderColor} bg-gradient-to-r ${config.bgGradient}`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-4xl sm:text-5xl animate-pulse">🪙</span>
                      <div>
                        <p className={`text-3xl sm:text-4xl font-black ${config.textColor}`}>
                          +{recompensa}
                        </p>
                        <p className="text-white/40 text-xs font-black uppercase tracking-widest">
                          Monedas ganadas
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Barra de progreso de racha */}
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: '100%' }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="w-full space-y-1"
                  >
                    <div className="flex justify-between text-white/30 text-[8px] font-black uppercase tracking-widest">
                      <span>Progreso de racha</span>
                      <span>{racha} días</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((racha / 30) * 100, 100)}%` }}
                        transition={{ delay: 0.6, duration: 1 }}
                        className={`h-full rounded-full bg-gradient-to-r ${
                          racha >= 30 
                            ? 'from-amber-400 via-orange-400 to-red-400' 
                            : racha >= 15 
                            ? 'from-purple-400 to-pink-400'
                            : racha >= 7 
                            ? 'from-yellow-400 to-amber-400'
                            : 'from-green-400 to-emerald-400'
                        }`}
                      />
                    </div>
                    <p className="text-white/20 text-[8px] text-center">
                      {racha >= 30 
                        ? '🏆 ¡Racha Divina alcanzada!' 
                        : racha >= 15 
                        ? `💪 ¡A por los 30 días!`
                        : racha >= 7 
                        ? `🌟 ¡Sigue así!`
                        : `🌱 ¡Cada día cuenta!`}
                    </p>
                  </motion.div>

                  {/* Botón */}
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    onClick={onClose}
                    className={`w-full py-3 sm:py-4 rounded-2xl font-black text-sm sm:text-base uppercase tracking-widest shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all bg-gradient-to-r ${
                      racha >= 30
                        ? 'from-amber-500 to-orange-500 text-white'
                        : racha >= 15
                        ? 'from-purple-500 to-pink-500 text-white'
                        : 'from-yellow-400 to-amber-400 text-blue-900'
                    }`}
                  >
                    {racha >= 30 ? '🌟 ¡Increíble!' : '🎉 ¡Qué emoción!'}
                  </motion.button>

                  {/* Mensaje extra para rachas altas */}
                  {racha >= 30 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="text-orange-300/60 text-[8px] font-black uppercase tracking-widest animate-pulse"
                    >
                      ✨ Eres una inspiración para todos ✨
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DailyStreakModal;