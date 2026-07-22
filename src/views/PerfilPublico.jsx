import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { motion } from 'framer-motion';
import santosData from '../data/santos.json';

// ── ESTILOS ──────────────────────────────────────────────────────────────
const RAREZA_COLOR = {
  comun: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  raro: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  epico: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
  legendario: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
  mitico: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
  divino: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
};

const MARCOS_ESTILOS = {
  marco_vitral_azul: { nombre: 'Marco Vitral Azul', border: 'border-blue-400', shadow: 'shadow-[0_0_20px_rgba(96,165,250,0.5)]', gradiente: 'from-blue-600 to-cyan-400' },
  marco_vitral_dorado: { nombre: 'Marco Vitral Dorado', border: 'border-yellow-400', shadow: 'shadow-[0_0_20px_rgba(250,204,21,0.6)]', gradiente: 'from-yellow-500 to-amber-300' },
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
  if (inv?.includes('marco_vitral_dorado')) return MARCOS_ESTILOS.marco_vitral_dorado;
  if (inv?.includes('marco_vitral_azul')) return MARCOS_ESTILOS.marco_vitral_azul;
  return null;
};

const tieneAura = (inv) => inv?.includes('aura_santidad');

// ── COMPONENTE PARA RENDERIZAR AVATAR ──────────────────────────────────
const renderAvatar = (avatar, marco, aura, size = 'w-28 h-28', textSize = 'text-5xl') => {
  const esImagen = avatar?.startsWith('data:image') || avatar?.startsWith('http') || avatar?.startsWith('/images/');
  return (
    <div className="relative inline-block">
      {aura && !marco && (
        <div className="absolute -inset-3 rounded-full bg-yellow-400/20 animate-pulse blur-[4px]" />
      )}
      {marco && (
        <div className={`absolute -inset-2 rounded-full bg-gradient-to-br ${marco.gradiente} opacity-80 blur-[2px] animate-pulse`} />
      )}
      <div className={`relative ${size} rounded-full flex items-center justify-center overflow-hidden border-4 bg-white/5 ${
        marco ? `${marco.border} ${marco.shadow}` : aura ? 'border-yellow-400/60 shadow-[0_0_25px_rgba(250,204,21,0.4)]' : 'border-white/20'
      }`}>
        {esImagen ? (
          <img 
            src={avatar} 
            alt="Avatar" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `<span class="${textSize}">😇</span>`;
            }}
          />
        ) : (
          <span className={textSize}>{avatar || '😇'}</span>
        )}
      </div>
    </div>
  );
};

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────
const PerfilPublico = ({ usuario, onVolver }) => {
  const [tabActiva, setTabActiva] = useState('info');
  
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

  // ── TABS ──
  const tabs = [
    { id: 'info', label: '📋 Información' },
    { id: 'coleccion', label: '📖 Colección' },
    { id: 'stats', label: '📊 Estadísticas' },
  ];

  // ── ANIMACIONES ──
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen text-white font-sans pb-24"
    >
      {/* ── BOTÓN VOLVER ── */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-black/40 p-3 sm:p-4 border-b border-white/5">
        <button 
          onClick={onVolver} 
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs sm:text-sm font-black uppercase tracking-widest group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Volver al ranking
        </button>
      </div>

      {/* ── CABECERA DEL PERFIL ── */}
      <motion.div 
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="relative flex flex-col items-center text-center px-4 -mt-4 pt-6"
      >
        {aura && (
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/10 to-transparent pointer-events-none" />
        )}
        
        {renderAvatar(avatar, marco, aura, 'w-28 h-28 sm:w-32 sm:h-32', 'text-5xl sm:text-6xl')}
        
        <h2 className={`text-2xl sm:text-3xl font-black tracking-tighter mt-4 ${aura ? 'text-yellow-100' : 'text-white'}`}>
          {usuario.nombre}
        </h2>
        <div className={`inline-block mt-1 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${tituloEstilo}`}>
          {tituloObj?.nombre || 'Sin título'}
        </div>
        <p className="text-white/40 text-xs mt-1">{usuario.grupo}</p>
      </motion.div>

      {/* ── TABS ── */}
      <motion.div 
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex gap-1 sm:gap-2 mx-4 mt-6 bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/10"
      >
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTabActiva(t.id)}
            className={`flex-1 py-1.5 sm:py-2 rounded-full font-black text-[9px] sm:text-xs uppercase tracking-widest transition-all ${
              tabActiva === t.id 
                ? 'bg-yellow-400 text-blue-900 shadow-lg' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </motion.div>

      {/* ── CONTENIDO ── */}
      <div className="px-4 mt-6 space-y-4 sm:space-y-5">
        {/* === TAB INFORMACIÓN === */}
        {tabActiva === 'info' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Biografía */}
            <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10">
              <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest">📝 Biografía</p>
              <p className="text-white/70 text-sm sm:text-base mt-2 leading-relaxed">
                {usuario.biografia || '✨ Este catequista aún no ha escrito su biografía.'}
              </p>
            </div>

            {/* Santo favorito */}
            <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10">
              <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest">🙏 Santo favorito</p>
              <div className="flex items-center gap-4 mt-2">
                {santoFavoritoObj ? (
                  <>
                    <span className="text-4xl sm:text-5xl">{santoFavoritoObj.icono}</span>
                    <div>
                      <p className="font-black text-white text-base sm:text-lg">{santoFavoritoObj.nombre}</p>
                      <p className="text-white/40 text-xs">{santoFavoritoObj.rareza}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-white/50 text-sm">No ha elegido un santo favorito</p>
                )}
              </div>
            </div>

            {/* Resumen rápido */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card rounded-2xl p-3 sm:p-4 text-center border border-white/10">
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">🏅 Nivel</p>
                <p className="text-white font-black text-xl sm:text-2xl">{usuario.nivelActual}</p>
                <p className="text-yellow-400 text-[10px] font-black">{NIVEL_NOMBRE[usuario.nivelActual] || 'Iniciado'}</p>
              </div>
              <div className="glass-card rounded-2xl p-3 sm:p-4 text-center border border-yellow-400/20">
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">🪙 Monedas</p>
                <p className="text-yellow-400 font-black text-xl sm:text-2xl">{usuario.monedas?.toLocaleString() || 0}</p>
              </div>
              <div className="glass-card rounded-2xl p-3 sm:p-4 text-center border border-orange-400/30">
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">🔥 Racha</p>
                <p className="text-orange-400 font-black text-xl sm:text-2xl">{usuario.racha || 0} días</p>
              </div>
              <div className="glass-card rounded-2xl p-3 sm:p-4 text-center border border-white/10">
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">❤️ Vidas</p>
                <div className="flex justify-center gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`text-lg sm:text-xl ${i < (usuario.vidas || 5) ? 'text-red-500' : 'text-white/20'}`}>❤️</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* === TAB COLECCIÓN === */}
        {tabActiva === 'coleccion' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5 pb-6"
          >
            {/* Títulos desbloqueados */}
            {usuario.titulosDesbloqueados?.length > 0 && (
              <div>
                <h3 className="text-white font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                  🏆 Títulos ({usuario.titulosDesbloqueados.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {usuario.titulosDesbloqueados.map(t => (
                    <span key={t.id} className={`text-[10px] px-2 py-1 rounded-full border ${RAREZA_COLOR[t.rareza]}`}>
                      {t.nombre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Santos coleccionados */}
            {santosColeccion.length > 0 && (
              <div>
                <h3 className="text-white font-black text-sm uppercase tracking-wider mb-3">
                  📖 Santos ({santosColeccion.length}/{santosData.santos.length})
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {santosColeccion.slice(0, 8).map(s => (
                    <div key={s.id} className="glass-card rounded-xl p-2 text-center border border-white/10 hover:scale-105 transition-all">
                      <span className="text-2xl sm:text-3xl">{s.icono}</span>
                      <p className="font-black text-[8px] truncate mt-0.5">{s.nombre}</p>
                    </div>
                  ))}
                  {santosColeccion.length > 8 && (
                    <div className="glass-card rounded-xl p-2 text-center flex items-center justify-center text-xs border border-white/10">
                      +{santosColeccion.length - 8}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Logros pendientes */}
            {usuario.logrosPendientes?.length > 0 && (
              <div className="glass-card rounded-2xl p-4 border border-purple-500/30 bg-purple-500/5">
                <p className="text-purple-300 text-[10px] font-black uppercase tracking-widest">✨ Logros pendientes</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {usuario.logrosPendientes.map(l => {
                    const titulo = usuario.titulosDesbloqueados?.find(t => t.id === l.id);
                    return (
                      <span key={l.id} className="bg-purple-500/20 px-2 py-1 rounded-full text-[10px] font-black">
                        {titulo?.nombre || l.id}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* === TAB ESTADÍSTICAS === */}
        {tabActiva === 'stats' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5 pb-6"
          >
            {/* Progreso general */}
            <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10">
              <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">📊 Progreso general</p>
              <div className="h-2 sm:h-3 bg-white/10 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-1000" style={{ width: `${progresoGlobal}%` }} />
              </div>
              <p className="text-white/60 text-xs sm:text-sm mt-2">{Math.round(progresoGlobal)}% completado</p>
            </div>

            {/* Estadísticas numéricas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card rounded-2xl p-3 sm:p-4 text-center border border-white/10">
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">✅ Niveles</p>
                <p className="text-white font-black text-xl sm:text-2xl">{nivelesCompletados}</p>
              </div>
              <div className="glass-card rounded-2xl p-3 sm:p-4 text-center border border-white/10">
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">🎓 Exámenes</p>
                <p className="text-white font-black text-xl sm:text-2xl">{examenesAprobados}</p>
              </div>
              <div className="glass-card rounded-2xl p-3 sm:p-4 text-center border border-amber-400/20">
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">📦 Cofres</p>
                <p className="text-amber-400 font-black text-xl sm:text-2xl">{usuario.cofresAbiertos || 0}</p>
              </div>
              <div className="glass-card rounded-2xl p-3 sm:p-4 text-center border border-white/10">
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">🛡️ Escudos</p>
                <p className="text-white font-black text-xl sm:text-2xl">{usuario.inventario?.filter(i => i === 'escudo_miguel').length || 0}</p>
              </div>
            </div>

            {/* Gráfico de niveles */}
            <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10">
              <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">📈 Evolución de nivel</p>
              <div className="flex items-end gap-0.5 sm:gap-1 h-24 sm:h-32 mt-3">
                {Array.from({ length: 17 }, (_, i) => i + 1).map(n => (
                  <div key={n} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-yellow-400/30 rounded-t transition-all" style={{ height: `${n <= usuario.nivelActual ? 30 : 0}px` }} />
                    <span className="text-[6px] sm:text-[8px] text-white/40 mt-0.5">{n}</span>
                  </div>
                ))}
              </div>
              <p className="text-center text-white/40 text-[10px] mt-2">Nivel actual: {usuario.nivelActual}</p>
            </div>

            {/* Objetos del inventario */}
            {usuario.inventario?.filter(i => !i.startsWith('marco_') && !['aura_santidad', 'escudo_miguel', 'seguro_racha', 'pocion_sabiduria'].includes(i)).length > 0 && (
              <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10">
                <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest">🎒 Objetos especiales</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {usuario.inventario.map(item => {
                    if (item.startsWith('marco_') || ['aura_santidad', 'escudo_miguel', 'seguro_racha', 'pocion_sabiduria'].includes(item)) return null;
                    return <span key={item} className="bg-white/10 rounded-full px-2 py-1 text-[10px] font-black">{item.replace(/_/g, ' ')}</span>;
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="text-center text-white/10 text-[8px] font-black uppercase tracking-[0.5em] py-6">
        Miembro de la catequesis · San José Diriamba
      </div>
    </motion.div>
  );
};

export default PerfilPublico;