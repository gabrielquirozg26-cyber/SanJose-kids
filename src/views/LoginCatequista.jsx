// src/views/LoginCatequista.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { motion } from 'framer-motion';

const LoginCatequista = () => {
  const { iniciarSesion } = useAuth();
  const { showToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // ── ANIMACIONES ──
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };
  const stagger = {
    visible: { transition: { staggerChildren: 0.15 } }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      if (!email || !password) {
        setError('Por favor, ingresa tu correo y contraseña');
        setCargando(false);
        return;
      }
      await iniciarSesion(email, password);
      showToast('👨‍🏫 ¡Bienvenido al Panel Catequista!', 'success');
    } catch (err) {
      console.error('Error de login:', err);
      let mensaje = 'Credenciales incorrectas. Verifica tus datos.';
      switch (err.code) {
        case 'auth/user-not-found':
          mensaje = 'No existe una cuenta con este correo. Contacta al coordinador.';
          break;
        case 'auth/wrong-password':
          mensaje = 'Contraseña incorrecta. Intenta de nuevo.';
          break;
        case 'auth/invalid-email':
          mensaje = 'El formato del correo no es válido.';
          break;
        case 'auth/too-many-requests':
          mensaje = 'Demasiados intentos fallidos. Espera un momento.';
          break;
        default:
          mensaje = err.message || 'Error al iniciar sesión. Contacta al coordinador.';
      }
      setError(mensaje);
      showToast(mensaje, 'error');
    } finally {
      setCargando(false);
    }
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
        {[...Array(30)].map((_, i) => (
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

        <div className="relative glass-card rounded-3xl p-8 border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
          {/* ── LOGO Y TÍTULO ── */}
          <motion.div variants={fadeInUp} className="text-center mb-8">
            <div className="relative inline-block">
              <div className="absolute -inset-1 bg-blue-400/20 rounded-full blur-lg animate-pulse" />
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-blue-400/60 shadow-lg shadow-blue-400/20 mx-auto">
                <img src="/logo.jpg" alt="San JoseKids" className="w-full h-full object-cover" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white mt-4 tracking-tighter">
              SAN JOSÉ <span className="text-blue-400">KIDS</span>
            </h1>
            <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mt-1">
              Iglesia San José · Diriamba
            </p>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-400/10 border border-blue-400/20">
              <span className="text-blue-400 text-[10px]">👨‍🏫</span>
              <span className="text-blue-400/70 text-[9px] font-black uppercase tracking-wider">
                Panel Catequista
              </span>
            </div>
          </motion.div>

          {/* ── MENSAJE DE BIENVENIDA ── */}
          <motion.div variants={fadeInUp} className="mb-6 text-center">
            <p className="text-white/60 text-sm font-medium">
              👨‍🏫 Accede al panel de catequistas
            </p>
            <p className="text-white/30 text-xs mt-1">
              Gestiona tus alumnos, evaluaciones y estadísticas
            </p>
          </motion.div>

          {/* ── FORMULARIO ── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div variants={fadeInUp}>
              <label className="block text-[10px] text-blue-400 font-black uppercase tracking-widest ml-2 mb-1">
                ✉️ Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="tu-correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={cargando}
                className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white font-medium outline-none transition-all placeholder:text-white/20 focus:border-blue-400 focus:shadow-[0_0_20px_rgba(59,130,246,0.1)] disabled:opacity-50"
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <label className="block text-[10px] text-blue-400 font-black uppercase tracking-widest ml-2 mb-1">
                🔑 Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={cargando}
                className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white font-medium outline-none transition-all placeholder:text-white/20 focus:border-blue-400 focus:shadow-[0_0_20px_rgba(59,130,246,0.1)] disabled:opacity-50"
              />
            </motion.div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-xl bg-red-500/20 border border-red-500/30"
              >
                <p className="text-red-400 text-[10px] font-black text-center">
                  ⚠️ {error}
                </p>
              </motion.div>
            )}

            <motion.button
              variants={fadeInUp}
              type="submit"
              disabled={cargando}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-black text-lg uppercase tracking-widest shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {cargando ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                '👨‍🏫 Acceder al Panel'
              )}
            </motion.button>
          </form>

          {/* ── ENLACE A ESTUDIANTES ── */}
          <motion.div variants={fadeInUp} className="mt-6 text-center border-t border-white/10 pt-6">
            <p className="text-white/20 text-[9px] uppercase tracking-widest">
              ¿Eres estudiante?
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 text-blue-300 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span>Accede como estudiante</span>
            </a>
          </motion.div>

          {/* ── VERSÍCULO ── */}
          <motion.div variants={fadeInUp} className="mt-4 text-center">
            <p className="text-white/10 text-[8px] italic tracking-wider">
              "Dejen que los niños vengan a mí" — Mateo 19:14
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* ── ESTILOS ── */}
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

export default LoginCatequista;