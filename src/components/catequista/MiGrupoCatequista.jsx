// src/components/catequista/MiGrupoCatequista.jsx
import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import PerfilPublico from '../../views/PerfilPublico';

const MiGrupoCatequista = () => {
  const { grupo, obtenerEstudiantesGrupo } = useGame();
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [perfilAbierto, setPerfilAbierto] = useState(null);

  const hoy = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const cargar = async () => {
      const data = await obtenerEstudiantesGrupo(grupo);
      setEstudiantes(data);
      setCargando(false);
    };
    cargar();
  }, [grupo]);

  if (perfilAbierto) {
    return <PerfilPublico usuario={perfilAbierto} onVolver={() => setPerfilAbierto(null)} />;
  }

  const filtrados = estudiantes.filter(e =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white tracking-tighter">👥 Mi Grupo</h2>
        <span className="text-white/40 text-sm">{estudiantes.length} alumnos</span>
      </div>

      <input
        type="text"
        placeholder="🔍 Buscar estudiante..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm font-bold outline-none focus:border-yellow-400 transition-all placeholder:text-white/20"
      />

      {cargando ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="glass-card p-8 text-center border border-white/10">
          <p className="text-white/60">No hay estudiantes en este grupo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map((est) => {
            const jugoHoy = est.jugóHoy === hoy;
            return (
              <div
                key={est.uid}
                onClick={() => setPerfilAbierto(est)}
                className="glass-card rounded-2xl p-4 border border-white/10 hover:border-yellow-400/50 hover:scale-[1.02] cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl overflow-hidden">
                    {est.avatar?.startsWith('http') || est.avatar?.startsWith('data:image') ? (
                      <img src={est.avatar} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <span>{est.avatar || '😇'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white truncate">{est.nombre}</p>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-white/40">Nv.{est.nivelActual || 1}</span>
                      <span className="text-white/20">·</span>
                      <span className="text-orange-400">🔥{est.racha || 0}</span>
                      <span className="text-white/20">·</span>
                      {jugoHoy ? (
                        <span className="text-green-400">✅ Hoy</span>
                      ) : (
                        <span className="text-red-400">❌ No hoy</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MiGrupoCatequista;