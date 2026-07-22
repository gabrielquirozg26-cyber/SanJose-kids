// src/components/MisEvaluaciones.jsx
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const MisEvaluaciones = ({ estudianteId: propEstudianteId }) => {
  const { usuarioId, obtenerEvaluaciones } = useGame();
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [catequistasInfo, setCatequistasInfo] = useState({});

  // Usar el prop si existe, sino el usuario actual
  const idParaBuscar = propEstudianteId || usuarioId;

  // ── OBTENER DATOS DEL CATEQUISTA ──────────────────────────────────────
  const obtenerInfoCatequista = async (catequistaId) => {
    if (!catequistaId) return null;
    if (catequistasInfo[catequistaId]) return catequistasInfo[catequistaId];
    
    try {
      const docRef = doc(db, 'usuarios', catequistaId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const info = {
          nombre: data.nombre || 'Catequista',
          avatar: data.avatar || '👨‍🏫',
        };
        setCatequistasInfo(prev => ({ ...prev, [catequistaId]: info }));
        return info;
      }
      return { nombre: 'Catequista', avatar: '👨‍🏫' };
    } catch (error) {
      console.error('Error obteniendo catequista:', error);
      return { nombre: 'Catequista', avatar: '👨‍🏫' };
    }
  };

  useEffect(() => {
    const cargarEvaluaciones = async () => {
      if (!idParaBuscar) {
        setCargando(false);
        return;
      }
      
      setCargando(true);
      try {
        const data = await obtenerEvaluaciones(idParaBuscar);
        setEvaluaciones(data);
        
        // Cargar información de catequistas únicos
        const catequistasIds = [...new Set(data.map(e => e.catequistaId).filter(Boolean))];
        for (const id of catequistasIds) {
          await obtenerInfoCatequista(id);
        }
      } catch (err) {
        console.error('Error cargando evaluaciones:', err);
        setError('No se pudieron cargar tus evaluaciones');
      } finally {
        setCargando(false);
      }
    };

    cargarEvaluaciones();
  }, [idParaBuscar]);

  // ── RENDER ──────────────────────────────────────────────────────────────
  if (cargando) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 text-center border border-red-500/20">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (evaluaciones.length === 0) {
    return (
      <div className="glass-card p-8 text-center border border-white/10">
        <p className="text-5xl mb-3">📋</p>
        <p className="text-white font-black text-lg">Sin evaluaciones</p>
        <p className="text-white/40 text-sm mt-1">
          {propEstudianteId 
            ? 'Este estudiante aún no tiene evaluaciones registradas.'
            : 'Tu catequista aún no ha registrado evaluaciones para ti.'}
        </p>
        <p className="text-white/20 text-xs mt-2">
          Las evaluaciones aparecerán aquí cuando el catequista las registre.
        </p>
      </div>
    );
  }

  // ── FUNCIÓN PARA RENDERIZAR AVATAR ─────────────────────────────────────
  const renderAvatar = (avatar) => {
    const esImagen = avatar?.startsWith('data:image') || avatar?.startsWith('http') || avatar?.startsWith('/images/');
    if (esImagen) {
      return <img src={avatar} alt="Catequista" className="w-full h-full object-cover rounded-full" />;
    }
    return <span className="text-xl">{avatar || '👨‍🏫'}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📋</span>
        <h3 className="text-white font-black text-lg">
          Mis Evaluaciones ({evaluaciones.length})
        </h3>
      </div>

      <AnimatePresence mode="wait">
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {evaluaciones.map((evalucion, index) => {
            const catequistaInfo = catequistasInfo[evalucion.catequistaId] || {
              nombre: evalucion.catequistaNombre || 'Catequista',
              avatar: '👨‍🏫'
            };
            
            return (
              <motion.div
                key={evalucion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card rounded-2xl p-4 border border-white/10 hover:border-yellow-400/30 transition-all"
              >
                {/* ── CABECERA CON CATEQUISTA ── */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar del catequista */}
                    <div className="w-10 h-10 rounded-full bg-white/10 border-2 border-yellow-400/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {renderAvatar(catequistaInfo.avatar)}
                    </div>
                    <div>
                      <p className="text-white font-black text-sm">
                        {catequistaInfo.nombre}
                      </p>
                      <p className="text-white/40 text-[10px] font-black">
                        👨‍🏫 Catequista
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 text-sm">📅</span>
                    <p className="text-white/40 text-xs font-black">
                      {new Date(evalucion.fecha?.toDate()).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* ── RESUMEN DE RESULTADOS ── */}
                <div className="flex gap-3 mb-3">
                  <div className="flex items-center gap-1.5 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                    <span className="text-green-400 text-sm">✅</span>
                    <span className="text-green-400 font-black text-sm">
                      {evalucion.totalSabe || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                    <span className="text-red-400 text-sm">❌</span>
                    <span className="text-red-400 font-black text-sm">
                      {evalucion.totalNoSabe || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    <span className="text-white/40 text-sm">📝</span>
                    <span className="text-white/40 font-black text-sm">
                      {evalucion.oraciones?.length || 0} oraciones
                    </span>
                  </div>
                </div>

                {/* ── LISTA DE ORACIONES ── */}
                <div className="flex flex-wrap gap-1.5">
                  {evalucion.oraciones?.map((o) => (
                    <span
                      key={o.id}
                      className={`text-[8px] font-black px-2 py-0.5 rounded-full ${
                        o.resultado === 'sabe'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {o.resultado === 'sabe' ? '✅' : '❌'} {o.nombre}
                    </span>
                  ))}
                </div>

                {/* ── OBSERVACIONES ── */}
                {evalucion.observaciones && (
                  <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">
                      📝 Observaciones
                    </p>
                    <p className="text-white/60 text-sm italic">
                      {evalucion.observaciones}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default MisEvaluaciones;