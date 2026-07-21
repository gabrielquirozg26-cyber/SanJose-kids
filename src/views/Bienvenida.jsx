import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { updatePassword } from 'firebase/auth';
import { auth } from '../firebase';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

const Bienvenida = ({ onCompletado }) => {
  const { nombre, userDoc, cerrarSesion } = useGame();
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [paso, setPaso] = useState(1); // 1: Bienvenida, 2: Cambiar contraseña
  const [mostrarConfeti, setMostrarConfeti] = useState(false);

  const avatar = userDoc?.avatar || '😇';
  const esImagen = avatar?.startsWith('data:image') || avatar?.startsWith('http') || avatar?.startsWith('/images/');

  // Confeti al cargar
  useEffect(() => {
    if (!mostrarConfeti) {
      setMostrarConfeti(true);
      // Confeti inicial
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.3 },
        colors: ['#facc15', '#ffffff', '#3b82f6', '#10b981', '#a855f7']
      });
      // Segundo burst después de 500ms
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#facc15', '#ff8c00', '#ffdd00']
        });
      }, 500);
    }
  }, []);

  const handleCambiarContrasena = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
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
        particleCount: 250,
        spread: 150,
        origin: { y: 0.3 },
        colors: ['#facc15', '#ffffff', '#10b981', '#3b82f6']
      });
      
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#facc15', '#ff8c00']
        });
      }, 300);

      // Marcar que ya cambió la contraseña en Firestore
      const { db } = await import('../firebase');
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'usuarios', user.uid), {
        contrasenaCambiada: true
      });

      setCargando(false);
      // Esperar un momento para que vea el confeti
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
        // Cerrar sesión para que re-ingrese
        setTimeout(() => cerrarSesion(), 2000);
      }
      setError(mensaje);
      setCargando(false);
    }
  };

  // Animaciones
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.15 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 text-white font-sans flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-yellow-400/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-yellow-400/10 rounded-full blur-[60px] animate-pulse" />
      </div>

      {/* Estrellas de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white/20 rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative w-full max-w-lg"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 rounded-3xl blur-xl opacity-30 animate-pulse" />
        
        <div className="relative glass-card rounded-3xl p-8 border border-white/20 bg-black/60 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Decoración interior */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-400/10 rounded-full blur-[80px]" />

          <AnimatePresence mode="wait">
            {/* PASO 1: BIENVENIDA */}
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
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-yellow-400/60 shadow-[0_0_60px_rgba(250,204,21,0.3)] bg-gradient-to-br from-yellow-400/20 to-amber-400/20 p-1">
                    <img src="/logo.jpg" alt="San JoseKids" className="w-full h-full object-cover rounded-full" />
                  </div>
                </motion.div>

                {/* Título */}
                <motion.div variants={fadeInUp} className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/40">
                    <span className="text-yellow-400 text-sm">✨</span>
                    <span className="text-yellow-400 font-black text-xs uppercase tracking-wider">¡Bienvenido!</span>
                  </div>
                  <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
                    San JoseKids
                  </h1>
                  <p className="text-white/70 text-lg font-bold">{nombre || 'Catequista'}</p>
                </motion.div>

                {/* Mensaje de bienvenida */}
                <motion.div variants={fadeInUp} className="space-y-3">
                  <p className="text-white/80 text-sm leading-relaxed">
                    ¡Qué alegría tenerte aquí! 🌟
                  </p>
                  <p className="text-white/50 text-sm">
                    Esta es tu primera vez en <span className="text-yellow-400 font-bold">San JoseKids</span>.
                    Para mantener tu cuenta segura, debes cambiar tu contraseña.
                  </p>
                </motion.div>

                {/* Avatar */}
                <motion.div
                  variants={fadeInUp}
                  className="flex justify-center"
                >
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-400 blur opacity-70 animate-pulse" />
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white/30 bg-white/10 shadow-lg">
                      {esImagen ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl flex items-center justify-center h-full">{avatar}</span>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Botón continuar */}
                <motion.button
                  variants={fadeInUp}
                  onClick={() => setPaso(2)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 text-blue-900 font-black text-lg uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Cambiar mi contraseña 🔐
                </motion.button>

                <motion.p variants={fadeInUp} className="text-white/20 text-[10px]">
                  Tu seguridad es importante para nosotros
                </motion.p>
              </motion.div>
            )}

            {/* PASO 2: CAMBIAR CONTRASEÑA */}
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
                    <span className="text-5xl">🔐</span>
                  </div>
                  <h2 className="text-2xl font-black text-white">Cambia tu contraseña</h2>
                  <p className="text-white/50 text-sm">
                    Crea una contraseña segura que solo tú conozcas
                  </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleCambiarContrasena} className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-yellow-400 font-black uppercase tracking-widest ml-2 mb-1">
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">🔑</span>
                      <input
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        value={nuevaContrasena}
                        onChange={(e) => setNuevaContrasena(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 p-3 pl-10 rounded-xl text-white font-bold outline-none focus:border-yellow-400 transition-all placeholder:text-white/20"
                        disabled={cargando}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-yellow-400 font-black uppercase tracking-widest ml-2 mb-1">
                      Confirmar contraseña
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">✓</span>
                      <input
                        type="password"
                        placeholder="Vuelve a escribir la contraseña"
                        value={confirmarContrasena}
                        onChange={(e) => setConfirmarContrasena(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 p-3 pl-10 rounded-xl text-white font-bold outline-none focus:border-yellow-400 transition-all placeholder:text-white/20"
                        disabled={cargando}
                      />
                    </div>
                  </div>

                  {/* Reglas de contraseña */}
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-2">Requisitos:</p>
                    <ul className="space-y-1 text-[11px] text-white/50">
                      <li className={`flex items-center gap-2 ${nuevaContrasena.length >= 8 ? 'text-green-400' : ''}`}>
                        <span>{nuevaContrasena.length >= 8 ? '✅' : '⬜'}</span>
                        Al menos 8 caracteres
                      </li>
                      <li className={`flex items-center gap-2 ${nuevaContrasena !== 'SanJose2024!' && nuevaContrasena.length > 0 ? 'text-green-400' : ''}`}>
                        <span>{nuevaContrasena !== 'SanJose2024!' && nuevaContrasena.length > 0 ? '✅' : '⬜'}</span>
                        Diferente a la contraseña genérica
                      </li>
                    </ul>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30">
                      <p className="text-red-400 text-[10px] font-black text-center">⚠️ {error}</p>
                    </div>
                  )}

                  {/* Botones */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setPaso(1)}
                      disabled={cargando}
                      className="flex-1 py-3 rounded-xl border border-white/20 text-white/60 font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      Volver
                    </button>
                    <button
                      type="submit"
                      disabled={cargando || !nuevaContrasena || !confirmarContrasena}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 text-blue-900 font-black text-sm uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {cargando ? (
                        <>
                          <span className="w-4 h-4 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        'Guardar contraseña ✓'
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

      {/* Estilos para animación de estrellas */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        .animate-twinkle {
          animation: twinkle ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Bienvenida;