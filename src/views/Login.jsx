import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const Login = () => {
  const { iniciarSesion } = useGame();
  
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
    } catch (err) {
      console.error('Error de login:', err);
      let mensaje = 'Credenciales incorrectas. Por favor, verifica tus datos.';
      
      // Manejar errores específicos de Firebase
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
          mensaje = 'Demasiados intentos fallidos. Espera un momento e intenta de nuevo.';
          break;
        default:
          mensaje = err.message || 'Error al iniciar sesión. Contacta a tu catequista.';
      }
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c1a2b] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px]" />

      <div className="glass-card w-full max-w-[420px] p-8 rounded-[3rem] border border-white/10 shadow-2xl z-10">
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="Logo" className="w-20 h-20 rounded-full mx-auto border-2 border-yellow-400 mb-4 shadow-lg shadow-yellow-400/20" />
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            SAN JOSÉ <span className="text-yellow-400">KIDS</span>
          </h1>
          <p className="text-blue-300 text-[10px] font-bold tracking-[0.3em] uppercase opacity-70">
            Equipo de catequesis • Diriamba
          </p>
        </div>

        {/* Mensaje informativo */}
        <div className="mb-6 p-3 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-center">
          <p className="text-yellow-300 text-xs font-bold">
            🔑 Ingresa con las credenciales que te proporcionó tu catequista
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] text-blue-300 font-black uppercase ml-2 mb-1">
              Correo Electrónico
            </label>
            <input 
              type="email" 
              placeholder="correo@ejemplo.com" 
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white font-bold outline-none focus:border-blue-400 transition-all"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              disabled={cargando}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-[10px] text-blue-300 font-black uppercase ml-2 mb-1">
              Contraseña
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white font-bold outline-none focus:border-blue-400 transition-all"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              disabled={cargando}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30">
              <p className="text-red-400 text-[10px] font-black text-center uppercase tracking-tighter">
                ⚠️ {error}
              </p>
            </div>
          )}

          <button 
            type="submit"
            disabled={cargando}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando ? 'Entrando...' : '¡Entrar a Jugar!'}
          </button>
        </form>

        {/* Mensaje para catequistas */}
        <div className="mt-6 text-center border-t border-white/10 pt-6">
          <p className="text-white/30 text-[9px] uppercase tracking-widest">
            ¿Eres catequista?
          </p>
          <a 
            href="/catequista" 
            className="text-blue-300 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
          >
            Accede al panel de catequistas →
          </a>
        </div>
      </div>
      
      <p className="absolute bottom-4 text-white/20 text-[8px] font-black uppercase tracking-[0.5em]">
        Parroquia San José • Diriamba
      </p>
    </div>
  );
};

export default Login;