import React from 'react';
import { useGame } from '../context/GameContext';

const MARCOS = {
  marco_vitral_azul:   { border: 'border-blue-400',   shadow: 'shadow-[0_0_20px_rgba(96,165,250,0.5)]',  gradiente: 'from-blue-600 to-cyan-400'   },
  marco_vitral_dorado: { border: 'border-yellow-400', shadow: 'shadow-[0_0_20px_rgba(250,204,21,0.6)]',  gradiente: 'from-yellow-500 to-amber-300' },
};
const getMarco    = (inv) => inv.includes('marco_vitral_dorado') ? MARCOS.marco_vitral_dorado : inv.includes('marco_vitral_azul') ? MARCOS.marco_vitral_azul : null;
const tieneAura   = (inv) => inv.includes('aura_santidad');
const tieneEscudo = (inv) => inv.includes('escudo_miguel');
const tieneSeguro = (inv) => inv.includes('seguro_racha');

const NIVEL_NOMBRE = {
  1:'Padre Nuestro',2:'Ave María',3:'Gloria',4:'Ángel de la Guarda',
  5:'Yo Confieso',6:'Acto de Contrición',7:'Dulce Madre',
  8:'Credo Apostólico',9:'La Salve',10:'10 Mandamientos',
  11:'Bienaventuranzas',12:'7 Sacramentos',13:'Obras de Misericordia',
  14:'Misterios Gozosos',15:'Misterios Dolorosos',
  16:'Misterios Gloriosos',17:'Misterios Luminosos',
};

const PerfilPublico = ({ usuario, onVolver }) => {
  const marco      = getMarco(usuario.inventario || []);
  const aura       = tieneAura(usuario.inventario || []);
  const tieneEsc   = tieneEscudo(usuario.inventario || []);
  const tieneSeg   = tieneSeguro(usuario.inventario || []);

  return (
    <div className="py-6 animate-slide-up">
      <button 
        onClick={onVolver} 
        className="mb-4 text-white/40 hover:text-white/80 flex items-center gap-2 text-sm font-black uppercase tracking-wider transition-colors"
      >
        ← Volver al ranking
      </button>
      <div className="glass-card rounded-3xl p-6 text-center space-y-3 border border-white/10 relative overflow-hidden">
        {aura && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/5 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-yellow-400/10 rounded-full blur-[60px]" />
          </div>
        )}
        <div className="relative inline-block mx-auto">
          {marco && <div className={`absolute -inset-1.5 rounded-full bg-gradient-to-br ${marco.gradiente} opacity-80 blur-[2px]`} />}
          {aura && !marco && <div className="absolute -inset-2 rounded-full bg-yellow-400/20 animate-pulse blur-[4px]" />}
          <div className={`relative w-24 h-24 rounded-full flex items-center justify-center text-5xl border-4
            ${marco ? `${marco.border} ${marco.shadow}` : aura ? 'border-yellow-400/60 shadow-[0_0_25px_rgba(250,204,21,0.4)]' : 'border-white/20 bg-white/5'}`}>
            😇
          </div>
          {tieneEsc && (
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-yellow-400
              flex items-center justify-center text-sm shadow-lg border-2 border-[#050b14]">🛡️</div>
          )}
        </div>
        <h2 className={`text-2xl font-black tracking-tighter ${aura ? 'text-yellow-100' : 'text-white'}`}>{usuario.nombre}</h2>
        <div className={`inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest
          ${usuario.rango === 'Maestro de la Fe' ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-300'
          : usuario.rango === 'Guardián del Credo' ? 'bg-purple-500/20 border-purple-400/50 text-purple-300'
          : 'bg-white/5 border-white/10 text-white/50'}`}>
          {usuario.rango === 'Maestro de la Fe' && <span>👑</span>}
          {usuario.rango === 'Guardián del Credo' && <span>⚜️</span>}
          {usuario.rango}
        </div>
        <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">{usuario.grupo}</p>
        {NIVEL_NOMBRE[usuario.nivelActual] && (
          <div className="bg-white/5 rounded-2xl px-4 py-2 border border-white/10">
            <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">Aprendiendo ahora</p>
            <p className="text-white font-black text-sm mt-0.5">{NIVEL_NOMBRE[usuario.nivelActual]}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="glass-card rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏅</span>
            <div><p className="text-white font-black text-lg">{usuario.nivelActual}</p><p className="text-white/30 text-[9px] font-black">Nivel</p></div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-yellow-400/20">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪙</span>
            <div><p className="text-yellow-400 font-black text-lg">{usuario.monedas}</p><p className="text-white/30 text-[9px] font-black">Monedas</p></div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-orange-400/20">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <div><p className="text-orange-400 font-black text-lg">{usuario.racha} días</p><p className="text-white/30 text-[9px] font-black">Racha</p></div>
          </div>
          {tieneSeg && <p className="text-orange-300 text-[9px] font-black mt-2">🔥 Seguro activo</p>}
        </div>
        <div className="glass-card rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xl">❤️</span>
            <div><p className="text-white font-black text-lg">{usuario.vidas || 5}/5</p><p className="text-white/30 text-[9px] font-black">Vidas</p></div>
          </div>
        </div>
      </div>

      {(usuario.inventario?.length > 0) && (
        <div className="glass-card rounded-3xl p-5 border border-white/10 space-y-3 mt-4">
          <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">Objetos equipados</p>
          <div className="grid grid-cols-2 gap-2">
            {usuario.inventario.map(objId => {
              const obj = { id: objId, icono: '🔮', nombre: objId, desc: '' };
              if (objId === 'escudo_miguel') obj.icono = '🛡️', obj.nombre = 'Escudo de San Miguel', obj.desc = 'Protege del próximo error';
              if (objId === 'seguro_racha') obj.icono = '🔥', obj.nombre = 'Seguro de Racha', obj.desc = 'Racha protegida';
              if (objId === 'aura_santidad') obj.icono = '✨', obj.nombre = 'Aura de Santidad', obj.desc = 'Visible en el ranking';
              if (objId === 'marco_vitral_azul') obj.icono = '🔵', obj.nombre = 'Marco Vitral Azul', obj.desc = 'Marco de perfil';
              if (objId === 'marco_vitral_dorado') obj.icono = '🟡', obj.nombre = 'Marco Vitral Dorado', obj.desc = 'Marco de perfil dorado';
              if (objId === 'titulo_guardian') obj.icono = '⚜️', obj.nombre = 'Guardián del Credo', obj.desc = 'Título activo';
              if (objId === 'titulo_maestro') obj.icono = '👑', obj.nombre = 'Maestro de la Fe', obj.desc = 'Título activo';
              if (objId === 'pocion_sabiduria') obj.icono = '🧪', obj.nombre = 'Poción de Sabiduría', obj.desc = 'Elimina opciones malas';
              if (objId === 'reloj_arena') obj.icono = '⏳', obj.nombre = 'Reloj de Arena', obj.desc = 'Tiempo extra';
              return (
                <div key={obj.id} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2">
                  <span className="text-lg shrink-0">{obj.icono}</span>
                  <div className="min-w-0"><p className="text-white font-black text-[11px] truncate">{obj.nombre}</p><p className="text-white/30 text-[9px]">{obj.desc}</p></div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerfilPublico;