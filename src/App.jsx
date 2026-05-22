import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useGame } from './context/GameContext';

import Login    from './views/Login';
import Mapa     from './views/Mapa';
import Leccion  from './views/Leccion';
import Tienda   from './views/Tienda';
import Ranking  from './views/Ranking';
import Misiones from './views/Misiones';
import Navbar   from './components/Navbar';
import Examen   from './views/Examen';
import CofreGracia from './views/CofreGracia';
import Album from './views/Album';
import DetalleSantos from './views/DetalleSantos';
import PerfilPublico from './views/PerfilPublico';

import LoginCatequista from './views/LoginCatequista';
import PanelCatequista from './views/PanelCatequista';

// ── Cargando ───────────────────────────────────────────────────────────────
const Cargando = () => (
  <div className="min-h-screen bg-[#050b14] flex flex-col items-center justify-center gap-4">
    <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
    <p className="text-blue-300 text-xs font-black uppercase tracking-widest animate-pulse">
      Equipo de catequesis…
    </p>
  </div>
);

// ── Helpers cosmética ──────────────────────────────────────────────────────
const MARCOS = {
  marco_vitral_azul:   { border: 'border-blue-400',   shadow: 'shadow-[0_0_20px_rgba(96,165,250,0.5)]',  gradiente: 'from-blue-600 to-cyan-400'   },
  marco_vitral_dorado: { border: 'border-yellow-400', shadow: 'shadow-[0_0_20px_rgba(250,204,21,0.6)]',  gradiente: 'from-yellow-500 to-amber-300' },
};
const getMarco    = (inv) => inv.includes('marco_vitral_dorado') ? MARCOS.marco_vitral_dorado : inv.includes('marco_vitral_azul') ? MARCOS.marco_vitral_azul : null;
const tieneAura   = (inv) => inv.includes('aura_santidad');
const tieneEscudo = (inv) => inv.includes('escudo_miguel');
const tieneSeguro = (inv) => inv.includes('seguro_racha');

// ── Perfil ─────────────────────────────────────────────────────────────────
const Perfil = () => {
  const { nombre, grupo, monedas, nivelActual, rango, racha, vidas, inventario, cerrarSesion, minutosHastaVida, cofresAbiertos } = useGame();
  const marco      = getMarco(inventario);
  const aura       = tieneAura(inventario);
  const tieneEsc   = tieneEscudo(inventario);
  const tieneSeg   = tieneSeguro(inventario);
  const mins       = minutosHastaVida();
  const tiempoVida = mins > 0 ? (mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`) : null;

  const NIVEL_NOMBRE = {
    1:'Padre Nuestro',2:'Ave María',3:'Gloria',4:'Ángel de la Guarda',
    5:'Yo Confieso',6:'Acto de Contrición',7:'Dulce Madre',
    8:'Credo Apostólico',9:'La Salve',10:'10 Mandamientos',
    11:'Bienaventuranzas',12:'7 Sacramentos',13:'Obras de Misericordia',
    14:'Misterios Gozosos',15:'Misterios Dolorosos',
    16:'Misterios Gloriosos',17:'Misterios Luminosos',
  };

  return (
    <div className="py-6 space-y-4 animate-slide-up">
      {/* Tarjeta principal */}
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
        <div className="relative">
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
          <div className="bg-white/5 rounded-2xl px-4 py-2 border border-white/10">
            <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">Aprendiendo ahora</p>
            <p className="text-white font-black text-sm mt-0.5">{NIVEL_NOMBRE[nivelActual]}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏅</span>
            <div>
              <p className="text-white font-black text-lg leading-none">{nivelActual}</p>
              <p className="text-white/30 text-[9px] font-black uppercase tracking-wider">Nivel</p>
            </div>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
              style={{ width: `${Math.min((nivelActual / 17) * 100, 100)}%` }} />
          </div>
          <p className="text-white/20 text-[9px] font-black">{nivelActual}/17 oraciones</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-yellow-400/20">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪙</span>
            <div>
              <p className="text-yellow-400 font-black text-lg leading-none">{monedas}</p>
              <p className="text-white/30 text-[9px] font-black uppercase tracking-wider">Monedas</p>
            </div>
          </div>
        </div>

        <div className={`glass-card rounded-2xl p-4 border ${racha >= 7 ? 'border-orange-400/30' : 'border-white/10'}`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <div>
              <p className={`font-black text-lg leading-none ${racha >= 7 ? 'text-orange-400' : 'text-white'}`}>{racha} días</p>
              <p className="text-white/30 text-[9px] font-black uppercase tracking-wider">Racha</p>
            </div>
          </div>
          {tieneSeg && <p className="text-orange-300 text-[9px] font-black mt-2">🔥 Seguro activo</p>}
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">❤️</span>
            <div>
              <p className="text-white font-black text-lg leading-none">{vidas}/5</p>
              <p className="text-white/30 text-[9px] font-black uppercase tracking-wider">Vidas</p>
            </div>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-sm ${i < vidas ? 'opacity-100' : 'opacity-20'}`}>❤️</span>
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
        <div className="glass-card rounded-3xl p-5 border border-white/10 space-y-3">
          <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">Objetos equipados</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'escudo_miguel',       icono: '🛡️', nombre: 'Escudo de San Miguel',  desc: 'Protege del próximo error'  },
              { id: 'seguro_racha',        icono: '🔥', nombre: 'Seguro de Racha',        desc: 'Racha protegida'            },
              { id: 'aura_santidad',       icono: '✨', nombre: 'Aura de Santidad',       desc: 'Visible en el ranking'      },
              { id: 'marco_vitral_azul',   icono: '🔵', nombre: 'Marco Vitral Azul',      desc: 'Marco de perfil'            },
              { id: 'marco_vitral_dorado', icono: '🟡', nombre: 'Marco Vitral Dorado',    desc: 'Marco de perfil dorado'     },
              { id: 'titulo_guardian',     icono: '⚜️', nombre: 'Guardián del Credo',     desc: 'Título activo'              },
              { id: 'titulo_maestro',      icono: '👑', nombre: 'Maestro de la Fe',       desc: 'Título activo'              },
              { id: 'pocion_sabiduria',    icono: '🧪', nombre: 'Poción de Sabiduría',    desc: 'Elimina opciones malas'     },
              { id: 'reloj_arena',         icono: '⏳', nombre: 'Reloj de Arena',          desc: 'Tiempo extra'               },
            ].filter(obj => inventario.includes(obj.id)).map(obj => (
              <div key={obj.id} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2">
                <span className="text-lg shrink-0">{obj.icono}</span>
                <div className="min-w-0">
                  <p className="text-white font-black text-[11px] truncate">{obj.nombre}</p>
                  <p className="text-white/30 text-[9px]">{obj.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={cerrarSesion}
        className="w-full py-3 rounded-2xl border border-red-500/30 text-red-400 font-black text-sm uppercase tracking-widest hover:bg-red-500/10 transition-all">
        Cerrar Sesión
      </button>
    </div>
  );
};

// ── Shell estudiante ───────────────────────────────────────────────────────
const AppShell = () => {
  const { activeTab, enLeccion, cofrePendiente, cerrarCofre } = useGame();
  const [examenActivo, setExamenActivo] = useState(null);
  const [santoSeleccionado, setSantoSeleccionado] = useState(null);
  const [perfilPublico, setPerfilPublico] = useState(null);
  
  if (enLeccion) return <Leccion />;

  if (examenActivo) return (
    <>
      <Examen
        claveUnidad={examenActivo.clave}
        unidadNombre={examenActivo.nombre}
        onCerrar={() => setExamenActivo(null)}
      />
    </>
  );

  return (
    <div className="min-h-screen bg-[#050b14] text-white font-sans flex flex-col">
      <main className="flex-1 pb-24 pt-4 px-4 max-w-xl mx-auto w-full">
        {activeTab === 'mapa'     && <Mapa onIniciarExamen={(clave, nombre) => setExamenActivo({ clave, nombre })} />}
        {activeTab === 'album' && (
          santoSeleccionado ? (
            <DetalleSantos santo={santoSeleccionado} onVolver={() => setSantoSeleccionado(null)} />
          ) : (
            <Album onSeleccionarSanto={setSantoSeleccionado} />
          )
        )}

        {activeTab === 'ranking' && perfilPublico && (
          <PerfilPublico usuario={perfilPublico} onVolver={() => setPerfilPublico(null)} />
        )}
        {activeTab === 'ranking' && !perfilPublico && (
          <Ranking onSeleccionarUsuario={setPerfilPublico} />
        )}
      
        {activeTab === 'misiones' && <Misiones />}
        {activeTab === 'tienda'   && <Tienda />}
        {activeTab === 'perfil'   && <Perfil />}
      </main>
      <Navbar />

      {/* Cofre global: aparece cuando existe cofrePendiente */}
      {cofrePendiente && (
        <CofreGracia
          tipoCofre={cofrePendiente.tipo}
          recompensa={cofrePendiente.recompensa}
          onCerrar={cerrarCofre}
        />
      )}
    </div>
  );
};

// ── Rutas ──────────────────────────────────────────────────────────────────
const RutaEstudiante = () => {
  const { usuarioId, loading } = useGame();
  if (loading)    return <Cargando />;
  if (!usuarioId) return <Login />;
  return <AppShell />;
};

const RutaCatequista = () => {
  const { usuarioId, loading, rol } = useGame();
  if (loading) return <Cargando />;
  if (!usuarioId || (rol !== 'catequista' && rol !== 'coordinador')) return <LoginCatequista />;
  return <PanelCatequista />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/"           element={<RutaEstudiante />} />
      <Route path="/catequista" element={<RutaCatequista />} />
    </Routes>
  );
}
