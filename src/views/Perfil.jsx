import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import AvatarSelector from '../components/AvatarSelector';

// Helpers para marcos decorativos (basado en inventario)
const MARCOS = {
  marco_vitral_azul:   { border: 'border-blue-400',   shadow: 'shadow-[0_0_20px_rgba(96,165,250,0.5)]',  gradiente: 'from-blue-600 to-cyan-400'   },
  marco_vitral_dorado: { border: 'border-yellow-400', shadow: 'shadow-[0_0_20px_rgba(250,204,21,0.6)]',  gradiente: 'from-yellow-500 to-amber-300' },
};
const getMarco    = (inv) => inv.includes('marco_vitral_dorado') ? MARCOS.marco_vitral_dorado : inv.includes('marco_vitral_azul') ? MARCOS.marco_vitral_azul : null;
const tieneAura   = (inv) => inv.includes('aura_santidad');

// Nombres de niveles
const NIVEL_NOMBRE = {
  1:'Padre Nuestro',2:'Ave María',3:'Gloria',4:'Ángel de la Guarda',
  5:'Yo Confieso',6:'Acto de Contrición',7:'Dulce Madre',
  8:'Credo Apostólico',9:'La Salve',10:'10 Mandamientos',
  11:'Bienaventuranzas',12:'7 Sacramentos',13:'Obras de Misericordia',
  14:'Misterios Gozosos',15:'Misterios Dolorosos',
  16:'Misterios Gloriosos',17:'Misterios Luminosos',
};

const Perfil = () => {
  const {
    userDoc,
    nombre,
    grupo,
    monedas,
    nivelActual,
    rango,
    racha,
    vidas,
    inventario,
    cerrarSesion,
    minutosHastaVida,
    cofresAbiertos,
    actualizarAvatar,
  } = useGame();

  const marco = getMarco(inventario);
  const aura = tieneAura(inventario);
  const mins = minutosHastaVida();
  const tiempoVida = mins > 0 ? (mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`) : null;

  const [selectorAbierto, setSelectorAbierto] = useState(false);

  // Usar directamente el avatar del contexto (sin estado local)
  const avatarActual = userDoc?.avatar || '😇';
  // Detectar si es imagen (ruta absoluta que empiece con /, base64, http, etc.)
  const esImagen = avatarActual?.startsWith('/') || 
                   avatarActual?.startsWith('data:image') || 
                   avatarActual?.startsWith('http');

  const handleSelectAvatar = async (nuevoAvatar) => {
    await actualizarAvatar(nuevoAvatar);
    setSelectorAbierto(false);
  };

  return (
    <div className="py-6 space-y-5 animate-slide-up">
      {/* Tarjeta de perfil con avatar grande */}
      <div className="glass-card rounded-3xl p-6 text-center relative overflow-hidden">
        {aura && <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/10 to-transparent pointer-events-none" />}
        
        <button 
          onClick={() => setSelectorAbierto(true)}
          className="absolute top-4 right-4 bg-white/10 rounded-full p-2 text-white/60 hover:bg-white/20 transition-all z-10"
          aria-label="Cambiar avatar"
        >
          ✏️
        </button>

        <div className="relative inline-block mx-auto cursor-pointer group" onClick={() => setSelectorAbierto(true)}>
          {marco && <div className={`absolute -inset-1.5 rounded-full bg-gradient-to-br ${marco.gradiente} opacity-80 blur-[2px]`} />}
          {aura && !marco && <div className="absolute -inset-2 rounded-full bg-yellow-400/20 animate-pulse blur-[4px]" />}
          <div className={`relative w-28 h-28 rounded-full flex items-center justify-center overflow-hidden border-4
            ${marco ? `${marco.border} ${marco.shadow}` : aura ? 'border-yellow-400/60 shadow-[0_0_25px_rgba(250,204,21,0.4)]' : 'border-white/20 bg-white/5'}`}>
            {esImagen ? (
              <img 
                src={avatarActual} 
                alt="Avatar" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Si falla la imagen, mostrar emoji por defecto
                  console.error('Error cargando avatar:', avatarActual);
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span class="text-5xl">😇</span>';
                }}
              />
            ) : (
              <span className="text-5xl">{avatarActual}</span>
            )}
          </div>
          <div className="absolute bottom-0 right-0 bg-yellow-400 rounded-full p-1 text-black text-xs shadow-lg">
            📷
          </div>
        </div>

        <div className="mt-4">
          <h2 className={`text-2xl font-black tracking-tighter ${aura ? 'text-yellow-100' : 'text-white'}`}>{nombre}</h2>
          <div className={`inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest
            ${rango === 'Maestro de la Fe' ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-300'
            : rango === 'Guardián del Credo' ? 'bg-purple-500/20 border-purple-400/50 text-purple-300'
            : 'bg-white/5 border-white/10 text-white/50'}`}>
            {rango === 'Maestro de la Fe' && <span>👑</span>}
            {rango === 'Guardián del Credo' && <span>⚜️</span>}
            {rango}
          </div>
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-1">{grupo}</p>
        </div>

        {NIVEL_NOMBRE[nivelActual] && (
          <div className="bg-white/5 rounded-2xl px-4 py-2 border border-white/10 mt-4">
            <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">Aprendiendo ahora</p>
            <p className="text-white font-black text-sm mt-0.5">{NIVEL_NOMBRE[nivelActual]}</p>
          </div>
        )}
      </div>

      {/* Stats modernos (igual que antes) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-2xl p-4 border border-white/10">
          <p className="text-white/40 text-[9px] font-black uppercase tracking-wider">🏅 Nivel</p>
          <p className="text-white font-black text-2xl">{nivelActual}</p>
          <div className="h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: `${(nivelActual/17)*100}%` }} />
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-yellow-400/20">
          <p className="text-white/40 text-[9px] font-black uppercase tracking-wider">🪙 Monedas</p>
          <p className="text-yellow-400 font-black text-2xl">{monedas}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-orange-400/30">
          <p className="text-white/40 text-[9px] font-black uppercase tracking-wider">🔥 Racha</p>
          <p className="text-orange-400 font-black text-2xl">{racha} días</p>
          {inventario.includes('seguro_racha') && <p className="text-orange-300 text-[9px] font-black mt-1">Seguro activo</p>}
        </div>
        <div className="glass-card rounded-2xl p-4 border border-white/10">
          <p className="text-white/40 text-[9px] font-black uppercase tracking-wider">❤️ Vidas</p>
          <div className="flex gap-1 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-lg ${i < vidas ? 'opacity-100' : 'opacity-20'}`}>❤️</span>
            ))}
          </div>
          {tiempoVida && <p className="text-white/30 text-[9px] font-black mt-1">+1 en {tiempoVida}</p>}
        </div>
      </div>

      {/* Cofres abiertos */}
      {cofresAbiertos > 0 && (
        <div className="glass-card rounded-2xl p-4 border border-amber-600/20 flex items-center gap-3">
          <span className="text-2xl">📦</span>
          <div>
            <p className="text-amber-400 font-black text-sm">{cofresAbiertos} cofres abiertos</p>
            <p className="text-white/30 text-xs">Sigue jugando para obtener más</p>
          </div>
        </div>
      )}

      {/* Inventario */}
      {inventario.length > 0 && (
        <div className="glass-card rounded-3xl p-5 border border-white/10">
          <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] mb-3">Objetos equipados</p>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'escudo_miguel', icono: '🛡️', nombre: 'Escudo de San Miguel' },
              { id: 'seguro_racha', icono: '🔥', nombre: 'Seguro de Racha' },
              { id: 'aura_santidad', icono: '✨', nombre: 'Aura de Santidad' },
              { id: 'marco_vitral_azul', icono: '🔵', nombre: 'Marco Vitral Azul' },
              { id: 'marco_vitral_dorado', icono: '🟡', nombre: 'Marco Vitral Dorado' },
              { id: 'titulo_guardian', icono: '⚜️', nombre: 'Guardián del Credo' },
              { id: 'titulo_maestro', icono: '👑', nombre: 'Maestro de la Fe' },
              { id: 'pocion_sabiduria', icono: '🧪', nombre: 'Poción de Sabiduría' },
              { id: 'reloj_arena', icono: '⏳', nombre: 'Reloj de Arena' },
            ].filter(obj => inventario.includes(obj.id)).map(obj => (
              <div key={obj.id} className="bg-white/5 border border-white/10 rounded-2xl px-3 py-2 flex items-center gap-2">
                <span className="text-lg">{obj.icono}</span>
                <span className="text-white font-black text-[11px]">{obj.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button 
        onClick={cerrarSesion} 
        className="w-full py-3 rounded-2xl border border-red-500/30 text-red-400 font-black text-sm uppercase tracking-widest hover:bg-red-500/10 transition-all"
      >
        Cerrar sesión
      </button>

      <AvatarSelector 
        isOpen={selectorAbierto} 
        onClose={() => setSelectorAbierto(false)} 
        onSelectAvatar={handleSelectAvatar} 
      />
    </div>
  );
};

export default Perfil;