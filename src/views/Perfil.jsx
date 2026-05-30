import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import AvatarSelector from '../components/AvatarSelector';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import santosData from '../data/santos.json';

// Mapa de niveles a nombres
const NIVEL_NOMBRE = {
  1:'Padre Nuestro',2:'Ave María',3:'Gloria',4:'Ángel de la Guarda',
  5:'Yo Confieso',6:'Acto de Contrición',7:'Dulce Madre',
  8:'Credo Apostólico',9:'La Salve',10:'10 Mandamientos',
  11:'Bienaventuranzas',12:'7 Sacramentos',13:'Obras de Misericordia',
  14:'Misterios Gozosos',15:'Misterios Dolorosos',
  16:'Misterios Gloriosos',17:'Misterios Luminosos',
};

// Colores de rareza para títulos
const RAREZA_COLOR = {
  comun: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  raro: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  epico: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
  legendario: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
  mitico: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
  divino: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
};

// Estilos visuales de los marcos disponibles
const MARCOS_ESTILOS = {
  marco_vitral_azul: {
    nombre: 'Marco Vitral Azul',
    border: 'border-blue-400',
    shadow: 'shadow-[0_0_20px_rgba(96,165,250,0.5)]',
    gradiente: 'from-blue-600 to-cyan-400',
  },
  marco_vitral_dorado: {
    nombre: 'Marco Vitral Dorado',
    border: 'border-yellow-400',
    shadow: 'shadow-[0_0_20px_rgba(250,204,21,0.6)]',
    gradiente: 'from-yellow-500 to-amber-300',
  },
};

const Perfil = () => {
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
    cerrarSesion,
    cofresAbiertos,
    actualizarAvatar,
    titulosDesbloqueados,
    tituloEquipado,
    equiparTitulo,
    marcoEquipado,
    equiparMarco,
    coleccion,
  } = useGame();

  // Estados de la UI
  const [tab, setTab] = useState('info');
  const [selectorAbierto, setSelectorAbierto] = useState(false);
  const [biografia, setBiografia] = useState(userDoc?.biografia || '');
  const [santoFavorito, setSantoFavorito] = useState(userDoc?.santoFavorito || '');
  const [editandoBio, setEditandoBio] = useState(false);
  const [editandoSanto, setEditandoSanto] = useState(false);
  const [equipandoTitulo, setEquipandoTitulo] = useState(false);
  const [equipandoMarco, setEquipandoMarco] = useState(false);

  // Guardar cambios
  const guardarBiografia = async () => {
    if (usuarioId) await updateDoc(doc(db, 'usuarios', usuarioId), { biografia });
    setEditandoBio(false);
  };
  const guardarSantoFavorito = async () => {
    if (usuarioId) await updateDoc(doc(db, 'usuarios', usuarioId), { santoFavorito });
    setEditandoSanto(false);
  };

  // Avatar actual (imagen o emoji)
  const avatarActual = userDoc?.avatar || '😇';
  const esImagen = avatarActual?.startsWith('data:image') || avatarActual?.startsWith('http') || avatarActual?.startsWith('/images/');

  // Aura de santidad (si está en inventario)
  const tieneAura = inventario.includes('aura_santidad');

  // Título equipado
  const tituloActualObj = titulosDesbloqueados?.find(t => t.id === tituloEquipado);
  const tituloNombre = tituloActualObj?.nombre || 'Sin título';
  const tituloRareza = tituloActualObj?.rareza || 'comun';
  const tituloEstilo = RAREZA_COLOR[tituloRareza] || RAREZA_COLOR.comun;

  // Marco activo
  const marcoActivo = MARCOS_ESTILOS[marcoEquipado] || null;

  // Progreso global
  const progresoGlobal = (nivelActual / 17) * 100;

  // Colecciones
  const santosColeccion = santosData.santos.filter(s => coleccion.includes(s.id));
  const titulosLista = titulosDesbloqueados || [];
  // Obtener marcos desde inventario (IDs que empiecen por 'marco_')
  const marcosDesdeInventario = inventario.filter(item => item.startsWith('marco_'));
  const marcosUnicos = [...new Set(marcosDesdeInventario)];

  // Depuración en consola (para verificar que los marcos llegan)
  useEffect(() => {
    console.log('📦 Inventario completo:', inventario);
    console.log('🖼️ Marcos detectados:', marcosDesdeInventario);
  }, [inventario, marcosDesdeInventario]);

  // Handlers para equipar
  const handleEquiparTitulo = async (tituloId) => {
    setEquipandoTitulo(true);
    await equiparTitulo(tituloId);
    setEquipandoTitulo(false);
  };
  const handleEquiparMarco = async (marcoId) => {
    setEquipandoMarco(true);
    await equiparMarco(marcoId);
    setEquipandoMarco(false);
  };

  return (
    <div className="py-6 space-y-5 animate-slide-up">
      {/* ── CABECERA DEL PERFIL ── */}
      <div className="glass-card rounded-3xl p-6 text-center relative overflow-hidden">
        {tieneAura && (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/5 to-transparent pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-400/10 rounded-full blur-[80px]" />
          </>
        )}
        <button onClick={() => setSelectorAbierto(true)} className="absolute top-4 right-4 bg-white/10 rounded-full p-2 text-white/60 hover:bg-white/20 transition-all">✏️</button>

        <div className="relative inline-block mx-auto cursor-pointer group" onClick={() => setSelectorAbierto(true)}>
          {/* Efecto de aura si no hay marco */}
          {tieneAura && !marcoActivo && (
            <div className="absolute -inset-2 rounded-full bg-yellow-400/20 animate-pulse blur-[4px]" />
          )}
          {/* Marco activo (si está equipado) */}
          {marcoActivo && (
            <div className={`absolute -inset-1.5 rounded-full bg-gradient-to-br ${marcoActivo.gradiente} opacity-80 blur-[2px] animate-pulse`} />
          )}
          <div className={`relative w-28 h-28 rounded-full flex items-center justify-center overflow-hidden border-4 bg-white/5 ${
            marcoActivo ? `${marcoActivo.border} ${marcoActivo.shadow}` : tieneAura ? 'border-yellow-400/60 shadow-[0_0_25px_rgba(250,204,21,0.4)]' : 'border-white/20'
          }`}>
            {esImagen ? <img src={avatarActual} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-5xl">{avatarActual}</span>}
          </div>
          <div className="absolute bottom-0 right-0 bg-yellow-400 rounded-full p-1 text-black text-xs shadow-lg">📷</div>
        </div>

        <h2 className={`text-2xl font-black tracking-tighter mt-4 ${tieneAura ? 'text-yellow-100' : 'text-white'}`}>{nombre}</h2>
        <div className={`inline-block mt-1 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${tituloEstilo}`}>
          {tituloNombre}
        </div>
        <p className="text-white/30 text-xs mt-1">{grupo}</p>

        {/* Biografía editable */}
        <div className="mt-4 bg-white/5 rounded-2xl p-3 text-left">
          <div className="flex justify-between items-center">
            <span className="text-yellow-400 text-[10px] font-black uppercase tracking-widest">📝 Biografía</span>
            {!editandoBio ? (
              <button onClick={() => setEditandoBio(true)} className="text-white/40 text-xs hover:text-white">✏️</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={guardarBiografia} className="text-green-400 text-xs">✓</button>
                <button onClick={() => { setEditandoBio(false); setBiografia(userDoc?.biografia || ''); }} className="text-red-400 text-xs">✗</button>
              </div>
            )}
          </div>
          {editandoBio ? (
            <div>
              <textarea value={biografia} onChange={e => setBiografia(e.target.value.slice(0,100))} maxLength="100" className="w-full bg-white/10 rounded-xl p-2 text-sm text-white mt-1 outline-none focus:border-yellow-400" rows="2" placeholder="Escribe algo sobre ti..." />
              <p className="text-right text-[9px] text-white/30 mt-1">{biografia.length}/100</p>
            </div>
          ) : (
            <p className="text-white/70 text-sm mt-1">{biografia || 'Sin biografía aún.'}</p>
          )}
        </div>

        {/* Santo favorito (selector visual) */}
        <div className="mt-3 bg-white/5 rounded-2xl p-3">
          <div className="flex justify-between items-center">
            <span className="text-yellow-400 text-[10px] font-black uppercase tracking-widest">🙏 Santo favorito</span>
            {!editandoSanto ? (
              <button onClick={() => setEditandoSanto(true)} className="text-white/40 text-xs hover:text-white">✏️</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={guardarSantoFavorito} className="text-green-400 text-xs">✓</button>
                <button onClick={() => { setEditandoSanto(false); setSantoFavorito(userDoc?.santoFavorito || ''); }} className="text-red-400 text-xs">✗</button>
              </div>
            )}
          </div>
          {editandoSanto ? (
            <div className="mt-2 grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {santosData.santos.map(s => (
                <button key={s.id} onClick={() => setSantoFavorito(s.id)} className={`flex flex-col items-center p-2 rounded-xl transition-all ${santoFavorito === s.id ? 'bg-yellow-400/30 border border-yellow-400' : 'bg-white/5 border border-white/10'}`}>
                  <span className="text-3xl">{s.icono}</span>
                  <span className="text-[9px] font-black text-white truncate max-w-[60px]">{s.nombre}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-white/70 text-sm mt-1 flex items-center gap-2">
              {santoFavorito ? (
                <>
                  <span className="text-2xl">{santosData.santos.find(s => s.id === santoFavorito)?.icono || '🙏'}</span>
                  <span>{santosData.santos.find(s => s.id === santoFavorito)?.nombre}</span>
                </>
              ) : (
                'No seleccionado'
              )}
            </p>
          )}
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-2 bg-white/5 rounded-full p-1">
        <button onClick={() => setTab('info')} className={`flex-1 py-2 rounded-full font-black text-sm uppercase ${tab === 'info' ? 'bg-yellow-400 text-blue-900' : 'text-white/60'}`}>Información</button>
        <button onClick={() => setTab('coleccion')} className={`flex-1 py-2 rounded-full font-black text-sm uppercase ${tab === 'coleccion' ? 'bg-yellow-400 text-blue-900' : 'text-white/60'}`}>Colección</button>
        <button onClick={() => setTab('stats')} className={`flex-1 py-2 rounded-full font-black text-sm uppercase ${tab === 'stats' ? 'bg-yellow-400 text-blue-900' : 'text-white/60'}`}>Estadísticas</button>
      </div>

      {/* ── TAB INFORMACIÓN ── */}
      {tab === 'info' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card rounded-2xl p-4 text-center"><p className="text-white/40 text-[9px] font-black">🏅 Nivel</p><p className="text-white font-black text-2xl">{nivelActual}</p></div>
            <div className="glass-card rounded-2xl p-4 text-center border border-yellow-400/20"><p className="text-white/40 text-[9px] font-black">🪙 Monedas</p><p className="text-yellow-400 font-black text-2xl">{monedas}</p></div>
            <div className="glass-card rounded-2xl p-4 text-center"><p className="text-white/40 text-[9px] font-black">🔥 Racha</p><p className="text-orange-400 font-black text-2xl">{racha} días</p></div>
            <div className="glass-card rounded-2xl p-4 text-center"><p className="text-white/40 text-[9px] font-black">❤️ Vidas</p><p className="text-white font-black text-2xl">{vidas}/5</p></div>
          </div>
          <div className="glass-card rounded-2xl p-4"><p className="text-white/40 text-[9px] font-black">📦 Cofres abiertos</p><p className="text-amber-400 font-black text-xl">{cofresAbiertos}</p></div>
          {inventario.length > 0 && (
            <div className="glass-card rounded-2xl p-4">
              <p className="text-white/40 text-[9px] font-black mb-2">🎒 Objetos equipados</p>
              <div className="flex flex-wrap gap-2">
                {inventario.map(item => <span key={item} className="bg-white/5 rounded-full px-2 py-1 text-xs">{item.replace(/_/g, ' ')}</span>)}
              </div>
            </div>
          )}
          <button onClick={cerrarSesion} className="w-full py-3 rounded-2xl border border-red-500/30 text-red-400 font-black text-sm uppercase tracking-widest hover:bg-red-500/10">Cerrar sesión</button>
        </div>
      )}

      {/* ── TAB COLECCIÓN (títulos, marcos, santos) ── */}
      {tab === 'coleccion' && (
        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
          {/* Títulos */}
          {titulosLista.length > 0 ? (
            <div>
              <h3 className="text-white font-black text-sm uppercase tracking-wider mb-2">🏆 Títulos desbloqueados</h3>
              <div className="grid grid-cols-1 gap-2">
                {titulosLista.map(t => {
                  const isEquipped = tituloEquipado === t.id;
                  return (
                    <div key={t.id} className={`glass-card rounded-xl p-3 flex justify-between items-center border ${RAREZA_COLOR[t.rareza]} ${isEquipped ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/30' : ''}`}>
                      <div><p className="font-black text-sm">{t.nombre}</p><span className="text-[9px] text-white/50">{t.rareza}</span></div>
                      <button onClick={() => handleEquiparTitulo(t.id)} disabled={equipandoTitulo || isEquipped} className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${isEquipped ? 'bg-green-500/20 text-green-300 cursor-default' : 'bg-yellow-400 text-blue-900 hover:scale-105'}`}>
                        {isEquipped ? '✓ Equipado' : 'Equipar'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-white/40 text-sm">Aún no tienes títulos desbloqueados. Completa niveles o compra en la tienda.</div>
          )}

          {/* Marcos (desde inventario) */}
          {marcosUnicos.length > 0 ? (
            <div>
              <h3 className="text-white font-black text-sm uppercase tracking-wider mb-2">🖼️ Marcos desbloqueados</h3>
              <div className="grid grid-cols-1 gap-2">
                {marcosUnicos.map(id => {
                  const estilo = MARCOS_ESTILOS[id];
                  if (!estilo) return null;
                  const isEquipped = marcoEquipado === id;
                  return (
                    <div key={id} className={`glass-card rounded-xl p-3 flex justify-between items-center border ${isEquipped ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/30' : 'border-white/10'}`}>
                      <div><p className="font-black text-sm">{estilo.nombre}</p><span className="text-[9px] text-white/50">Cosmético</span></div>
                      <button onClick={() => handleEquiparMarco(id)} disabled={equipandoMarco || isEquipped} className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${isEquipped ? 'bg-green-500/20 text-green-300 cursor-default' : 'bg-yellow-400 text-blue-900 hover:scale-105'}`}>
                        {isEquipped ? '✓ Equipado' : 'Equipar'}
                      </button>
                      {/* Botón de depuración */}
                    
                    </div>
                  );
                })}
              </div>
            </div>
            
          ) : (
            <div className="text-center py-6 text-white/40 text-sm">
              No tienes marcos. Cómpralos en la tienda.
              {inventario.length > 0 && <div className="text-[10px] mt-1">(Inventario: {inventario.join(', ')})</div>}
            </div>
          )}

          {/* Santos coleccionados */}
          {santosColeccion.length > 0 ? (
            <div>
              <h3 className="text-white font-black text-sm uppercase tracking-wider mb-2">📖 Santos coleccionados</h3>
              <div className="grid grid-cols-3 gap-2">
                {santosColeccion.map(s => (
                  <div key={s.id} className="glass-card rounded-xl p-2 text-center border border-white/10">
                    <span className="text-3xl">{s.icono}</span>
                    <p className="font-black text-[9px] truncate">{s.nombre}</p>
                  </div>
                ))}
              </div>
              <p className="text-white/30 text-[10px] text-center mt-2">{santosColeccion.length} / {santosData.santos.length} santos</p>
            </div>
          ) : (
            <div className="text-center py-6 text-white/40 text-sm">Aún no has coleccionado santos. Abre cofres para obtenerlos.</div>
          )}
        </div>
      )}

      {/* ── TAB ESTADÍSTICAS ── */}
      {tab === 'stats' && (
        <div className="space-y-5">
          <div className="glass-card rounded-2xl p-4">
            <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">📊 Progreso general</p>
            <div className="h-2 bg-white/10 rounded-full mt-2">
              <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full" style={{ width: `${progresoGlobal}%` }} />
            </div>
            <p className="text-white/60 text-xs mt-1">{Math.round(progresoGlobal)}% completado</p>
          </div>
          <div className="glass-card rounded-2xl p-4">
            <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">📈 Evolución de nivel</p>
            <div className="flex items-end gap-1 h-32 mt-2">
              {Array.from({ length: 17 }, (_, i) => i + 1).map(n => (
                <div key={n} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-yellow-400/30 rounded-t" style={{ height: `${n <= nivelActual ? 40 : 0}px` }} />
                  <span className="text-[8px] text-white/40 mt-1">{n}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-2xl p-4">
            <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">🏆 Logros destacados</p>
            <p className="text-white/70 text-sm mt-1">✨ Primera lección completada<br />🔥 Racha de 7 días<br />📖 Álbum iniciado</p>
          </div>
          <button onClick={() => window.dispatchEvent(new CustomEvent('compartirProgreso'))} className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black text-sm uppercase tracking-widest hover:scale-105 transition-all">
            📤 Compartir progreso
          </button>
        </div>
      )}

      {/* Modal para cambiar avatar */}
      <AvatarSelector isOpen={selectorAbierto} onClose={() => setSelectorAbierto(false)} onSelectAvatar={actualizarAvatar} />
    </div>
  );
};

export default Perfil;