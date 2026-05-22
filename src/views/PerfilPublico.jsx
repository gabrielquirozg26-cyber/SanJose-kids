import React from 'react';

const MARCOS = {
  marco_vitral_azul:   { border: 'border-blue-400',   shadow: 'shadow-[0_0_20px_rgba(96,165,250,0.5)]',  gradiente: 'from-blue-600 to-cyan-400'   },
  marco_vitral_dorado: { border: 'border-yellow-400', shadow: 'shadow-[0_0_20px_rgba(250,204,21,0.6)]',  gradiente: 'from-yellow-500 to-amber-300' },
};
const getMarco    = (inv) => inv.includes('marco_vitral_dorado') ? MARCOS.marco_vitral_dorado : inv.includes('marco_vitral_azul') ? MARCOS.marco_vitral_azul : null;
const tieneAura   = (inv) => inv.includes('aura_santidad');

const NIVEL_NOMBRE = {
  1:'Padre Nuestro',2:'Ave María',3:'Gloria',4:'Ángel de la Guarda',
  5:'Yo Confieso',6:'Acto de Contrición',7:'Dulce Madre',
  8:'Credo Apostólico',9:'La Salve',10:'10 Mandamientos',
  11:'Bienaventuranzas',12:'7 Sacramentos',13:'Obras de Misericordia',
  14:'Misterios Gozosos',15:'Misterios Dolorosos',
  16:'Misterios Gloriosos',17:'Misterios Luminosos',
};

const PerfilPublico = ({ usuario, onVolver }) => {
  const marco = getMarco(usuario.inventario || []);
  const aura = tieneAura(usuario.inventario || []);
  const avatar = usuario.avatar || '😇';
  const esImagen = avatar?.startsWith('data:image') || avatar?.startsWith('http');

  return (
    <div className="py-6 animate-slide-up">
      <button 
        onClick={onVolver} 
        className="mb-4 text-white/40 hover:text-white/80 flex items-center gap-2 text-sm font-black uppercase tracking-wider transition-colors"
      >
        ← Volver al ranking
      </button>
      
      <div className="glass-card rounded-3xl p-6 text-center relative overflow-hidden">
        {aura && <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/10 to-transparent pointer-events-none" />}
        
        <div className="relative inline-block mx-auto">
          {marco && <div className={`absolute -inset-1.5 rounded-full bg-gradient-to-br ${marco.gradiente} opacity-80 blur-[2px]`} />}
          {aura && !marco && <div className="absolute -inset-2 rounded-full bg-yellow-400/20 animate-pulse blur-[4px]" />}
          <div className={`relative w-28 h-28 rounded-full flex items-center justify-center overflow-hidden border-4
            ${marco ? `${marco.border} ${marco.shadow}` : aura ? 'border-yellow-400/60 shadow-[0_0_25px_rgba(250,204,21,0.4)]' : 'border-white/20 bg-white/5'}`}>
            {esImagen ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl">{avatar}</span>
            )}
          </div>
        </div>

        <div className="mt-4">
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
        </div>

        {NIVEL_NOMBRE[usuario.nivelActual] && (
          <div className="bg-white/5 rounded-2xl px-4 py-2 border border-white/10 mt-4">
            <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">Aprendiendo ahora</p>
            <p className="text-white font-black text-sm mt-0.5">{NIVEL_NOMBRE[usuario.nivelActual]}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="glass-card rounded-2xl p-4 border border-white/10">
          <p className="text-white/40 text-[9px] font-black uppercase tracking-wider">🏅 Nivel</p>
          <p className="text-white font-black text-2xl">{usuario.nivelActual || 1}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-yellow-400/20">
          <p className="text-white/40 text-[9px] font-black uppercase tracking-wider">🪙 Monedas</p>
          <p className="text-yellow-400 font-black text-2xl">{usuario.monedas || 0}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-orange-400/30">
          <p className="text-white/40 text-[9px] font-black uppercase tracking-wider">🔥 Racha</p>
          <p className="text-orange-400 font-black text-2xl">{usuario.racha || 0} días</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-white/10">
          <p className="text-white/40 text-[9px] font-black uppercase tracking-wider">❤️ Vidas</p>
          <div className="flex gap-1 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-lg ${i < (usuario.vidas || 5) ? 'opacity-100' : 'opacity-20'}`}>❤️</span>
            ))}
          </div>
        </div>
      </div>

      {usuario.cofresAbiertos > 0 && (
        <div className="glass-card rounded-2xl p-4 border border-amber-600/20 flex items-center gap-3 mt-4">
          <span className="text-2xl">📦</span>
          <div>
            <p className="text-amber-400 font-black text-sm">{usuario.cofresAbiertos} cofres abiertos</p>
          </div>
        </div>
      )}

      {(usuario.inventario?.length > 0) && (
        <div className="glass-card rounded-3xl p-5 border border-white/10 mt-4">
          <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] mb-3">Objetos equipados</p>
          <div className="flex flex-wrap gap-2">
            {usuario.inventario.map(objId => {
              const obj = { id: objId, icono: '🔮', nombre: objId };
              if (objId === 'escudo_miguel') obj.icono = '🛡️', obj.nombre = 'Escudo de San Miguel';
              if (objId === 'seguro_racha') obj.icono = '🔥', obj.nombre = 'Seguro de Racha';
              if (objId === 'aura_santidad') obj.icono = '✨', obj.nombre = 'Aura de Santidad';
              if (objId === 'marco_vitral_azul') obj.icono = '🔵', obj.nombre = 'Marco Vitral Azul';
              if (objId === 'marco_vitral_dorado') obj.icono = '🟡', obj.nombre = 'Marco Vitral Dorado';
              if (objId === 'titulo_guardian') obj.icono = '⚜️', obj.nombre = 'Guardián del Credo';
              if (objId === 'titulo_maestro') obj.icono = '👑', obj.nombre = 'Maestro de la Fe';
              if (objId === 'pocion_sabiduria') obj.icono = '🧪', obj.nombre = 'Poción de Sabiduría';
              if (objId === 'reloj_arena') obj.icono = '⏳', obj.nombre = 'Reloj de Arena';
              return (
                <div key={obj.id} className="bg-white/5 border border-white/10 rounded-2xl px-3 py-2 flex items-center gap-2">
                  <span className="text-lg">{obj.icono}</span>
                  <span className="text-white font-black text-[11px]">{obj.nombre}</span>
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