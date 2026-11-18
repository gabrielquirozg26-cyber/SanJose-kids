import titulosCatalogo from '../data/titulos.json';
// src/views/Perfil.jsx
import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { useTitles } from '../context/TitlesContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import santosData from '../data/santos.json';
import nivelesData from '../data/niveles.json';
import { obtenerProgreso } from '../utils/progreso';
import AvatarSelector from '../components/AvatarSelector';
import CompartirProgreso from '../components/CompartirProgreso';
import AyudaLily from '../components/tutorial/AyudaLily';
import MisEvaluaciones from '../components/MisEvaluaciones';
import { useToast } from '../components/ui/Toast';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import CabeceraAventura from '../components/CabeceraAventura';
import ImagenJuego from '../components/ImagenJuego';

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

const lecciones = nivelesData.unidades.flatMap(unidad => unidad.lecciones);
const NIVEL_NOMBRE = Object.fromEntries(lecciones.map((leccion, indice) => [indice + 1, leccion.nombre]));
NIVEL_NOMBRE[lecciones.length + 1] = 'Recorrido completado';

const ProfileHeader = ({ avatar, esImagen, tieneAura, marcoActivo, marcoId, nombre, rango, tituloObj, grupo, onEditAvatar }) => <CabeceraAventura etiqueta="🧭 MI PASAPORTE DE AVENTURERO" titulo={nombre} descripcion="Este es tu rincón: tus amigos, tus logros y todo lo que vas aprendiendo.">
  <div className="perfil-credencial"><button data-marco={marcoId} className={'perfil-avatar ' + (tieneAura && !marcoActivo ? 'perfil-avatar-aura' : '')} onClick={onEditAvatar} aria-label="Cambiar mi avatar"><ImagenJuego src={esImagen ? avatar : null} nombre="Mi avatar" icono={esImagen ? '😇' : avatar}/><span>✏️ Cambiar</span></button><div><span className="juego-chip">🏅 {tituloObj?.nombre || rango || 'Tu próximo título te espera'}</span><p>⛪ {grupo || 'Mi comunidad de catequesis'}</p></div></div>
</CabeceraAventura>;

const StatsGrid = ({ nivelActual, monedas, racha, vidas, nivelNombre }) => <div className="perfil-estadisticas" aria-label="Mi progreso">
  <article className="juego-panel"><span aria-hidden="true">🏅</span><p>Mi nivel</p><strong>{nivelActual}</strong><small>{nivelNombre}</small></article>
  <article className="juego-panel"><span aria-hidden="true">🪙</span><p>Mis monedas</p><strong>{monedas.toLocaleString()}</strong><small>Ganadas en mi aventura</small></article>
  <article className="juego-panel"><span aria-hidden="true">🔥</span><p>Mi racha</p><strong>{racha} {racha === 1 ? 'día' : 'días'}</strong><small>¡Aprender deja huella!</small></article>
  <article className="juego-panel"><span aria-hidden="true">❤️</span><p>Mis vidas</p><strong>{vidas} / 5</strong><small aria-hidden="true">{Array.from({ length: 5 }, (_, i) => i < vidas ? '♥' : '♡').join(' ')}</small></article>
</div>;

const ProfileTabs = ({ tab, setTab }) => <nav className="juego-pestanas" aria-label="Secciones de mi perfil">{[['info', '👋 Sobre mí'], ['coleccion', '🎒 Mis tesoros'], ['stats', '🌟 Mi camino'], ['evaluaciones', '📝 Mi catequista']].map(([id, label]) => <button key={id} aria-pressed={tab === id} onClick={() => setTab(id)}>{label}</button>)}</nav>;

// ── COMPONENTES DE CADA TAB ─────────────────────────────────────────────

// TAB INFO
const TabInfo = ({ 
  biografia, setBiografia, editandoBio, setEditandoBio, guardarBiografia,
  santoFavorito, setSantoFavorito, editandoSanto, setEditandoSanto, guardarSantoFavorito,
  santoFavObj, userDoc, onCompartir, onCerrarSesion 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="px-4 sm:px-6 mt-6 space-y-4 pb-6"
    >
      {/* Biografía */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10">
        <div className="flex justify-between items-center">
          <p className="text-yellow-400 text-sm font-black uppercase tracking-widest">👋 Un poquito sobre mí</p>
          {!editandoBio ? (
            <button onClick={() => setEditandoBio(true)} className="text-slate-200 hover:text-white text-sm transition-colors">✏️ Editar</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={guardarBiografia} className="text-green-400 text-sm hover:text-green-300">✓ Guardar</button>
              <button onClick={() => { setEditandoBio(false); setBiografia(userDoc?.biografia || ''); }} className="text-red-400 text-sm hover:text-red-300">✗ Cancelar</button>
            </div>
          )}
        </div>
        {editandoBio ? (
          <textarea
            value={biografia}
            onChange={e => setBiografia(e.target.value.slice(0, 120))}
            maxLength="120"
            className="w-full bg-white/10 rounded-xl p-3 text-sm text-white mt-2 outline-none focus:border-yellow-400 border border-transparent focus:border-yellow-400 transition-all resize-none"
            rows="3"
            placeholder="¿Qué te gusta aprender?"
          />
        ) : (
          <p className="text-white/70 text-sm mt-2 leading-relaxed">{biografia || '✨ ¿Qué te gusta de esta aventura? Puedes contarlo aquí.'}</p>
        )}
        {editandoBio && <p className="text-right text-sm text-slate-200 mt-1">{biografia.length}/120</p>}
      </div>

      {/* Santo favorito */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10">
        <div className="flex justify-between items-center">
          <p className="text-yellow-400 text-sm font-black uppercase tracking-widest">🙏 Santo favorito</p>
          {!editandoSanto ? (
            <button onClick={() => setEditandoSanto(true)} className="text-slate-200 hover:text-white text-sm transition-colors">✏️ Editar</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={guardarSantoFavorito} className="text-green-400 text-sm hover:text-green-300">✓ Guardar</button>
              <button onClick={() => { setEditandoSanto(false); setSantoFavorito(userDoc?.santoFavorito || ''); }} className="text-red-400 text-sm hover:text-red-300">✗ Cancelar</button>
            </div>
          )}
        </div>
        {editandoSanto ? (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-80 overflow-y-auto">
            {santosData.santos.map(s => (
              <button
                key={s.id}
                onClick={() => setSantoFavorito(s.id)}
                className={`flex flex-col items-center p-2 rounded-xl transition-all ${santoFavorito === s.id ? 'bg-yellow-400/30 border border-yellow-400' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
              >
                <span className="text-2xl">{s.icono}</span>
                <span className="text-sm font-black text-white truncate max-w-full">{s.nombre}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-4 mt-3">
            {santoFavObj ? (
              <>
                <span className="text-4xl sm:text-5xl">{santoFavObj.icono}</span>
                <div>
                  <p className="font-black text-white text-sm sm:text-base">{santoFavObj.nombre}</p>
                  <p className="text-slate-200 text-sm">{santoFavObj.rareza}</p>
                </div>
              </>
            ) : (
              <p className="text-slate-200 text-sm">No has elegido un santo favorito aún.</p>
            )}
          </div>
        )}
      </div>

      {/* Acciones */}
      <button
        data-tutorial="compartir"
        onClick={onCompartir}
        className="w-full py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        📤 Compartir mi progreso
      </button>

      <button
        onClick={onCerrarSesion}
        className="w-full py-3 sm:py-4 rounded-2xl border border-red-500/30 text-red-400 font-black text-sm uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
      >
        🚪 Cerrar sesión
      </button>
    </motion.div>
  );
};

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────
const Perfil = () => {
  const { showToast } = useToast();
  
  const {
    userDoc,
    setActiveTab,
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
    try {
      if (!usuarioId) return;
      await updateDoc(doc(db, 'usuarios', usuarioId), { biografia });
      showToast('📝 Biografía guardada', 'success');
      setEditandoBio(false);
    } catch {
      showToast('No pudimos guardar. Tu texto sigue aquí para intentarlo otra vez.', 'error');
    }
  };

  const guardarSantoFavorito = async () => {
    try {
      if (!usuarioId) return;
      await updateDoc(doc(db, 'usuarios', usuarioId), { santoFavorito });
      showToast('🙏 Santo favorito actualizado', 'success');
      setEditandoSanto(false);
    } catch {
      showToast('No pudimos guardar tu elección. Intenta otra vez.', 'error');
    }
  };

  const avatar = userDoc?.avatar || '😇';
  const esImagen = avatar?.startsWith('data:image') || avatar?.startsWith('http') || avatar?.startsWith('/images/');
  const tieneAura = inventario.includes('aura_santidad');
  const marcoActivo = MARCOS_ESTILOS[marcoEquipado];
  const tituloObj = titulosDesbloqueados?.find(t => t.id === tituloEquipado);
  const santoFavObj = santosData.santos.find(s => s.id === santoFavorito);
  const santosColeccion = santosData.santos.filter(s => coleccion.includes(s.id));
  const progresoGlobal = obtenerProgreso(nivelesCompletados, nivelesData.unidades).porcentaje;
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

  return (
    <MotionConfig reducedMotion="user"><section className="zona-aventura zona-perfil">
      {/* ── HEADER ── */}
      <ProfileHeader
        avatar={avatar}
        esImagen={esImagen}
        tieneAura={tieneAura}
        marcoActivo={marcoActivo}
        marcoId={marcoEquipado}
        nombre={nombre}
        rango={rango}
        tituloObj={tituloObj}
        grupo={grupo}
        onEditAvatar={() => setSelectorAbierto(true)}
      />

      {/* ── STATS ── */}
      <StatsGrid
        nivelActual={nivelActual}
        monedas={monedas}
        racha={racha}
        vidas={vidas}
        nivelNombre={NIVEL_NOMBRE[nivelActual] || 'Iniciado'}
      />

      {/* ── TABS ── */}
      <AyudaLily/>
      <ProfileTabs tab={tab} setTab={setTab} />

      {/* ── CONTENIDO ── */}
      <AnimatePresence mode="wait">
        {tab === 'info' && (
          <TabInfo
            biografia={biografia}
            setBiografia={setBiografia}
            editandoBio={editandoBio}
            setEditandoBio={setEditandoBio}
            guardarBiografia={guardarBiografia}
            santoFavorito={santoFavorito}
            setSantoFavorito={setSantoFavorito}
            editandoSanto={editandoSanto}
            setEditandoSanto={setEditandoSanto}
            guardarSantoFavorito={guardarSantoFavorito}
            santoFavObj={santoFavObj}
            userDoc={userDoc}
            onCompartir={() => setMostrarCompartir(true)}
            onCerrarSesion={handleCerrarSesion}
          />
        )}

        {tab === 'coleccion' && (
          <motion.div
            key="coleccion"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="px-4 sm:px-6 mt-6 space-y-6 pb-6"
          >
            <aside className="juego-nota"><span aria-hidden="true">🏅</span><p><strong>Tu mochila cuenta tu historia</strong><br/>Elige un título o un marco para llevarlo en tu perfil.</p><button className="juego-btn" onClick={() => setActiveTab('misiones')}>Ver mis premios →</button></aside>
            {!titulosDesbloqueados.length && !marcosDesbloqueados.length && !santosColeccion.length && <div className="juego-vacio"><h2>¡Tu primer tesoro te espera!</h2><p>Completa una lección nueva para ganar un cofre.</p><button className="juego-btn" onClick={() => setActiveTab('mapa')}>¡Vamos al mapa!</button></div>}
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
                          <p className="text-sm text-slate-200">{t.rareza}</p>
                        </div>
                        <button
                          onClick={() => handleEquiparTitulo(t.id)}
                          disabled={equipando === t.id || isEquipped}
                          className={`px-3 py-1 rounded-xl text-sm font-black transition-all ${
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
            {marcosDesbloqueados.length > 0 && (
              <div>
                <h3 className="text-white font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                  🖼️ Marcos
                </h3>
                <div className="space-y-2">
                  {marcosDesbloqueados.map(id => {
                    const estilo = MARCOS_ESTILOS[id];
                    if (!estilo) return null;
                    const isEquipped = marcoEquipado === id;
                    return (
                      <div key={id} className={`glass-card rounded-xl p-3 flex justify-between items-center border ${isEquipped ? 'ring-2 ring-yellow-400' : 'border-white/10'}`}>
                        <div>
                          <p className="font-black text-sm">{estilo.nombre}</p>
                          <p className="text-sm text-slate-200">Cosmético</p>
                        </div>
                        <button
                          onClick={() => handleEquiparMarco(id)}
                          disabled={equipando === id || isEquipped}
                          className={`px-3 py-1 rounded-xl text-sm font-black transition-all ${
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
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                  {santosColeccion.map(s => (
                    <div key={s.id} className="glass-card rounded-xl p-2 text-center border border-white/10 hover:scale-105 transition-all">
                      <span className="text-2xl sm:text-3xl">{s.icono}</span>
                      <p className="font-black text-sm truncate mt-1">{s.nombre}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {tab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="px-4 sm:px-6 mt-6 space-y-6 pb-6"
          >
            {/* Progreso */}
            <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10">
              <p className="text-slate-200 text-sm font-black uppercase tracking-widest">📊 Progreso general</p>
              <div className="h-2 sm:h-3 bg-white/10 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-1000" style={{ width: `${progresoGlobal}%` }} />
              </div>
              <p className="text-white/60 text-sm mt-2">{Math.round(progresoGlobal)}% completado</p>
            </div>

            {/* Logros pendientes */}
            {logrosPendientes?.length > 0 && (
              <div className="glass-card rounded-2xl p-4 sm:p-5 border border-purple-500/30 bg-purple-500/5">
                <p className="text-purple-300 text-sm font-black uppercase tracking-widest">✨ Logros por canjear</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {logrosPendientes.map(l => {
                    const titulo = titulosCatalogo.porNivel.find(t => t.id === l.id);
                    return <span key={l.id} className="bg-purple-500/20 px-2 py-1 rounded-full text-sm font-black">{titulo?.nombre || l.id}</span>;
                  })}
                </div>
              </div>
            )}

            {/* Estadísticas numéricas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card rounded-2xl p-3 sm:p-4 text-center border border-white/10">
                <p className="text-slate-200 text-sm font-black uppercase tracking-widest">✅ Niveles</p>
                <p className="text-xl sm:text-2xl font-black text-white">{nivelesCount}</p>
              </div>
              <div className="glass-card rounded-2xl p-3 sm:p-4 text-center border border-white/10">
                <p className="text-slate-200 text-sm font-black uppercase tracking-widest">🎓 Exámenes</p>
                <p className="text-xl sm:text-2xl font-black text-white">{examenesCount}</p>
              </div>
              <div className="glass-card rounded-2xl p-3 sm:p-4 text-center border border-amber-400/20">
                <p className="text-slate-200 text-sm font-black uppercase tracking-widest">📦 Cofres</p>
                <p className="text-xl sm:text-2xl font-black text-amber-400">{cofresAbiertos}</p>
              </div>
              <div className="glass-card rounded-2xl p-3 sm:p-4 text-center border border-white/10">
                <p className="text-slate-200 text-sm font-black uppercase tracking-widest">🛡️ Escudos</p>
                <p className="text-xl sm:text-2xl font-black text-white">{inventario.filter(i => i === 'escudo_miguel').length}</p>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10">
              <p className="text-white text-base font-bold">Lecciones completadas</p>
              <p className="text-white text-base mt-2">{nivelesCount} de {nivelesData.unidades.reduce((total, u) => total + u.lecciones.length, 0)} lecciones · Nivel actual: {nivelActual}</p>
              <p className="text-white text-sm mt-2">Reclama tus títulos ganados en la pestaña Misiones.</p>
            </div>
          </motion.div>
        )}

        {tab === 'evaluaciones' && (
          <motion.div
            key="evaluaciones"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="px-4 sm:px-6 mt-6 pb-6"
          >
            <MisEvaluaciones />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modales */}
      <AvatarSelector isOpen={selectorAbierto} onClose={() => setSelectorAbierto(false)} onSelectAvatar={actualizarAvatar} />
      <CompartirProgreso
        progreso={{ ...userDoc, nivelesCompletados }}
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
    </section></MotionConfig>
  );
};

export default Perfil;
