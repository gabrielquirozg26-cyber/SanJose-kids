import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const gruposDiriamba = [
  "San Diego de Alcala",
  "San Francisco de Asis",
  "Santa Clara de Asis",
  "San Antonio de padua",
  "Santa Rosa viterbo",
];

const LoginCatequista = () => {
  const { iniciarSesion, registrarCatequista } = useGame();

  const [esRegistro, setEsRegistro] = useState(false);
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [nombre, setNombre]         = useState('');
  const [grupo, setGrupo]           = useState(gruposDiriamba[0]);
  const [error, setError]           = useState('');
  const [cargando, setCargando]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      if (esRegistro) {
        if (!nombre || !email || !password) {
          setError('Completa todos los campos');
          return;
        }
        await registrarCatequista(email, password, nombre, grupo);
      } else {
        if (!email || !password) {
          setError('Escribe tu correo y contraseña');
          return;
        }
        await iniciarSesion(email, password);
      }
    } catch {
      setError('Credenciales incorrectas o sin conexión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080f1a] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Fondos */}
      <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-blue-700/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px]" />

      <div className="glass-card w-full max-w-[420px] p-8 rounded-[3rem] border border-white/10 shadow-2xl z-10">

        {/* Cabecera */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-400 mx-auto mb-4
            flex items-center justify-center text-3xl shadow-lg shadow-blue-400/20">
            ✝️
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
            Panel <span className="text-blue-400">Catequista</span>
          </h1>
          <p className="text-white/30 text-[10px] font-bold tracking-[0.3em] uppercase mt-1">
            Parroquia San José · Diriamba
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {esRegistro && (
            <div>
              <label className="block text-[10px] text-blue-300 font-black uppercase ml-2 mb-1">
                Nombre del Catequista
              </label>
              <input
                type="text"
                placeholder="Ej: MARÍA LÓPEZ"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white font-bold
                  outline-none focus:border-blue-400 transition-all uppercase"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] text-blue-300 font-black uppercase ml-2 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white font-bold
                outline-none focus:border-blue-400 transition-all"
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
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white font-bold
                outline-none focus:border-blue-400 transition-all"
            />
          </div>

          {esRegistro && (
            <div>
              <label className="block text-[10px] text-blue-300 font-black uppercase ml-2 mb-1">
                Grupo a cargo
              </label>
              <select
                value={grupo}
                onChange={e => setGrupo(e.target.value)}
                className="w-full bg-[#1a2a3a] border border-white/10 p-3 rounded-xl text-white font-bold
                  outline-none focus:border-blue-400 transition-all appearance-none"
              >
                {gruposDiriamba.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-[10px] font-black text-center uppercase tracking-tighter italic">
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-4 rounded-2xl
              shadow-xl transition-all active:scale-95 uppercase tracking-widest text-sm
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando ? 'Entrando…' : esRegistro ? 'Crear cuenta' : 'Acceder al panel'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setEsRegistro(!esRegistro); setError(''); }}
            className="text-blue-300 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
          >
            {esRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿Primera vez? Crea tu cuenta'}
          </button>
        </div>

        {/* Link a estudiantes */}
        <div className="mt-4 text-center">
          <a href="/" className="text-white/20 text-[9px] font-black uppercase tracking-widest hover:text-white/40 transition-colors">
            ← Acceso de estudiantes
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginCatequista;
