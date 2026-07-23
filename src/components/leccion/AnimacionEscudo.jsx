// src/components/leccion/AnimacionEscudo.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// ── PARTÍCULAS DE LUZ ──────────────────────────────────────────────────
const LightParticles = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const nuevas = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 6,
      duration: 1.5 + Math.random() * 2,
      delay: Math.random() * 0.5,
      angle: Math.random() * 360,
      color: ['#facc15', '#ffffff', '#ffd700', '#ff8c00', '#ffdd00'][
        Math.floor(Math.random() * 5)
      ],
    }));
    setParticles(nuevas);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0],
            x: [0, Math.cos(p.angle) * 60 * (0.5 + Math.random())],
            y: [0, Math.sin(p.angle) * 60 * (0.5 + Math.random())],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
          }}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}40`,
          }}
        />
      ))}
    </div>
  );
};

// ── ANILLOS DE ENERGÍA ──────────────────────────────────────────────────
const EnergyRings = () => {
  const rings = Array.from({ length: 3 }, (_, i) => ({
    id: i,
    delay: i * 0.15,
    size: 40 + i * 20,
    opacity: 0.4 - i * 0.1,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {rings.map((ring) => (
        <motion.div
          key={ring.id}
          className="absolute rounded-full border-2 border-yellow-400/30"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: [0.5, 2.5, 3.5],
            opacity: [0.6, ring.opacity, 0],
          }}
          transition={{
            duration: 2,
            delay: ring.delay,
            ease: 'easeOut',
          }}
          style={{
            width: ring.size,
            height: ring.size,
            boxShadow: '0 0 40px rgba(250,204,21,0.1)',
          }}
        />
      ))}
    </div>
  );
};

// ── RAYOS DE LUZ ──────────────────────────────────────────────────────────
const LightRays = () => {
  const rays = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i / 12) * 360,
    delay: Math.random() * 0.3,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {rays.map((ray) => (
        <motion.div
          key={ray.id}
          className="absolute h-[1px] bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{
            scaleX: [0, 1, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 1.5,
            delay: ray.delay,
            ease: 'easeInOut',
          }}
          style={{
            width: '80%',
            transform: `rotate(${ray.angle}deg)`,
            transformOrigin: 'center',
          }}
        />
      ))}
    </div>
  );
};

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────
const AnimacionEscudo = ({ onFin }) => {
  const [etapa, setEtapa] = useState(0);
  const [mostrarMensaje, setMostrarMensaje] = useState(false);

  useEffect(() => {
    // ── SONIDO ÉPICO ──
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      // Sonido de escudo activándose
      oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.3);
      oscillator.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.6);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
      oscillator.type = 'sine';
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 1);

      audioCtx.resume();
    } catch (e) {}

    // ── VIBRACIÓN ──
    try {
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([50, 30, 80, 50, 100, 50, 150]);
      }
    } catch (e) {}

    // ── CONFETI ──
    const lanzarConfeti = () => {
      confetti({
        particleCount: 150,
        spread: 130,
        origin: { y: 0.4 },
        colors: ['#facc15', '#ffffff', '#ffd700', '#ff8c00', '#ffdd00', '#3b82f6'],
        shapes: ['circle', 'square'],
      });

      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#facc15', '#ffdd00', '#ffffff'],
          shapes: ['star'],
        });
      }, 300);

      setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.2 },
          colors: ['#ffd700', '#ff8c00', '#facc15'],
        });
      }, 600);
    };

    lanzarConfeti();

    // ── ETAPAS ──
    setTimeout(() => setEtapa(1), 400);
    setTimeout(() => setMostrarMensaje(true), 600);
    setTimeout(() => setEtapa(2), 1200);
    setTimeout(() => setEtapa(3), 1800);

    // ── FIN ──
    const timer = setTimeout(() => {
      setEtapa(4);
      setTimeout(onFin, 500);
    }, 2800);

    return () => clearTimeout(timer);
  }, [onFin]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── EFECTOS DE FONDO ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/50 via-purple-900/30 to-slate-900/50" />

      {/* ── PARTÍCULAS DE LUZ ── */}
      <LightParticles />

      {/* ── ANILLOS DE ENERGÍA ── */}
      <EnergyRings />

      {/* ── RAYOS DE LUZ ── */}
      <LightRays />

      {/* ── ESCUDO PRINCIPAL ── */}
      <motion.div
        className="relative flex items-center justify-center mb-6"
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{
          scale: etapa >= 1 ? 1 : 0.3,
          opacity: etapa >= 1 ? 1 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
          delay: 0.2,
        }}
      >
        {/* ── GLOW EXTERIOR ── */}
        <motion.div
          className="absolute w-48 h-48 rounded-full"
          animate={{
            scale: etapa >= 2 ? [1, 1.4, 1] : 1,
            opacity: etapa >= 2 ? [0.6, 0.9, 0.6] : 0.6,
          }}
          transition={{
            duration: 1.5,
            repeat: etapa >= 3 ? 0 : Infinity,
            ease: 'easeInOut',
          }}
          style={{
            background: 'radial-gradient(circle, rgba(250,204,21,0.2) 0%, transparent 70%)',
          }}
        />

        {/* ── GLOW INTERIOR ── */}
        <motion.div
          className="absolute w-40 h-40 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 1,
            repeat: etapa >= 3 ? 0 : Infinity,
            ease: 'easeInOut',
          }}
          style={{
            background: 'radial-gradient(circle, rgba(250,204,21,0.15) 0%, transparent 70%)',
          }}
        />

        {/* ── ESCUDO ── */}
        <motion.div
          className="relative w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400/40 to-blue-500/40 border-4 border-yellow-400 flex items-center justify-center shadow-[0_0_80px_rgba(250,204,21,0.5)]"
          animate={{
            scale: etapa >= 2 ? [1, 1.1, 1] : 1,
            rotate: etapa >= 2 ? [0, 5, -5, 0] : 0,
          }}
          transition={{
            duration: 0.8,
            delay: 0.2,
            ease: 'easeInOut',
          }}
        >
          <span className="text-7xl drop-shadow-2xl">🛡️</span>

          {/* ── BRILLO EN EL ESCUDO ── */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent"
            animate={{
              opacity: [0, 0.5, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              clipPath: 'polygon(0 0, 40% 0, 60% 100%, 0 100%)',
            }}
          />
        </motion.div>
      </motion.div>

      {/* ── MENSAJE ── */}
      <AnimatePresence>
        {mostrarMensaje && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="text-center space-y-2 px-8"
          >
            <motion.p
              className="text-yellow-400 font-black text-xs uppercase tracking-[0.5em]"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ✦ El escudo de ✦
            </motion.p>

            <motion.h2
              className="text-white font-black text-4xl sm:text-5xl tracking-tight"
              animate={{
                textShadow: [
                  '0 0 20px rgba(250,204,21,0.3)',
                  '0 0 40px rgba(250,204,21,0.6)',
                  '0 0 20px rgba(250,204,21,0.3)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              San Miguel
            </motion.h2>

            <motion.p
              className="text-white font-black text-xl"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              te ha protegido
            </motion.p>

            <motion.p
              className="text-white/60 text-sm font-bold italic mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              ✦ Tu error fue absorbido ✦
            </motion.p>

            <motion.p
              className="text-yellow-400/50 text-xs font-black uppercase tracking-wider mt-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.6,
                type: 'spring',
                stiffness: 400,
                damping: 15,
              }}
            >
              ¡SIGUE ADELANTE!
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BARRA DE PROGRESO ── */}
      <motion.div
        className="mt-8 w-48 h-1.5 bg-white/10 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-300 rounded-full"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: 2.8, ease: 'linear' }}
        />
      </motion.div>

      {/* ── PARTÍCULAS DE CIERRE ── */}
      <AnimatePresence>
        {etapa >= 3 && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 20 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                initial={{
                  x: '50%',
                  y: '50%',
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  x: `${50 + (Math.random() - 0.5) * 80}%`,
                  y: `${50 + (Math.random() - 0.5) * 80}%`,
                  scale: [0, 1.5, 0],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.05,
                  ease: 'easeOut',
                }}
                style={{
                  width: 2 + Math.random() * 4,
                  height: 2 + Math.random() * 4,
                  backgroundColor: ['#facc15', '#ffffff', '#ffd700', '#ff8c00'][
                    Math.floor(Math.random() * 4)
                  ],
                  boxShadow: `0 0 ${10 + Math.random() * 20}px rgba(250,204,21,0.3)`,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AnimacionEscudo;