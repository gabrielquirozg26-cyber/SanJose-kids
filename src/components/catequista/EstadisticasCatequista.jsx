// src/components/catequista/EstadisticasCatequista.jsx
import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { motion } from 'framer-motion';

const EstadisticasCatequista = () => {
  const { grupo, obtenerEstudiantesGrupo } = useGame();
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const data = await obtenerEstudiantesGrupo(grupo);
      setEstudiantes(data);
      setCargando(false);
    };
    cargar();
  }, [grupo]);

  if (cargando) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const total = estudiantes.length;
  const promedioNivel = total > 0 ? (estudiantes.reduce((s, e) => s + (e.nivelActual || 0), 0) / total).toFixed(1) : 0;
  const promedioRacha = total > 0 ? (estudiantes.reduce((s, e) => s + (e.racha || 0), 0) / total).toFixed(1) : 0;
  const totalMonedas = estudiantes.reduce((s, e) => s + (e.monedas || 0), 0);

  const hoy = new Date().toISOString().split('T')[0];
  const jugaronHoy = estudiantes.filter(e => e.jugóHoy === hoy).length;
  const porcentajeJugaron = total > 0 ? Math.round((jugaronHoy / total) * 100) : 0;

  // Rankings
  const top3Nivel = [...estudiantes].sort((a, b) => (b.nivelActual || 0) - (a.nivelActual || 0)).slice(0, 3);
  const top3Monedas = [...estudiantes].sort((a, b) => (b.monedas || 0) - (a.monedas || 0)).slice(0, 3);
  const top3Racha = [...estudiantes].sort((a, b) => (b.racha || 0) - (a.racha || 0)).slice(0, 3);
  const top3Santos = [...estudiantes].sort((a, b) => (b.coleccion?.length || 0) - (a.coleccion?.length || 0)).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <h2 className="text-2xl font-black text-white tracking-tighter">📊 Estadísticas del Grupo</h2>
        <p className="text-white/40 text-sm">{grupo}</p>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card rounded-2xl p-5 text-center border border-white/10 hover:border-yellow-400/30 transition-all"
        >
          <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">👥 Alumnos</p>
          <p className="text-3xl font-black text-white">{total}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5 text-center border border-yellow-400/20 hover:border-yellow-400/40 transition-all"
        >
          <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">📊 Nivel promedio</p>
          <p className="text-3xl font-black text-yellow-400">{promedioNivel}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl p-5 text-center border border-orange-400/20 hover:border-orange-400/40 transition-all"
        >
          <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">🔥 Racha promedio</p>
          <p className="text-3xl font-black text-orange-400">{promedioRacha}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-5 text-center border border-green-400/20 hover:border-green-400/40 transition-all"
        >
          <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">🪙 Monedas totales</p>
          <p className="text-3xl font-black text-green-400">{totalMonedas.toLocaleString()}</p>
        </motion.div>
      </div>

      {/* Gráfico de actividad (dona) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card rounded-2xl p-5 border border-white/10"
      >
        <p className="text-white/40 text-[9px] font-black uppercase tracking-widest text-center mb-3">
          📊 Actividad de hoy ({hoy})
        </p>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#ffffff20" strokeWidth="20" />
              {porcentajeJugaron > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="20"
                  strokeDasharray={`${porcentajeJugaron * 2.51} 251.2`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              )}
              {100 - porcentajeJugaron > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="20"
                  strokeDasharray={`${(100 - porcentajeJugaron) * 2.51} 251.2`}
                  strokeDashoffset={`${-porcentajeJugaron * 2.51}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              )}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black text-white">{total}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-white/70 text-sm">Jugaron hoy</span>
              <span className="text-green-400 font-black ml-auto">{jugaronHoy}</span>
              <span className="text-white/30 text-xs">({porcentajeJugaron}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-white/70 text-sm">No jugaron</span>
              <span className="text-red-400 font-black ml-auto">{total - jugaronHoy}</span>
              <span className="text-white/30 text-xs">({100 - porcentajeJugaron}%)</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Rankings Top 3 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-4 border border-white/10 hover:border-yellow-400/30 transition-all"
        >
          <p className="text-white/40 text-[9px] font-black uppercase tracking-widest text-center">🏆 Top Nivel</p>
          {top3Nivel.map((e, i) => (
            <div key={e.uid} className="flex items-center gap-2 mt-1 text-sm">
              <span className="text-white/30">#{i + 1}</span>
              <span className="font-black text-white truncate flex-1">{e.nombre}</span>
              <span className="text-yellow-400">Nv.{e.nivelActual}</span>
            </div>
          ))}
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card rounded-2xl p-4 border border-white/10 hover:border-yellow-400/30 transition-all"
        >
          <p className="text-white/40 text-[9px] font-black uppercase tracking-widest text-center">🪙 Top Monedas</p>
          {top3Monedas.map((e, i) => (
            <div key={e.uid} className="flex items-center gap-2 mt-1 text-sm">
              <span className="text-white/30">#{i + 1}</span>
              <span className="font-black text-white truncate flex-1">{e.nombre}</span>
              <span className="text-yellow-400">{e.monedas}</span>
            </div>
          ))}
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-4 border border-white/10 hover:border-yellow-400/30 transition-all"
        >
          <p className="text-white/40 text-[9px] font-black uppercase tracking-widest text-center">🔥 Top Racha</p>
          {top3Racha.map((e, i) => (
            <div key={e.uid} className="flex items-center gap-2 mt-1 text-sm">
              <span className="text-white/30">#{i + 1}</span>
              <span className="font-black text-white truncate flex-1">{e.nombre}</span>
              <span className="text-orange-400">{e.racha}d</span>
            </div>
          ))}
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-card rounded-2xl p-4 border border-white/10 hover:border-yellow-400/30 transition-all"
        >
          <p className="text-white/40 text-[9px] font-black uppercase tracking-widest text-center">📖 Top Santos</p>
          {top3Santos.map((e, i) => (
            <div key={e.uid} className="flex items-center gap-2 mt-1 text-sm">
              <span className="text-white/30">#{i + 1}</span>
              <span className="font-black text-white truncate flex-1">{e.nombre}</span>
              <span className="text-purple-400">{e.coleccion?.length || 0}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Gráfico de barras (niveles del grupo) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-2xl p-5 border border-white/10"
      >
        <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-3">
          📈 Distribución de niveles
        </p>
        <div className="flex items-end gap-1 h-32">
          {Array.from({ length: 17 }, (_, i) => i + 1).map(n => {
            const count = estudiantes.filter(e => e.nivelActual === n).length;
            const maxCount = Math.max(1, ...estudiantes.map(e => e.nivelActual || 0));
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return (
              <div key={n} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-yellow-400/30 rounded-t transition-all duration-1000 hover:bg-yellow-400/50"
                  style={{ height: `${Math.max(height, 2)}px` }}
                />
                <span className="text-[6px] text-white/30 mt-0.5">{n}</span>
              </div>
            );
          })}
        </div>
        <p className="text-center text-white/30 text-[8px] mt-2">Niveles del grupo</p>
      </motion.div>
    </div>
  );
};

export default EstadisticasCatequista;