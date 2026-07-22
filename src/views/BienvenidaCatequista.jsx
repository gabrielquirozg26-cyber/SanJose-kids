// src/views/BienvenidaCatequista.jsx
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { updatePassword } from 'firebase/auth';
import { auth } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const BienvenidaCatequista = ({ onCompletado }) => {
  const { nombre, userDoc } = useGame();
  const { cerrarSesion } = useAuth();
  const { showToast } = useToast();
  
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [paso, setPaso] = useState(1);
  const [mostrarConfeti, setMostrarConfeti] = useState(false);

  const avatar = userDoc?.avatar || '👨‍🏫';
  const esImagen = avatar?.startsWith('data:image') || avatar?.startsWith('http') || avatar?.startsWith('/images/');

  // ── CONFETI DE BIENVENIDA ──
  useEffect(() => {
    if (!mostrarConfeti) {
      setMostrarConfeti(true);
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.3 },
        colors: ['#3b82f6', '#ffffff', '#8b5cf6', '#60a5fa', '#a855f7']
      });
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#3b82f6', '#8b5cf6', '#60a5fa']
        });
      }, 500);
    }
  }, []);

  // ── CAMBIAR CONTRASEÑA ──
  const handleCambiarContrasena = async (e) => {
    e.preventDefault();
    setError('');

    if (nuevaContrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (nuevaContrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (nuevaContrasena === 'SanJose2024!') {
      setError('Debes cambiar la contraseña genérica por una nueva.');
      return;
    }

    setCargando(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('No hay usuario autenticado.');
        setCargando(false);
        return;
      }

      await updatePassword(user, nuevaContrasena);
      
      // Confeti de celebración
      confetti({
        particleCount: 300,
        spread: 150,
        origin: { y: 0.3 },
        colors: ['#3b82f6', '#ffffff', '#8b5cf6', '#60a5fa', '#a855f7']
      });
      setTimeout(() => {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#3b82f6', '#60a5fa', '#8b5cf6']
        });
      }, 300);

      // Marcar contraseña como cambiada
      const { db } = await import('../firebase');
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'usuarios', user.uid), {
        contrasenaCambiada: true,
        esPrimeraVez: false,
      });

      setCargando(false);
      showToast('🎉 ¡Contraseña actualizada con éxito!', 'success');
      
      setTimeout(() => {
        onCompletado();
      }, 1500);

    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      let mensaje = 'Error al cambiar la contraseña. Intenta de nuevo.';
      if (err.code === 'auth/weak-password') {
        mensaje = 'La contraseña es demasiado débil. Usa al menos 8 caracteres.';
      } else if (err.code === 'auth/requires-recent-login') {
        mensaje = 'Por seguridad, vuelve a iniciar sesión para cambiar la contraseña.';
        setTimeout(() => cerrarSesion(), 2000);
      }
      setError(mensaje);
      setCargando(false);
    }
  };

  // ── ANIMACIONES ──
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };
  const stagger = {
    visible: { transition: { staggerChildren: 0.15 } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* ── FONDO ── */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/fondo-iglesia.jpeg')", opacity: 0.4 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 via-indigo-900/70 to-slate-900/80" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-400/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      {/* ── ESTRELLAS ── */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20 animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: 1 + Math.random() * 2,
              height: 1 + Math.random() * 2,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative w-full max-w-md"
      >
        {/* Efecto de luz exterior (azul) */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-blue-400/20 rounded-3xl blur-xl" />

        <div className="relative glass-card rounded-3xl p-6 sm:p-8 border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Decoración interior */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-[80px]" />

          <AnimatePresence mode="wait">
            {/* ── PASO 1: BIENVENIDA ── */}
            {paso === 1 && (
              <motion.div
                key="bienvenida"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-6"
              >
                {/* Logo */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex justify-center"
                >
                  <div className="relative">
                    <div className="absolute -inset-1 bg-blue-400/20 rounded-full blur-lg animate-pulse" />
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-blue-400/60 shadow-[0_0_60px_rgba(59,130,246,0.3)] bg-gradient-to-br from-blue-400/20 to-indigo-400/20">
                      <img src="/logo.jpg" alt="San JoseKids" className="w-full h-full object-cover rounded-full" />
                    </div>
                  </div>
                </motion.div>

                {/* Título */}
                <motion.div variants={fadeInUp} className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-400/20 border border-blue-400/40">
                    <span className="text-blue-400 text-xs">👨‍🏫</span>
                    <span className="text-blue-400 font-black text-[10px] uppercase tracking-wider">¡Bienvenido Catequista!</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tighter bg-gradient-to-r from-blue-300 via-indigo-400 to-blue-300 bg-clip-text text-transparent">
                    San JoseKids
                  </h1>
                  <p className="text-white/70 text-lg sm:text-xl font-bold">{nombre || 'Catequista'}</p>
                </motion.div>

                {/* Mensaje */}
                <motion.div variants={fadeInUp} className="space-y-3">
                  <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                    ¡Bienvenido al Panel de Catequistas! 🌟
                  </p>
                  <div className="glass-card p-4 rounded-2xl border border-white/10 text-left space-y-2">
                    <p className="text-white/60 text-xs font-black uppercase tracking-widest">📋 Lo que podrás hacer:</p>
                    <ul className="space-y-1.5">
                      <li className="flex items-center gap-2 text-white/70 text-sm">
                        <span className="text-blue-400">📊</span>
                        Ver estadísticas de tu grupo
                      </li>
                      <li className="flex items-center gap-2 text-white/70 text-sm">
                        <span className="text-blue-400">👥</span>
                        Gestionar tus alumnos
                      </li>
                      <li className="flex items-center gap-2 text-white/70 text-sm">
                        <span className="text-blue-400">📝</span>
                        Evaluar oraciones
                      </li>
                      <li className="flex items-center gap-2 text-white/70 text-sm">
                        <span className="text-blue-400">👨‍🏫</span>
                        Ver otros catequistas del grupo
                      </li>
                    </ul>
                  </div>
                  <p className="text-white/50 text-xs sm:text-sm">
                    Para mantener tu cuenta segura, debes cambiar tu contraseña.
                  </p>
                </motion.div>

                {/* Avatar */}
                <motion.div variants={fadeInUp} className="flex justify-center">
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 blur opacity-70 animate-pulse" />
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white/30 bg-white/10 shadow-lg">
                      {esImagen ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl sm:text-5xl flex items-center justify-center h-full">{avatar}</span>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Botón */}
                <motion.button
                  variants={fadeInUp}
                  onClick={() => setPaso(2)}
                  className="w-full py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-black text-sm sm:text-base uppercase tracking-widest shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>🔐</span>
                  Cambiar mi contraseña
                </motion.button>

                <motion.p variants={fadeInUp} className="text-white/20 text-[8px] sm:text-[10px]">
                  Tu seguridad es importante para nosotros
                </motion.p>
              </motion.div>
            )}

            {/* ── PASO 2: CAMBIAR CONTRASEÑA ── */}
            {paso === 2 && (
              <motion.div
                key="cambiar"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="text-center space-y-2">
                  <div className="flex justify-center">
                    <span className="text-4xl sm:text-5xl">🔐</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">Cambia tu contraseña</h2>
                  <p className="text-white/50 text-xs sm:text-sm">
                    Crea una contraseña segura que solo tú conozcas
                  </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleCambiarContrasena} className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-blue-400 font-black uppercase tracking-widest ml-2 mb-1">
                      🔑 Nueva contraseña
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">🔑</span>
                      <input
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        value={nuevaContrasena}
                        onChange={(e) => setNuevaContrasena(e.target.value)}
                        className="w-full bg-white/5 border-2 border-white/10 rounded-xl p-3 pl-10 text-white font-medium outline-none transition-all placeholder:text-white/20 focus:border-blue-400 focus:shadow-[0_0_20px_rgba(59,130,246,0.1)] disabled:opacity-50"
                        disabled={cargando}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-blue-400 font-black uppercase tracking-widest ml-2 mb-1">
                      ✓ Confirmar contraseña
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">✓</span>
                      <input
                        type="password"
                        placeholder="Vuelve a escribir la contraseña"
                        value={confirmarContrasena}
                        onChange={(e) => setConfirmarContrasena(e.target.value)}
                        className="w-full bg-white/5 border-2 border-white/10 rounded-xl p-3 pl-10 text-white font-medium outline-none transition-all placeholder:text-white/20 focus:border-blue-400 focus:shadow-[0_0_20px_rgba(59,130,246,0.1)] disabled:opacity-50"
                        disabled={cargando}
                      />
                    </div>
                  </div>

                  {/* Requisitos */}
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-2">Requisitos:</p>
                    <ul className="space-y-1 text-[10px] sm:text-xs text-white/50">
                      <li className={`flex items-center gap-2 ${nuevaContrasena.length >= 8 ? 'text-green-400' : ''}`}>
                        <span>{nuevaContrasena.length >= 8 ? '✅' : '⬜'}</span>
                        Al menos 8 caracteres
                      </li>
                      <li className={`flex items-center gap-2 ${nuevaContrasena !== 'SanJose2024!' && nuevaContrasena.length > 0 ? 'text-green-400' : ''}`}>
                        <span>{nuevaContrasena !== 'SanJose2024!' && nuevaContrasena.length > 0 ? '✅' : '⬜'}</span>
                        Diferente a la contraseña genérica
                      </li>
                      <li className={`flex items-center gap-2 ${nuevaContrasena === confirmarContrasena && nuevaContrasena.length > 0 ? 'text-green-400' : ''}`}>
                        <span>{nuevaContrasena === confirmarContrasena && nuevaContrasena.length > 0 ? '✅' : '⬜'}</span>
                        Las contraseñas coinciden
                      </li>
                    </ul>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 animate-shake">
                      <p className="text-red-400 text-[10px] font-black text-center">⚠️ {error}</p>
                    </div>
                  )}

                  {/* Botones */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setPaso(1)}
                      disabled={cargando}
                      className="flex-1 py-3 rounded-xl border border-white/20 text-white/60 font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      Volver
                    </button>
                    <button
                      type="submit"
                      disabled={cargando || !nuevaContrasena || !confirmarContrasena}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-black text-xs sm:text-sm uppercase tracking-widest shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {cargando ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        'Guardar ✓'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/20 text-[8px] font-black uppercase tracking-[0.5em]">
            Parroquia San José • Diriamba
          </p>
        </div>
      </motion.div>

      {/* ── ESTILOS ── */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        .animate-twinkle {
          animation: twinkle ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default BienvenidaCatequista;