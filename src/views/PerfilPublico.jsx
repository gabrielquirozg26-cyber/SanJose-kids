import React, { useState, useEffect } from 'react';
import santosData from '../data/santos.json';
import { motion, AnimatePresence } from 'framer-motion';

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

const PerfilPublico = ({ usuario, onVolver }) => {
  const [cargando, setCargando] = useState(true);
  const [showFullBio, setShowFullBio] = useState(false);
  
  useEffect(() => {
    // Simular una pequeña carga para la animación de entrada
    const timer = setTimeout(() => setCargando(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const marco = getMarco(usuario.inventario);
  const aura = tieneAura(usuario.inventario);
  const avatar = usuario.avatar || '😇';
  const tituloObj = usuario.titulosDesbloqueados?.find(t => t.id === usuario.tituloEquipado);
  const santoFavoritoObj = santosData.santos.find(s => s.id === usuario.santoFavorito);
  const santosColeccion = santosData.santos.filter(s => usuario.coleccion?.includes(s.id));
  const nivelesCompletados = usuario.nivelesCompletados?.length || 0;
  const examenesAprobados = usuario.examenesAprobados?.length || 0;
  const progresoGlobal = (usuario.nivelActual / 17) * 100;
  const biografiaCorta = usuario.biografia?.length > 100 ? usuario.biografia.slice(0, 100) + '...' : usuario.biografia;

  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };
  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 12 } }
  };
  const glowVariants = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.3, 0.6, 0.3],
      transition: { repeat: Infinity, duration: 3, ease: "easeInOut" }
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-yellow-400 text-xs font-black">✨</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen text-white font-sans pb-28 relative overflow-hidden"
    >
      {/* Fondo animado con partículas sutiles */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-purple-900/30 to-transparent" />
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute top-20 left-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -80, 0], y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="absolute bottom-20 right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Botón volver mejorado */}
      <motion.div variants={itemVariants} className="sticky top-0 z-30 backdrop-blur-xl bg-black/30 p-4 border-b border-white/5">
        <button 
          onClick={onVolver} 
          className="group flex items-center gap-2 text-white/60 hover:text-white transition-all duration-300 text-sm font-black uppercase tracking-wider"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform">←</span> 
          Volver al ranking
        </button>
      </motion.div>

      {/* Tarjeta principal tipo "medalla" */}
      <motion.div variants={itemVariants} className="relative mx-6 mt-8 mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-amber-500/10 to-transparent rounded-3xl blur-xl" />
        <div className="relative glass-card rounded-3xl p-6 border border-white/20 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Brillo dorado animado detrás */}
          <motion.div
            variants={glowVariants}
            animate="animate"
            className="absolute -inset-1 bg-gradient-to-r from-yellow-400/0 via-yellow-400/20 to-yellow-400/0 rounded-3xl pointer-events-none"
          />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Avatar con marco y aura */}
            <div className="relative group">
              {aura && !marco && (
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -inset-3 rounded-full bg-yellow-400/20 blur-md"
                />
              )}
              {marco && (
                <div className={`absolute -inset-2 rounded-full bg-gradient-to-br ${marco.gradiente} opacity-80 blur-md`} />
              )}
              <div className={`relative w-32 h-32 rounded-full flex items-center justify-center overflow-hidden border-4 bg-black/30 shadow-2xl transition-all duration-300 ${
                marco ? `${marco.border} ${marco.shadow}` : 
                aura ? 'border-yellow-400/60 shadow-[0_0_30px_rgba(250,204,21,0.5)]' : 
                'border-white/20'
              }`}>
                {avatar?.startsWith('data:image') || avatar?.startsWith('http') || avatar?.startsWith('/images/') ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl">{avatar || '😇'}</span>
                )}
              </div>
              {/* Ícono de verificación si tiene título legendario */}
              {tituloObj?.rareza === 'legendario' && (
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1 shadow-lg">
                  <span className="text-xs">👑</span>
                </div>
              )}
            </div>

            <h2 className={`text-3xl font-black tracking-tighter mt-5 ${aura ? 'text-yellow-100' : 'text-white'}`}>
              {usuario.nombre}
            </h2>
            
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${RAREZA_COLOR[tituloObj?.rareza || 'comun']}`}>
                {tituloObj?.nombre || 'Sin título'}
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 text-[10px] font-black">
                {usuario.grupo}
              </div>
            </div>

            {/* Estadísticas rápidas en línea */}
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                <span>🏅</span> <span className="font-black">{usuario.nivelActual}</span>
              </div>
              <div className="flex items-center gap-1 bg-yellow-400/20 px-3 py-1 rounded-full">
                <span>🪙</span> <span className="font-black">{usuario.monedas?.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 bg-orange-400/20 px-3 py-1 rounded-full">
                <span>🔥</span> <span className="font-black">{usuario.racha || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Biografía con botón "ver más" */}
      {usuario.biografia && (
        <motion.div variants={itemVariants} className="mx-6 mb-4">
          <div className="glass-card rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📝</span>
              <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest">Biografía</p>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              {showFullBio ? usuario.biografia : biografiaCorta}
            </p>
            {usuario.biografia?.length > 100 && (
              <button
                onClick={() => setShowFullBio(!showFullBio)}
                className="mt-2 text-yellow-400 text-[10px] font-black uppercase tracking-wider hover:text-yellow-300 transition-colors"
              >
                {showFullBio ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Santo favorito con tarjeta destacada */}
      {santoFavoritoObj && (
        <motion.div variants={itemVariants} className="mx-6 mb-4">
          <div className="glass-card rounded-2xl p-4 border border-yellow-400/20 bg-gradient-to-r from-yellow-400/5 to-transparent">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{santoFavoritoObj.icono}</span>
              <div>
                <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest">Santo favorito</p>
                <p className="text-white font-black text-lg">{santoFavoritoObj.nombre}</p>
                <p className="text-white/50 text-[10px]">{santoFavoritoObj.rareza}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Estadísticas en tarjetas expandidas */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 mx-6 mb-6">
        <div className="glass-card rounded-2xl p-3 text-center border border-white/10 hover:border-yellow-400/30 transition-all">
          <p className="text-white/40 text-[9px] font-black">📦 Cofres</p>
          <p className="text-2xl font-black text-amber-400">{usuario.cofresAbiertos || 0}</p>
        </div>
        <div className="glass-card rounded-2xl p-3 text-center border border-white/10">
          <p className="text-white/40 text-[9px] font-black">✅ Niveles</p>
          <p className="text-2xl font-black text-white">{nivelesCompletados}</p>
        </div>
        <div className="glass-card rounded-2xl p-3 text-center border border-white/10">
          <p className="text-white/40 text-[9px] font-black">🎓 Exámenes</p>
          <p className="text-2xl font-black text-white">{examenesAprobados}</p>
        </div>
        <div className="glass-card rounded-2xl p-3 text-center border border-white/10">
          <p className="text-white/40 text-[9px] font-black">🏆 Ranking</p>
          <p className="text-2xl font-black text-yellow-400">#{usuario.posicionGlobal || '—'}</p>
        </div>
      </motion.div>

      {/* Barra de progreso con gradiente animado */}
      <motion.div variants={itemVariants} className="glass-card rounded-2xl p-4 mx-6 mb-6">
        <p className="text-white/40 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
          <span>📊</span> Progreso general
        </p>
        <div className="h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progresoGlobal}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
          />
        </div>
        <div className="flex justify-between text-[10px] text-white/50 mt-1">
          <span>Nivel {usuario.nivelActual}</span>
          <span>17</span>
        </div>
        <p className="text-white/60 text-xs mt-2">{Math.round(progresoGlobal)}% completado</p>
      </motion.div>

      {/* Sección de títulos con scroll horizontal */}
      {usuario.titulosDesbloqueados?.length > 0 && (
        <motion.div variants={itemVariants} className="mx-6 mb-6">
          <h3 className="text-white font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>🏆</span> Títulos ({usuario.titulosDesbloqueados.length})
          </h3>
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
            {usuario.titulosDesbloqueados.map(t => (
              <div key={t.id} className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-[10px] font-black ${RAREZA_COLOR[t.rareza]}`}>
                {t.nombre}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Logros pendientes destacados */}
      {usuario.logrosPendientes?.length > 0 && (
        <motion.div variants={itemVariants} className="mx-6 mb-6">
          <div className="glass-card rounded-2xl p-4 border border-purple-500/30 bg-purple-500/5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">✨</span>
              <p className="text-purple-300 text-[10px] font-black uppercase tracking-widest">Logros por canjear</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {usuario.logrosPendientes.map(l => {
                const titulo = usuario.titulosDesbloqueados?.find(t => t.id === l.id);
                return (
                  <span key={l.id} className="bg-purple-500/20 px-2 py-1 rounded-full text-[10px] font-black text-purple-200">
                    {titulo?.nombre || l.id}
                  </span>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Santos coleccionados en grid interactivo */}
      {santosColeccion.length > 0 && (
        <motion.div variants={itemVariants} className="mx-6 mb-6">
          <h3 className="text-white font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>📖</span> Santos ({santosColeccion.length}/{santosData.santos.length})
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {santosColeccion.slice(0, 8).map(s => (
              <div
                key={s.id}
                className="glass-card rounded-xl p-2 text-center border border-white/10 hover:scale-105 transition-all duration-200 cursor-help group"
                title={s.nombre}
              >
                <span className="text-2xl">{s.icono}</span>
                <p className="font-black text-[8px] truncate mt-1">{s.nombre}</p>
              </div>
            ))}
            {santosColeccion.length > 8 && (
              <div className="glass-card rounded-xl p-2 text-center flex items-center justify-center text-xs font-black text-white/60">
                +{santosColeccion.length - 8}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <motion.div variants={itemVariants} className="text-center text-white/20 text-[9px] font-black uppercase tracking-[0.3em] py-6">
        Miembro de la catequesis · San José Diriamba
      </motion.div>

      {/* Estilos adicionales para scrollbar oculto en títulos */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </motion.div>
  );
};

export default PerfilPublico;