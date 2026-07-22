import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { useTitles } from '../context/TitlesContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import santosData from '../data/santos.json';
import AvatarSelector from '../components/AvatarSelector';
import CompartirProgreso from '../components/CompartirProgreso';
import MisEvaluaciones from '../components/MisEvaluaciones';
import { useToast } from '../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';

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

const Perfil = () => {
  const { showToast } = useToast();
  
  const {
    userDoc,
    usuarioId,
    nombre,
    grupo,
    monedas,
    nivelActual,
    rango,
    racha,
    vidas,
    inventario,
    cofresAbiertos,
    examenesAprobados,
    nivelesCompletados,
    coleccion,
  } = useGame();

  const {
    actualizarAvatar,
    cerrarSesion,
  } = useAuth();

  const {
    titulosDesbloqueados,
    tituloEquipado,
    equiparTitulo,
    marcosDesbloqueados,
    marcoEquipado,
    equiparMarco,
    logrosPendientes,
  } = useTitles();

  const [tab, setTab] = useState('info');
  const [selectorAbierto, setSelectorAbierto] = useState(false);
  const [biografia, setBiografia] = useState(userDoc?.biografia || '');
  const [santoFavorito, setSantoFavorito] = useState(userDoc?.santoFavorito || '');
  const [editandoBio, setEditandoBio] = useState(false);
  const [editandoSanto, setEditandoSanto] = useState(false);
  const [mostrarCompartir, setMostrarCompartir] = useState(false);
  const [equipando, setEquipando] = useState(null);

  const guardarBiografia = async () => {
    if (usuarioId) {
      await updateDoc(doc(db, 'usuarios', usuarioId), { biografia });
      showToast('📝 Biografía guardada', 'success');
    }
    setEditandoBio(false);
  };

  const guardarSantoFavorito = async () => {
    if (usuarioId) {
      await updateDoc(doc(db, 'usuarios', usuarioId), { santoFavorito });
      showToast('🙏 Santo favorito actualizado', 'success');
    }
    setEditandoSanto(false);
  };

  const avatar = userDoc?.avatar || '😇';
  const esImagen = avatar?.startsWith('data:image') || avatar?.startsWith('http') || avatar?.startsWith('/images/');
  const tieneAura = inventario.includes('aura_santidad');
  const marcoActivo = MARCOS_ESTILOS[marcoEquipado];
  const tituloObj = titulosDesbloqueados?.find(t => t.id === tituloEquipado);
  const santoFavObj = santosData.santos.find(s => s.id === santoFavorito);
  const santosColeccion = santosData.santos.filter(s => coleccion.includes(s.id));
  const progresoGlobal = (nivelActual / 17) * 100;
  const examenesCount = examenesAprobados?.length || 0;
  const nivelesCount = nivelesCompletados?.length || 0;

  const handleEquiparTitulo = async (id) => {
    setEquipando(id);
    const ok = await equiparTitulo(id);
    setEquipando(null);
    if (ok) showToast('🏆 Título equipado', 'success');
  };

  const handleEquiparMarco = async (id) => {
    setEquipando(id);
    const ok = await equiparMarco(id);
    setEquipando(null);
    if (ok) showToast('🖼️ Marco equipado', 'success');
  };

  const handleCerrarSesion = async () => {
    await cerrarSesion();
    showToast('👋 Hasta luego', 'info');
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };
  const stagger = {
    visible: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="min-h-screen text-white font-sans pb-28 relative"
    >
      {/* El fondo de la iglesia se ve a través del glassmorphism */}

      {/* Cabecera - Avatar y nombre */}
      <motion.div variants={fadeInUp} className="relative px-6 pt-8 pb-4">
        <div className="flex flex-col items-center text-center">
          <div className="relative group cursor-pointer" onClick={() => setSelectorAbierto(true)}>
            {tieneAura && !marcoActivo && (
              <div className="absolute -inset-3 rounded-full bg-yellow-400/30 animate-pulse blur-md" />
            )}
            {marcoActivo && (
              <div className={`absolute -inset-2 rounded-full bg-gradient-to-br ${marcoActivo.gradiente} opacity-80 blur-md animate-pulse`} />
            )}
            <div className={`relative w-32 h-32 rounded-full flex items-center justify-center overflow-hidden border-4 bg-white/5 shadow-2xl transition-all duration-300 group-hover:scale-105 ${
              marcoActivo ? `${marcoActivo.border} ${marcoActivo.shadow}` : 
              tieneAura ? 'border-yellow-400/60 shadow-[0_0_30px_rgba(250,204,21,0.5)]' : 
              'border-white/20'
            }`}>
              {esImagen ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl">{avatar}</span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                <span className="text-white text-xs font-black bg-black/60 px-3 py-1.5 rounded-full">✏️ Editar</span>
              </div>
            </div>
          </div>
          <h2 className={`text-3xl font-black tracking-tighter mt-5 ${tieneAura ? 'text-yellow-100' : 'text-white'}`}>
            {nombre}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${RAREZA_COLOR[tituloObj?.rareza || 'comun']}`}>
              {tituloObj?.nombre || 'Sin título'}
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 text-[10px] font-black text-white/70">
              {grupo}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tarjetas de estadísticas */}
      <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-3 px-6 mt-6">
        <div className="glass-card rounded-2xl p-4 text-center border border-white/10 hover:border-yellow-400/30 transition-all">
          <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">🏅 Nivel</p>
          <p className="text-3xl font-black text-white">{nivelActual}</p>
          <p className="text-[10px] text-yellow-400 font-black mt-1">{NIVEL_NOMBRE[nivelActual]}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center border border-yellow-400/20 hover:border-yellow-400/40 transition-all">
          <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">🪙 Monedas</p>
          <p className="text-3xl font-black text-yellow-400">{monedas.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center border border-white/10">
          <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">🔥 Racha</p>
          <p className="text-2xl font-black text-orange-400">{racha} días</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center border border-white/10">
          <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">❤️ Vidas</p>
          <div className="flex justify-center gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-xl ${i < vidas ? 'text-red-500 drop-shadow-glow' : 'text-white/20'}`}>❤️</span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeInUp} className="flex gap-2 mx-6 mt-8 bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/10">
        {['info', 'coleccion', 'stats', 'evaluaciones'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-full font-black text-sm uppercase tracking-widest transition-all ${
              tab === t ? 'bg-yellow-400 text-blue-900 shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            {t === 'info' && '📋 Información'}
            {t === 'coleccion' && '📖 Colección'}
            {t === 'stats' && '📊 Estadísticas'}
            {t === 'evaluaciones' && '📝 Evaluaciones'}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {/* TAB INFO */}
        {tab === 'info' && (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="px-6 mt-6 space-y-4 pb-6"
          >
            {/* Biografía */}
            <div className="glass-card rounded-2xl p-5 border border-white/10">
              <div className="flex justify-between items-center">
                <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest">📝 Biografía</p>
                {!editandoBio ? (
                  <button onClick={() => setEditandoBio(true)} className="text-white/40 hover:text-white text-xs transition-colors">✏️ Editar</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={guardarBiografia} className="text-green-400 text-xs hover:text-green-300">✓ Guardar</button>
                    <button onClick={() => { setEditandoBio(false); setBiografia(userDoc?.biografia || ''); }} className="text-red-400 text-xs hover:text-red-300">✗ Cancelar</button>
                  </div>
                )}
              </div>
              {editandoBio ? (
                <textarea
                  value={biografia}
                  onChange={e => setBiografia(e.target.value.slice(0, 120))}
                  maxLength="120"
                  className="w-full bg-white/10 rounded-xl p-3 text-sm text-white mt-2 outline-none focus:border-yellow-400 border border-transparent focus:border-yellow-400 transition-all"
                  rows="3"
                  placeholder="Escribe algo sobre ti..."
                />
              ) : (
                <p className="text-white/80 text-sm mt-2 leading-relaxed">{biografia || '✨ Aún no has escrito tu biografía. ¡Cuéntanos sobre ti!'}</p>
              )}
              {editandoBio && <p className="text-right text-[9px] text-white/30 mt-1">{biografia.length}/120</p>}
            </div>

            {/* Santo favorito */}
            <div className="glass-card rounded-2xl p-5 border border-white/10">
              <div className="flex justify-between items-center">
                <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest">🙏 Santo favorito</p>
                {!editandoSanto ? (
                  <button onClick={() => setEditandoSanto(true)} className="text-white/40 hover:text-white text-xs transition-colors">✏️ Editar</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={guardarSantoFavorito} className="text-green-400 text-xs hover:text-green-300">✓ Guardar</button>
                    <button onClick={() => { setEditandoSanto(false); setSantoFavorito(userDoc?.santoFavorito || ''); }} className="text-red-400 text-xs hover:text-red-300">✗ Cancelar</button>
                  </div>
                )}
              </div>
              {editandoSanto ? (
                <div className="mt-3 grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {santosData.santos.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSantoFavorito(s.id)}
                      className={`flex flex-col items-center p-2 rounded-xl transition-all ${santoFavorito === s.id ? 'bg-yellow-400/30 border border-yellow-400' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
                    >
                      <span className="text-2xl">{s.icono}</span>
                      <span className="text-[9px] font-black text-white truncate max-w-[60px]">{s.nombre}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-4 mt-3">
                  {santoFavObj ? (
                    <>
                      <span className="text-5xl">{santoFavObj.icono}</span>
                      <div>
                        <p className="font-black text-white">{santoFavObj.nombre}</p>
                        <p className="text-white/50 text-[10px]">{santoFavObj.rareza}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-white/50 text-sm">No has elegido un santo favorito aún.</p>
                  )}
                </div>
              )}
            </div>

            {/* Acciones */}
            <button
              onClick={() => setMostrarCompartir(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              📤 Compartir mi progreso
            </button>

            <button
              onClick={handleCerrarSesion}
              className="w-full py-4 rounded-2xl border border-red-500/30 text-red-400 font-black text-sm uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
            >
              🚪 Cerrar sesión
            </button>
          </motion.div>
        )}

        {/* TAB COLECCIÓN */}
        {tab === 'coleccion' && (
          <motion.div
            key="coleccion"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="px-6 mt-6 space-y-6 pb-6"
          >
            {/* Títulos */}
            {titulosDesbloqueados?.length > 0 && (
              <div>
                <h3 className="text-white font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                  🏆 Títulos ({titulosDesbloqueados.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {titulosDesbloqueados.map(t => {
                    const isEquipped = tituloEquipado === t.id;
                    return (
                      <div key={t.id} className={`glass-card rounded-xl p-3 flex justify-between items-center border transition-all ${isEquipped ? 'ring-2 ring-yellow-400 shadow-lg' : ''} ${RAREZA_COLOR[t.rareza]}`}>
                        <div>
                          <p className="font-black text-sm">{t.nombre}</p>
                          <p className="text-[9px] text-white/50">{t.rareza}</p>
                        </div>
                        <button
                          onClick={() => handleEquiparTitulo(t.id)}
                          disabled={equipando === t.id || isEquipped}
                          className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                            isEquipped 
                              ? 'bg-green-500/20 text-green-300 cursor-default' 
                              : 'bg-yellow-400 text-blue-900 hover:scale-105'
                          }`}
                        >
                          {equipando === t.id ? '...' : isEquipped ? '✓ Equipado' : 'Equipar'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Marcos */}
            {inventario.filter(i => i.startsWith('marco_')).length > 0 && (
              <div>
                <h3 className="text-white font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                  🖼️ Marcos
                </h3>
                <div className="space-y-2">
                  {inventario.filter(i => i.startsWith('marco_')).map(id => {
                    const estilo = MARCOS_ESTILOS[id];
                    if (!estilo) return null;
                    const isEquipped = marcoEquipado === id;
                    return (
                      <div key={id} className={`glass-card rounded-xl p-3 flex justify-between items-center border ${isEquipped ? 'ring-2 ring-yellow-400' : 'border-white/10'}`}>
                        <div>
                          <p className="font-black text-sm">{estilo.nombre}</p>
                          <p className="text-[9px] text-white/50">Cosmético</p>
                        </div>
                        <button
                          onClick={() => handleEquiparMarco(id)}
                          disabled={equipando === id || isEquipped}
                          className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                            isEquipped 
                              ? 'bg-green-500/20 text-green-300' 
                              : 'bg-yellow-400 text-blue-900 hover:scale-105'
                          }`}
                        >
                          {equipando === id ? '...' : isEquipped ? '✓ Equipado' : 'Equipar'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Santos */}
            {santosColeccion.length > 0 && (
              <div>
                <h3 className="text-white font-black text-sm uppercase tracking-wider mb-3">
                  📖 Santos ({santosColeccion.length}/{santosData.santos.length})
                </h3>
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {santosColeccion.map(s => (
                    <div key={s.id} className="glass-card rounded-xl p-2 text-center border border-white/10 hover:scale-105 transition-all">
                      <span className="text-3xl">{s.icono}</span>
                      <p className="font-black text-[9px] truncate mt-1">{s.nombre}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB ESTADÍSTICAS */}
        {tab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="px-6 mt-6 space-y-6 pb-6"
          >
            {/* Progreso */}
            <div className="glass-card rounded-2xl p-5 border border-white/10">
              <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">📊 Progreso general</p>
              <div className="h-3 bg-white/10 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-1000" style={{ width: `${progresoGlobal}%` }} />
              </div>
              <p className="text-white/60 text-sm mt-2">{Math.round(progresoGlobal)}% completado</p>
            </div>

            {/* Logros pendientes */}
            {logrosPendientes?.length > 0 && (
              <div className="glass-card rounded-2xl p-5 border border-purple-500/30 bg-purple-500/5">
                <p className="text-purple-300 text-[9px] font-black uppercase tracking-widest">✨ Logros por canjear</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {logrosPendientes.map(l => {
                    const titulo = titulosDesbloqueados?.find(t => t.id === l.id);
                    return <span key={l.id} className="bg-purple-500/20 px-2 py-1 rounded-full text-[10px] font-black">{titulo?.nombre || l.id}</span>;
                  })}
                </div>
              </div>
            )}

            {/* Estadísticas numéricas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card rounded-2xl p-4 text-center border border-white/10">
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">✅ Niveles</p>
                <p className="text-2xl font-black text-white">{nivelesCount}</p>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center border border-white/10">
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">🎓 Exámenes</p>
                <p className="text-2xl font-black text-white">{examenesCount}</p>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center border border-amber-400/20">
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">📦 Cofres</p>
                <p className="text-2xl font-black text-amber-400">{cofresAbiertos}</p>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center border border-white/10">
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">🛡️ Escudos</p>
                <p className="text-2xl font-black text-white">{inventario.filter(i => i === 'escudo_miguel').length}</p>
              </div>
            </div>

            {/* Gráfico de evolución */}
            <div className="glass-card rounded-2xl p-5 border border-white/10">
              <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">📈 Evolución de nivel</p>
              <div className="flex items-end gap-1 h-32 mt-3">
                {Array.from({ length: 17 }, (_, i) => i + 1).map(n => (
                  <div key={n} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-yellow-400/30 rounded-t transition-all" style={{ height: `${n <= nivelActual ? 40 : 0}px` }} />
                    <span className="text-[8px] text-white/40 mt-1">{n}</span>
                  </div>
                ))}
              </div>
              <p className="text-center text-white/40 text-[10px] mt-2">Nivel actual: {nivelActual}</p>
            </div>
          </motion.div>
        )}

        {/* TAB EVALUACIONES */}
        {tab === 'evaluaciones' && (
          <motion.div
            key="evaluaciones"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="px-6 mt-6 pb-6"
          >
            <MisEvaluaciones />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de avatar */}
      <AvatarSelector isOpen={selectorAbierto} onClose={() => setSelectorAbierto(false)} onSelectAvatar={actualizarAvatar} />

      {/* Modal para compartir progreso */}
      <CompartirProgreso
        isOpen={mostrarCompartir}
        onClose={() => setMostrarCompartir(false)}
        usuario={{
          nombre: nombre,
          avatar: avatar,
          rango: tituloObj?.nombre || rango,
        }}
        estadisticas={{
          nivel: nivelActual,
          racha: racha,
          monedas: monedas,
          cofres: cofresAbiertos,
        }}
      />
    </motion.div>
  );
};

export default Perfil;