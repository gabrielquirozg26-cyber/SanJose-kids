import React from 'react';
import { useGame } from '../context/GameContext';

const RAREZA_CLASES = {
  comun: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  raro: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  epico: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
  legendario: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
  divino: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
};

const TitulosModal = ({ isOpen, onClose, onComprar }) => {
  const { titulosLegendarios, titulosDesbloqueados, monedas } = useGame();

  if (!isOpen) return null;

  const yaTiene = (id) => titulosDesbloqueados?.some(t => t.id === id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-white">Títulos Legendarios</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white text-2xl">&times;</button>
        </div>
        <p className="text-white/40 text-xs">Adquiere títulos exclusivos para destacar en tu perfil y ranking.</p>
        <div className="space-y-3">
          {titulosLegendarios?.map(titulo => {
            const adquirido = yaTiene(titulo.id);
            const rarezaClass = RAREZA_CLASES[titulo.rareza] || RAREZA_CLASES.comun;
            return (
              <div key={titulo.id} className={`glass-card rounded-2xl p-4 border ${rarezaClass} transition-all hover:scale-[1.01]`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{titulo.icono}</span>
                    <div>
                      <p className="font-black text-white text-sm">{titulo.nombre}</p>
                      <p className="text-white/40 text-[10px]">{titulo.descripcion}</p>
                    </div>
                  </div>
                  {adquirido ? (
                    <span className="text-green-400 text-xs font-black">✓</span>
                  ) : (
                    <button
                      onClick={() => onComprar(titulo)}
                      disabled={monedas < titulo.precio}
                      className="px-4 py-1.5 rounded-xl font-black text-xs bg-yellow-400 text-blue-900 disabled:bg-white/10 disabled:text-white/30"
                    >
                      {titulo.precio} 🪙
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TitulosModal;