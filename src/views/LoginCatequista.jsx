import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const LoginCatequista = () => {
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
        setError('Ingresa tu correo y contraseña');
        setCargando(false);
        return;
      }
      await iniciarSesion(email, password);
    } catch (err) {
      console.error('Error de login catequista:', err);
      let mensaje = 'Credenciales incorrectas.';
      switch (err.code) {
        case 'auth/user-not-found':
          mensaje = 'No existe una cuenta con este correo.';
          break;
        case 'auth/wrong-password':
          mensaje = 'Contraseña incorrecta.';
          break;
        default:
          mensaje = err.message || 'Error al iniciar sesión.';
      }
      setError(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080f1a] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-blue-700/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px]" />

      <div className="glass-card w-full max-w-[420px] p-8 rounded-[3rem] border border-white/10 shadow-2xl z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-400 mx-auto mb-4 flex items-center justify-center text-3xl shadow-lg shadow-blue-400/20">
            ✝️
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
            Panel <span className="text-blue-400">Catequista</span>
          </h1>
          <p className="text-white/30 text-[10px] font-bold tracking-[0.3em] uppercase mt-1">
            Parroquia San José · Diriamba
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
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={cargando}
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white font-bold outline-none focus:border-blue-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] text-blue-300 font-black uppercase ml-2 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={cargando}
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white font-bold outline-none focus:border-blue-400 transition-all"
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
            className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando ? 'Entrando…' : 'Acceder al panel'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-white/10 pt-6">
          <a href="/" className="text-white/30 text-[9px] font-black uppercase tracking-widest hover:text-white/60 transition-colors">
            ← Acceso de estudiantes
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginCatequista;