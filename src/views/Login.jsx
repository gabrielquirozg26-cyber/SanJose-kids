import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Login = () => {
  const { iniciarSesion } = useAuth();
  const { showToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

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
      showToast('¡Bienvenido a San JoseKids! 🌟', 'success');
    } catch (err) {
      console.error('Error de login:', err);
      let mensaje = 'Credenciales incorrectas. Verifica tus datos.';
      switch (err.code) {
        case 'auth/user-not-found':
          mensaje = 'No existe una cuenta con este correo. Contacta a tu catequista.';
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
          mensaje = err.message || 'Error al iniciar sesión. Contacta a tu catequista.';
      }
      setError(mensaje);
      showToast(mensaje, 'error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo con imagen de iglesia */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/fondo-iglesia.jpeg')", opacity: 0.5 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/70 via-purple-900/60 to-slate-900/80" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-400/15 rounded-full blur-[120px]" />
      </div>

      {/* Estrellas decorativas */}
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

      <div className="relative w-full max-w-md">
        {/* Efecto de luz exterior */}
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/20 via-amber-400/20 to-yellow-400/20 rounded-3xl blur-xl" />

        <div className="relative glass-card rounded-3xl p-8 border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="absolute -inset-1 bg-yellow-400/20 rounded-full blur-lg animate-pulse" />
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-yellow-400/60 shadow-lg shadow-yellow-400/20 mx-auto">
                <img src="/logo.jpg" alt="San JoseKids" className="w-full h-full object-cover" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white mt-4 tracking-tighter">
              SAN JOSÉ <span className="text-yellow-400">KIDS</span>
            </h1>
            <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mt-1">
              Iglesia San José · Diriamba
            </p>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20">
              <span className="text-yellow-400 text-[10px]">✝️</span>
              <span className="text-yellow-400/70 text-[9px] font-black uppercase tracking-wider">Caminando en la fe</span>
            </div>
          </div>

          {/* Mensaje de bienvenida */}
          <div className="mb-6 text-center">
            <p className="text-white/60 text-sm font-medium">
              ¡Bienvenido a tu aventura de fe! 🌟
            </p>
            <p className="text-white/30 text-xs mt-1">
              Ingresa con las credenciales de tu catequesis
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] text-yellow-400 font-black uppercase tracking-widest ml-2 mb-1">
                ✉️ Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="tu-correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={cargando}
                className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white font-medium outline-none transition-all placeholder:text-white/20 focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.1)] disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-[10px] text-yellow-400 font-black uppercase tracking-widest ml-2 mb-1">
                🔑 Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={cargando}
                className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white font-medium outline-none transition-all placeholder:text-white/20 focus:border-yellow-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.1)] disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 animate-shake">
                <p className="text-red-400 text-[10px] font-black text-center">
                  ⚠️ {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-400 text-blue-900 font-black text-lg uppercase tracking-widest shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {cargando ? (
                <>
                  <div className="w-5 h-5 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                '✨ Comenzar Aventura'
              )}
            </button>
          </form>

          {/* Enlace a catequistas */}
          <div className="mt-6 text-center border-t border-white/10 pt-6">
            <p className="text-white/20 text-[9px] uppercase tracking-widest">
              ¿Eres catequista?
            </p>
            <a
              href="/catequista"
              className="inline-flex items-center gap-2 text-blue-300 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors group"
            >
              <span>Accede al panel</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>

          {/* Versículo inspirador */}
          <div className="mt-4 text-center">
            <p className="text-white/10 text-[8px] italic tracking-wider">
              "Dejen que los niños vengan a mí" — Mateo 19:14
            </p>
          </div>
        </div>
      </div>

      {/* Estilos para animaciones */}
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

export default Login;