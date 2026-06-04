import React from 'react';
import santosData from '../data/santos.json';

const MARCOS = {
  marco_vitral_azul:   { border: 'border-blue-400',   shadow: 'shadow-[0_0_20px_rgba(96,165,250,0.5)]',  gradiente: 'from-blue-600 to-cyan-400',   nombre: 'Marco Vitral Azul' },
  marco_vitral_dorado: { border: 'border-yellow-400', shadow: 'shadow-[0_0_20px_rgba(250,204,21,0.6)]',  gradiente: 'from-yellow-500 to-amber-300', nombre: 'Marco Vitral Dorado' },
};

const RAREZA_COLOR = {
  comun: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  raro: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  epico: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
  legendario: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
  mitico: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
  divino: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
};

const NIVEL_NOMBRE = {
  1:'Padre Nuestro',2:'Ave María',3:'Gloria',4:'Ángel de la Guarda',
  5:'Yo Confieso',6:'Acto de Contrición',7:'Dulce Madre',
  8:'Credo Apostólico',9:'La Salve',10:'10 Mandamientos',
  11:'Bienaventuranzas',12:'7 Sacramentos',13:'Obras de Misericordia',
  14:'Misterios Gozosos',15:'Misterios Dolorosos',
  16:'Misterios Gloriosos',17:'Misterios Luminosos',
};

const getMarco = (inv) => {
  if (inv?.includes('marco_vitral_dorado')) return MARCOS.marco_vitral_dorado;
  if (inv?.includes('marco_vitral_azul')) return MARCOS.marco_vitral_azul;
  return null;
};
const tieneAura = (inv) => inv?.includes('aura_santidad');

const renderAvatar = (avatar, marco, aura, size = 'w-28 h-28', textSize = 'text-5xl') => {
  const esImagen = avatar?.startsWith('data:image') || avatar?.startsWith('http') || avatar?.startsWith('/images/');
  return (
    <div className="relative inline-block">
      {aura && !marco && <div className="absolute -inset-2 rounded-full bg-yellow-400/20 animate-pulse blur-[4px]" />}
      {marco && <div className={`absolute -inset-1.5 rounded-full bg-gradient-to-br ${marco.gradiente} opacity-80 blur-[2px] animate-pulse`} />}
      <div className={`relative ${size} rounded-full flex items-center justify-center overflow-hidden border-4 bg-white/5 ${
        marco ? `${marco.border} ${marco.shadow}` : aura ? 'border-yellow-400/60 shadow-[0_0_25px_rgba(250,204,21,0.4)]' : 'border-white/20'
      }`}>
        {esImagen ? (
          <img src={avatar} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span class="${textSize}">😇</span>`; }} />
        ) : (
          <span className={textSize}>{avatar || '😇'}</span>
        )}
      </div>
    </div>
  );
};

const PerfilPublico = ({ usuario, onVolver }) => {
  const marco = getMarco(usuario.inventario);
  const aura = tieneAura(usuario.inventario);
  const avatar = usuario.avatar || '😇';
  const tituloEquipado = usuario.tituloEquipado;
  const tituloObj = usuario.titulosDesbloqueados?.find(t => t.id === tituloEquipado);
  const tituloEstilo = RAREZA_COLOR[tituloObj?.rareza || 'comun'];
  const santoFavoritoObj = santosData.santos.find(s => s.id === usuario.santoFavorito);
  const santosColeccion = santosData.santos.filter(s => usuario.coleccion?.includes(s.id));
  const nivelesCompletados = usuario.nivelesCompletados?.length || 0;
  const examenesAprobados = usuario.examenesAprobados?.length || 0;
  const progresoGlobal = (usuario.nivelActual / 17) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-slate-900 text-white font-sans pb-24 animate-slide-up">
      {/* Botón volver fijo */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-black/40 p-4">
        <button onClick={onVolver} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-black">
          ← Volver al ranking
        </button>
      </div>

      {/* Header del perfil */}
      <div className="relative flex flex-col items-center text-center px-4 -mt-4">
        {aura && <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/10 to-transparent pointer-events-none" />}
        {renderAvatar(avatar, marco, aura, 'w-28 h-28', 'text-5xl')}
        
        <h2 className={`text-2xl font-black tracking-tighter mt-4 ${aura ? 'text-yellow-100' : 'text-white'}`}>{usuario.nombre}</h2>
        <div className={`inline-block mt-1 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${tituloEstilo}`}>
          {tituloObj?.nombre || 'Sin título'}
        </div>
        <p className="text-white/40 text-xs mt-1">{usuario.grupo}</p>
      </div>

      {/* Biografía y santo favorito */}
      <div className="mx-4 mt-6 space-y-3">
        <div className="glass-card rounded-2xl p-4 text-left">
          <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest">📝 Biografía</p>
          <p className="text-white/70 text-sm mt-1">{usuario.biografia || 'Sin biografía aún.'}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest">🙏 Santo favorito</p>
          <div className="flex items-center gap-3 mt-2">
            {santoFavoritoObj ? (
              <>
                <span className="text-3xl">{santoFavoritoObj.icono}</span>
                <span className="text-white font-black">{santoFavoritoObj.nombre}</span>
              </>
            ) : (
              <p className="text-white/50 text-sm">No seleccionado</p>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 gap-3 mx-4 mt-4">
        <div className="glass-card rounded-2xl p-3 text-center"><p className="text-white/40 text-[9px] font-black">🏅 Nivel</p><p className="text-white font-black text-xl">{usuario.nivelActual} · {NIVEL_NOMBRE[usuario.nivelActual] || 'Iniciado'}</p></div>
        <div className="glass-card rounded-2xl p-3 text-center border border-yellow-400/20"><p className="text-white/40 text-[9px] font-black">🪙 Monedas</p><p className="text-yellow-400 font-black text-xl">{usuario.monedas?.toLocaleString() || 0}</p></div>
        <div className="glass-card rounded-2xl p-3 text-center"><p className="text-white/40 text-[9px] font-black">🔥 Racha</p><p className="text-orange-400 font-black text-xl">{usuario.racha || 0} días</p></div>
        <div className="glass-card rounded-2xl p-3 text-center"><p className="text-white/40 text-[9px] font-black">📦 Cofres</p><p className="text-amber-400 font-black text-xl">{usuario.cofresAbiertos || 0}</p></div>
        <div className="glass-card rounded-2xl p-3 text-center"><p className="text-white/40 text-[9px] font-black">✅ Niveles</p><p className="text-white font-black text-xl">{nivelesCompletados}</p></div>
        <div className="glass-card rounded-2xl p-3 text-center"><p className="text-white/40 text-[9px] font-black">🎓 Exámenes</p><p className="text-white font-black text-xl">{examenesAprobados}</p></div>
      </div>

      {/* Barra de progreso general */}
      <div className="glass-card rounded-2xl p-4 mx-4 mt-4">
        <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">📊 Progreso general</p>
        <div className="h-2 bg-white/10 rounded-full mt-2">
          <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full" style={{ width: `${progresoGlobal}%` }} />
        </div>
        <p className="text-white/60 text-xs mt-1">{Math.round(progresoGlobal)}% completado</p>
      </div>

      {/* Títulos desbloqueados */}
      {usuario.titulosDesbloqueados?.length > 0 && (
        <div className="mx-4 mt-4">
          <h3 className="text-white font-black text-sm uppercase tracking-wider mb-2">🏆 Títulos desbloqueados ({usuario.titulosDesbloqueados.length})</h3>
          <div className="flex flex-wrap gap-2">
            {usuario.titulosDesbloqueados.slice(0, 6).map(t => (
              <span key={t.id} className={`text-[10px] px-2 py-1 rounded-full border ${RAREZA_COLOR[t.rareza]}`}>{t.nombre}</span>
            ))}
            {usuario.titulosDesbloqueados.length > 6 && <span className="text-white/40 text-[10px]">+{usuario.titulosDesbloqueados.length - 6}</span>}
          </div>
        </div>
      )}

      {/* Logros pendientes (por canjear) */}
      {usuario.logrosPendientes?.length > 0 && (
        <div className="mx-4 mt-4">
          <h3 className="text-white font-black text-sm uppercase tracking-wider mb-2">✨ Logros por canjear</h3>
          <div className="flex flex-wrap gap-2">
            {usuario.logrosPendientes.map(l => {
              const titulo = usuario.titulosDesbloqueados?.find(t => t.id === l.id);
              return <span key={l.id} className="text-[10px] px-2 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300">{titulo?.nombre || l.id}</span>;
            })}
          </div>
        </div>
      )}

      {/* Santos coleccionados */}
      {santosColeccion.length > 0 && (
        <div className="mx-4 mt-4">
          <h3 className="text-white font-black text-sm uppercase tracking-wider mb-2">📖 Santos ({santosColeccion.length}/{santosData.santos.length})</h3>
          <div className="grid grid-cols-4 gap-2">
            {santosColeccion.slice(0, 8).map(s => (
              <div key={s.id} className="glass-card rounded-xl p-2 text-center border border-white/10">
                <span className="text-2xl">{s.icono}</span>
                <p className="font-black text-[8px] truncate">{s.nombre}</p>
              </div>
            ))}
            {santosColeccion.length > 8 && <div className="glass-card rounded-xl p-2 text-center flex items-center justify-center text-xs">+{santosColeccion.length - 8}</div>}
          </div>
        </div>
      )}

      {/* Inventario / objetos */}
      {usuario.inventario?.filter(i => !i.startsWith('marco_') && !['aura_santidad', 'escudo_miguel', 'seguro_racha', 'pocion_sabiduria'].includes(i)).length > 0 && (
        <div className="mx-4 mt-4">
          <h3 className="text-white font-black text-sm uppercase tracking-wider mb-2">🎒 Otros objetos</h3>
          <div className="flex flex-wrap gap-2">
            {usuario.inventario.map(item => {
              if (item.startsWith('marco_') || item === 'aura_santidad' || item === 'escudo_miguel' || item === 'seguro_racha' || item === 'pocion_sabiduria') return null;
              return <span key={item} className="bg-white/5 rounded-full px-2 py-1 text-[10px]">{item.replace(/_/g, ' ')}</span>;
            })}
          </div>
        </div>
      )}

      <div className="text-center text-white/20 text-[9px] font-black uppercase tracking-[0.3em] py-6">
        Miembro de la catequesis · San José Diriamba
      </div>
    </div>
  );
};

export default PerfilPublico;
