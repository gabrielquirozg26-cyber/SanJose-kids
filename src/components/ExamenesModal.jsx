import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import nivelesData from '../data/niveles.json';

const ExamenesModal = ({ isOpen, onClose }) => {
  const { obtenerResultadosExamenes, usuarioId } = useGame();
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (isOpen && usuarioId) {
      setCargando(true);
      obtenerResultadosExamenes(usuarioId).then(setResultados).finally(() => setCargando(false));
    }
  }, [isOpen, usuarioId]);

  if (!isOpen) return null;

  // Mapear lecciones
  const todasLecciones = [];
  nivelesData.unidades.forEach(u => u.lecciones.forEach(l => todasLecciones.push({ id: l.id, nombre: l.nombre })));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card rounded-3xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto border border-yellow-400/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-black text-white">📋 Mis resultados de exámenes</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white text-2xl">&times;</button>
        </div>
        {cargando && <p className="text-white/40">Cargando...</p>}
        {!cargando && resultados.length === 0 && <p className="text-white/40 text-center py-4">Aún no tienes exámenes registrados.</p>}
        <div className="space-y-3">
          {resultados.map(ex => {
            const leccion = todasLecciones.find(l => l.id === ex.lessonId);
            const resultadoColor = { sabe: 'text-green-400', regular: 'text-yellow-400', no_sabe: 'text-red-400' }[ex.resultado];
            const resultadoText = { sabe: '✅ Lo sabe', regular: '🟡 Regular', no_sabe: '❌ No lo sabe' }[ex.resultado];
            return (
              <div key={ex.id} className="border-b border-white/10 pb-2">
                <div className="flex justify-between items-center">
                  <p className="font-black text-white">{leccion?.nombre || ex.lessonId}</p>
                  <span className={`text-xs font-black ${resultadoColor}`}>{resultadoText}</span>
                </div>
                <div className="flex justify-between text-[10px] text-white/40 mt-1">
                  <span>Catequista: {ex.catequistaNombre}</span>
                  <span>{new Date(ex.fecha).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={onClose} className="btn-primary w-full mt-6 py-2">Cerrar</button>
      </div>
    </div>
  );
};

export default ExamenesModal;