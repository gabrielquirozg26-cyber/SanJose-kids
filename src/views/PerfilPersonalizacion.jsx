import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const RAREZA_CLASES = {
  comun: 'border-slate-500/50 bg-slate-500/10 text-slate-300',
  raro: 'border-blue-500/50 bg-blue-500/10 text-blue-300',
  epico: 'border-purple-500/50 bg-purple-500/10 text-purple-300',
  legendario: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300',
  mitico: 'border-orange-500/50 bg-orange-500/10 text-orange-300',
  divino: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300',
};

const PerfilPersonalizacion = ({ onVolver }) => {
  const {
    titulosDesbloqueados,
    tituloEquipado,
    equiparTitulo,
    marcosDesbloqueados,
    marcoEquipado,
    equiparMarco,
    titulosPorNivel,
    titulosLegendarios,
  } = useGame();

  const [seleccionTitulo, setSeleccionTitulo] = useState(tituloEquipado);
  const [seleccionMarco, setSeleccionMarco] = useState(marcoEquipado);
  const [guardando, setGuardando] = useState(false);

  // Combinar títulos por nivel y legendarios en una sola lista (solo los desbloqueados)
  const todosTitulosDesbloqueados = [
    ...(titulosDesbloqueados || []),
  ];

  // Para ordenarlos (primero por rareza descendente, luego por nombre)
  const titulosOrdenados = [...todosTitulosDesbloqueados].sort((a, b) => {
    const rarezaOrder = { divino: 6, mitico: 5, legendario: 4, epico: 3, raro: 2, comun: 1 };
    return (rarezaOrder[b.rareza] || 0) - (rarezaOrder[a.rareza] || 0);
  });

  const handleGuardar = async () => {
    setGuardando(true);
    if (seleccionTitulo !== tituloEquipado) await equiparTitulo(seleccionTitulo);
    if (seleccionMarco !== marcoEquipado) await equiparMarco(seleccionMarco);
    setGuardando(false);
    onVolver();
  };

  // Marcos (ejemplo, puedes expandir)
  const marcosUsuario = (marcosDesbloqueados || []).map(id => {
    if (id === 'marco_vitral_azul') return { id, nombre: 'Marco Vitral Azul', rareza: 'raro' };
    if (id === 'marco_vitral_dorado') return { id, nombre: 'Marco Vitral Dorado', rareza: 'epico' };
    return { id, nombre: id, rareza: 'comun' };
  });

  return (
    <div className="py-6 animate-slide-up">
      <button onClick={onVolver} className="mb-4 text-white/40 hover:text-white/80 flex items-center gap-2 text-sm font-black uppercase tracking-wider">
        ← Volver al perfil
      </button>
      <div className="glass-card rounded-3xl p-6 space-y-6">
        <h2 className="text-2xl font-black text-white text-center bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
          Personalización
        </h2>
        
        {/* Títulos */}
        <div>
          <h3 className="text-white font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>👑</span> Títulos equipables
          </h3>
          {titulosOrdenados.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-4">Aún no has desbloqueado títulos. Completa niveles o compra en la tienda.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {titulosOrdenados.map(titulo => {
                const isSelected = seleccionTitulo === titulo.id;
                const rarezaClass = RAREZA_CLASES[titulo.rareza] || RAREZA_CLASES.comun;
                const esSupremo = titulo.id === 'gran_guardian_supremo';
                return (
                  <div
                    key={titulo.id}
                    onClick={() => setSeleccionTitulo(titulo.id)}
                    className={`glass-card p-3 rounded-2xl border cursor-pointer transition-all ${
                      isSelected ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-[1.02]' : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-black text-sm ${esSupremo ? 'text-yellow-300' : 'text-white'}`}>
                          {esSupremo && <span className="mr-1 animate-pulse">✨</span>}
                          {titulo.nombre}
                          {esSupremo && <span className="ml-1 animate-pulse">✨</span>}
                        </p>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${rarezaClass}`}>
                          {titulo.rareza}
                        </span>
                      </div>
                      {isSelected && <span className="text-yellow-400 text-xl">✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Marcos */}
        {marcosUsuario.length > 0 && (
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>🖼️</span> Marcos de perfil
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {marcosUsuario.map(marco => (
                <div
                  key={marco.id}
                  onClick={() => setSeleccionMarco(marco.id)}
                  className={`glass-card p-3 rounded-2xl border cursor-pointer transition-all ${
                    seleccionMarco === marco.id ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-[1.02]' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-black text-white text-sm">{marco.nombre}</p>
                    {seleccionMarco === marco.id && <span className="text-yellow-400 text-xl">✓</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleGuardar} disabled={guardando} className="btn-primary w-full py-3">
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
};

export default PerfilPersonalizacion;