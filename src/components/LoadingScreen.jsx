import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [mensajeIndex, setMensajeIndex] = useState(0);
  const [mostrarLogo, setMostrarLogo] = useState(false);

  // ── MENSAJES INSPIRADORES ──────────────────────────────────────────────
  const mensajes = [
    'Preparando tu aventura de fe... ✨',
    'Cargando bendiciones divinas... 🙏',
    'Abriendo las puertas del cielo... 🌟',
    'Iluminando tu camino... 🕊️',
    'Preparando los santos... ⛪',
    'Despertando tu espíritu... 🔥',
    'Llenando tu corazón de fe... ❤️',
    'Conectando con el amor de Dios... 💫',
  ];

  // ── PROGRESO DE CARGA ──────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2 + Math.random() * 3;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // ── CAMBIAR MENSAJE ────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setMensajeIndex(prev => (prev + 1) % mensajes.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // ── MOSTRAR LOGO CON ANIMACIÓN ────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setMostrarLogo(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // ── ANIMACIONES ─────────────────────────────────────────────────────────
  const logoVariants = {
    hidden: { scale: 0, opacity: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      rotate: 0,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 20,
        duration: 0.8
      }
    }
  };

  const glowVariants = {
    initial: { scale: 1, opacity: 0.5 },
    animate: { 
      scale: [1, 1.2, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: { 
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    duration: 3 + Math.random() * 4,
    delay: Math.random() * 3,
    opacity: 0.2 + Math.random() * 0.3
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 overflow-hidden">
      {/* ── FONDO CON EFECTO DE ESTRELLAS ── */}
      <div className="absolute inset-0">
        {/* Estrellas fijas */}
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-white"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, p.opacity, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
            }}
          />
        ))}

        {/* Brillo central */}
        <motion.div
          variants={glowVariants}
          initial="initial"
          animate="animate"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-400/10 rounded-full blur-[120px]"
        />

        {/* Brillo lateral */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center space-y-8 px-4 max-w-sm w-full">
        {/* ── LOGO CON GLOW ── */}
        <motion.div
          variants={logoVariants}
          initial="hidden"
          animate={mostrarLogo ? 'visible' : 'hidden'}
          className="relative"
        >
          <div className="absolute -inset-4 bg-yellow-400/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-yellow-400/60 shadow-[0_0_60px_rgba(250,204,21,0.3)] bg-gradient-to-br from-yellow-400/20 to-amber-400/20">
            <img 
              src="/logo.jpg" 
              alt="San JoseKids" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </motion.div>

        {/* ── NOMBRE ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-300 bg-clip-text text-transparent">
            San JoseKids
          </h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mt-2">
            Iglesia San José · Diriamba
          </p>
        </motion.div>

        {/* ── MENSAJE ── */}
        <AnimatePresence mode="wait">
          <motion.p
            key={mensajeIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-white/60 text-sm sm:text-base font-medium text-center"
          >
            {mensajes[mensajeIndex]}
          </motion.p>
        </AnimatePresence>

        {/* ── BARRA DE PROGRESO ── */}
        <div className="w-full space-y-2">
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-300"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ ease: 'easeOut' }}
            />
            {/* Efecto de brillo en la barra */}
            <motion.div
              className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear'
              }}
              style={{ 
                width: '30%',
                left: '-30%'
              }}
            />
          </div>

          {/* Porcentaje */}
          <div className="flex justify-between text-white/30 text-[9px] font-black uppercase tracking-widest">
            <span>Cargando</span>
            <motion.span
              key={Math.floor(progress)}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {Math.min(Math.floor(progress), 100)}%
            </motion.span>
          </div>
        </div>

        {/* ── PUNTOS ANIMADOS ── */}
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-yellow-400/40"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 1.2,
                delay: i * 0.2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>

        {/* ── VERSÍCULO ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-2"
        >
          <p className="text-white/10 text-[8px] italic tracking-wider">
            "Dejen que los niños vengan a mí" — Mateo 19:14
          </p>
        </motion.div>
      </div>

      {/* ── ESQUINAS DECORATIVAS ── */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-yellow-400/10 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-yellow-400/10 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-yellow-400/10 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-yellow-400/10 rounded-br-lg" />
    </div>
  );
};

export default LoadingScreen;