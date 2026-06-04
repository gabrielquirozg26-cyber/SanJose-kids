import React from 'react';

const RAREZA_CONFIG = {
  comun: {
    color: 'text-slate-300',
    bg: 'bg-slate-500/20',
    border: 'border-slate-500/30',
    glow: '',
    icono: '⚪',
  },
  raro: {
    color: 'text-blue-300',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/40',
    glow: 'shadow-blue-400/30',
    icono: '🔵',
  },
  epico: {
    color: 'text-purple-300',
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/40',
    glow: 'shadow-purple-400/40',
    icono: '🟣',
  },
  legendario: {
    color: 'text-yellow-300',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/50',
    glow: 'shadow-yellow-400/50 animate-pulse',
    icono: '✨',
  },
  divino: {
    color: 'text-cyan-300',
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/50',
    glow: 'shadow-cyan-400/60 animate-pulse',
    icono: '💎',
  },
};

const RarezaBadge = ({ rareza, soloIcono = false, className = '' }) => {
  const config = RAREZA_CONFIG[rareza] || RAREZA_CONFIG.comun;
  if (soloIcono) {
    return <span className={`text-sm ${config.color}`}>{config.icono}</span>;
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${config.bg} ${config.border} ${config.color} ${config.glow} ${className}`}>
      {config.icono} {rareza}
    </span>
  );
};

export default RarezaBadge;