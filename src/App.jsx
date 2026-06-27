import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { GameProvider, useGame } from './context/GameContext';
import { MissionsProvider, useMissions } from './context/MissionsContext';
import { setMissionAdvanceFn } from './utils/missionHelper';

import Login from './views/Login';
import Mapa from './views/Mapa';
import Leccion from './views/Leccion';
import Tienda from './views/Tienda';
import Ranking from './views/Ranking';
import Misiones from './views/Misiones';
import Navbar from './components/Navbar';
import Examen from './views/Examen';
import CofreGracia from './views/CofreGracia';
import Album from './views/Album';
import DetalleSantos from './views/DetalleSantos';
import PerfilPublico from './views/PerfilPublico';
import Header from './components/Header';
import LoadingScreen from './components/LoadingScreen';
import Perfil from './views/perfil';
import DailyStreakModal from './components/DailyStreakModal';

import LoginCatequista from './views/LoginCatequista';
import PanelCatequista from './views/PanelCatequista';
import TituloDesbloqueadoModal from './components/TituloDesbloqueadoModal';

// ── Cargando ───────────────────────────────────────────────────────────────
const Cargando = () => <LoadingScreen />;

// ── Helpers cosmética ──────────────────────────────────────────────────────
const MARCOS = {
  marco_vitral_azul:   { border: 'border-blue-400',   shadow: 'shadow-[0_0_20px_rgba(96,165,250,0.5)]',  gradiente: 'from-blue-600 to-cyan-400'   },
  marco_vitral_dorado: { border: 'border-yellow-400', shadow: 'shadow-[0_0_20px_rgba(250,204,21,0.6)]',  gradiente: 'from-yellow-500 to-amber-300' },
};
const getMarco    = (inv) => inv.includes('marco_vitral_dorado') ? MARCOS.marco_vitral_dorado : inv.includes('marco_vitral_azul') ? MARCOS.marco_vitral_azul : null;
const tieneAura   = (inv) => inv.includes('aura_santidad');
const tieneEscudo = (inv) => inv.includes('escudo_miguel');
const tieneSeguro = (inv) => inv.includes('seguro_racha');

// ── Conector de contextos ──────────────────────────────────────────────────
const ContextConnector = ({ children }) => {
  const { avanzarMision } = useMissions();
  
  useEffect(() => {
    setMissionAdvanceFn(avanzarMision);
    return () => setMissionAdvanceFn(null);
  }, [avanzarMision]);

  return children;
};

// ── Shell estudiante ───────────────────────────────────────────────────────
const AppShell = () => {
  const { activeTab, enLeccion, cofrePendiente, cerrarCofre, mostrarModalRacha, setMostrarModalRacha, racha, recompensaRacha, tituloDesbloqueadoReciente, setTituloDesbloqueadoReciente } = useGame();
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
    <div className="min-h-screen text-white font-sans flex flex-col relative">
      {/* Fondo fijo con imagen de iglesia + blur + overlay */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/fondo-iglesia.jpeg')", opacity: 0.4 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/70 via-purple-900/60 to-slate-900/80" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-400/20 rounded-full blur-[100px]" />
      </div>

      <Header />

      <main className="flex-1 pb-24 pt-20 px-4 max-w-2xl mx-auto w-full">
        {activeTab === 'mapa' && <Mapa onIniciarExamen={(clave, nombre) => setExamenActivo({ clave, nombre })} />}
        
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

      {cofrePendiente && (
        <CofreGracia
          tipoCofre={cofrePendiente.tipo}
          recompensa={cofrePendiente.recompensa}
          onCerrar={cerrarCofre}
        />
      )}
      <DailyStreakModal
        isOpen={mostrarModalRacha}
        onClose={() => setMostrarModalRacha(false)}
        racha={racha}
        recompensa={recompensaRacha?.monedas}
      />
      <TituloDesbloqueadoModal
        isOpen={tituloDesbloqueadoReciente.mostrar}
        onClose={() => setTituloDesbloqueadoReciente({ mostrar: false, titulo: null })}
        titulo={tituloDesbloqueadoReciente.titulo}
      />
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
    <GameProvider>
      <MissionsProvider>
        <ContextConnector>
          <Routes>
            <Route path="/" element={<RutaEstudiante />} />
            <Route path="/catequista" element={<RutaCatequista />} />
          </Routes>
        </ContextConnector>
      </MissionsProvider>
    </GameProvider>
  );
}
