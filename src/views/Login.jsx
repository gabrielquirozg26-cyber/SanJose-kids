import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const Login = () => {
  const { registrarNiño, iniciarSesion } = useGame();
  
  // Estados del formulario
  const [esRegistro, setEsRegistro] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [grupo, setGrupo] = useState('San Diego de Alcala');
  const [error, setError] = useState('');

  // Lista oficial de grupos de Diriamba
  const gruposDiriamba = [
    "San Diego de Alcala",
    "San Francisco de Asis",
    "Santa Clara de Asis",
    "San Antonio de padua",
    "Santa Rosa viterbo"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (esRegistro) {
        if (!nombre || !email || !password) return setError("¡Completa todos los campos!");
        await registrarNiño(email, password, nombre, grupo);
      } else {
        if (!email || !password) return setError("Escribe tu correo y contraseña");
        await iniciarSesion(email, password);
      }
    } catch (err) {
      setError("Error: Revisa tus datos o tu conexión 💡");
    }
  };

  return (
    <div className="min-h-screen bg-[#0c1a2b] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Adornos visuales de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px]"></div>

      <div className="glass-card w-full max-w-[420px] p-8 rounded-[3rem] border border-white/10 shadow-2xl z-10">
        {/* Logo e Identidad */}
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="Logo" className="w-20 h-20 rounded-full mx-auto border-2 border-yellow-400 mb-4 shadow-lg shadow-yellow-400/20" />
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
            SAN JOSÉ <span className="text-yellow-400">KIDS</span>
          </h1>
          <p className="text-blue-300 text-[10px] font-bold tracking-[0.3em] uppercase opacity-70">Equipo de catequesis • Diriamba</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {esRegistro && (
            <div className="animate-slide-down">
              <label className="block text-[10px] text-blue-300 font-black uppercase ml-2 mb-1">Nombre del Niño</label>
              <input 
                type="text" placeholder="EJ: JUAN PÉREZ" 
                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white font-bold outline-none focus:border-blue-400 transition-all uppercase"
                value={nombre} onChange={(e) => setNombre(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] text-blue-300 font-black uppercase ml-2 mb-1">Correo Electrónico</label>
            <input 
              type="email" placeholder="correo@ejemplo.com" 
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white font-bold outline-none focus:border-blue-400 transition-all"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] text-blue-300 font-black uppercase ml-2 mb-1">Contraseña</label>
            <input 
              type="password" placeholder="••••••••" 
              className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white font-bold outline-none focus:border-blue-400 transition-all"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {esRegistro && (
            <div className="animate-slide-down">
              <label className="block text-[10px] text-yellow-400 font-black uppercase ml-2 mb-1">Selecciona tu Grupo</label>
              <select 
                className="w-full bg-[#1a2a3a] border border-white/10 p-3 rounded-xl text-white font-bold outline-none focus:border-yellow-400 transition-all appearance-none"
                value={grupo} onChange={(e) => setGrupo(e.target.value)}
              >
                {gruposDiriamba.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="text-red-400 text-[10px] font-black text-center uppercase tracking-tighter italic">⚠️ {error}</p>}

          <button 
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest text-sm"
          >
            {esRegistro ? '¡Iniciar mi Misión!' : '¡Entrar a Jugar!'}
          </button>
        </form>

        {/* Switch entre Registro e Inicio */}
        <div className="mt-6 text-center">
          <button 
            onClick={() => setEsRegistro(!esRegistro)}
            className="text-blue-300 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
          >
            {esRegistro ? '¿Ya tienes cuenta? Inicia Sesión' : '¿Eres nuevo? Regístrate aquí'}
          </button>
        </div>
      </div>
      
      <p className="absolute bottom-4 text-white/20 text-[8px] font-black uppercase tracking-[0.5em]">Parroquia San José • Diriamba</p>
    </div>
  );
};

export default Login;