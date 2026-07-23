// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

// 🔥 CONTEXTOS EN EL ORDEN CORRECTO
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import { TitlesProvider } from './context/TitlesContext';
import { GameProvider, useGame } from './context/GameContext';
import { MissionsProvider, useMissions } from './context/MissionsContext';
import { setMissionAdvanceFn } from './utils/missionHelper';

// 📦 VISTAS
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
import Perfil from './views/Perfil';
import DailyStreakModal from './components/DailyStreakModal';
import Bienvenida from './views/Bienvenida';
import BienvenidaCatequista from './views/BienvenidaCatequista';

// 👨‍🏫 CATEQUISTAS
import LoginCatequista from './views/LoginCatequista';
import PanelCatequista from './views/PanelCatequista';

// 🏆 TÍTULOS
import TituloDesbloqueadoModal from './components/TituloDesbloqueadoModal';

// 🎨 UI COMPONENTS
import { ToastProvider } from './components/ui/Toast';

import OfflineIndicator from './components/OfflineIndicator';

// ── Cargando ───────────────────────────────────────────────────────────────
const Cargando = () => <LoadingScreen />;

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
  const { 
    activeTab, 
    enLeccion, 
    cofrePendiente, 
    cerrarCofre, 
    mostrarModalRacha, 
    setMostrarModalRacha, 
    racha, 
    recompensaRacha, 
    tituloDesbloqueadoReciente, 
    setTituloDesbloqueadoReciente,
    userDoc,
  } = useGame();
  
  const [examenActivo, setExamenActivo] = useState(null);
  const [santoSeleccionado, setSantoSeleccionado] = useState(null);
  const [perfilPublico, setPerfilPublico] = useState(null);
  const [mostrarBienvenida, setMostrarBienvenida] = useState(false);

  // Verificar si es la primera vez del usuario
  useEffect(() => {
    if (!userDoc || enLeccion) return;
    
    const contrasenaCambiada = userDoc?.contrasenaCambiada || false;
    const esPrimeraVez = userDoc?.esPrimeraVez !== false;
    
    console.log('🔍 AppShell - esPrimeraVez:', esPrimeraVez);
    console.log('🔍 AppShell - contrasenaCambiada:', contrasenaCambiada);
    
    if (esPrimeraVez && !contrasenaCambiada && !enLeccion) {
      setMostrarBienvenida(true);
    } else {
      setMostrarBienvenida(false);
    }
  }, [userDoc, enLeccion]);

  if (enLeccion) return <Leccion />;

  if (examenActivo) return (
    <Examen
      claveUnidad={examenActivo.clave}
      unidadNombre={examenActivo.nombre}
      onCerrar={() => setExamenActivo(null)}
    />
  );

  if (mostrarBienvenida) {
    return <Bienvenida onCompletado={() => setMostrarBienvenida(false)} />;
  }

  return (
    <div className="min-h-screen text-white font-sans flex flex-col relative">
      <OfflineIndicator />  {/* ← AGREGAR AQUÍ */}
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
        isOpen={tituloDesbloqueadoReciente?.mostrar || false}
        onClose={() => setTituloDesbloqueadoReciente({ mostrar: false, titulo: null })}
        titulo={tituloDesbloqueadoReciente?.titulo || null}
      />
    </div>
  );  
};

// ── Shell catequista ──────────────────────────────────────────────────────
const AppShellCatequista = () => {
  const { userDoc, enLeccion } = useGame();
  const [mostrarBienvenida, setMostrarBienvenida] = useState(false);

  // Verificar si es la primera vez del catequista
  useEffect(() => {
    console.log('🔍 AppShellCatequista - userDoc:', userDoc);
    console.log('🔍 AppShellCatequista - enLeccion:', enLeccion);
    
    if (!userDoc) {
      console.log('⚠️ userDoc es null o undefined');
      return;
    }
    
    const contrasenaCambiada = userDoc?.contrasenaCambiada || false;
    const esPrimeraVez = userDoc?.esPrimeraVez !== false;
    
    console.log('🔍 AppShellCatequista - esPrimeraVez:', esPrimeraVez);
    console.log('🔍 AppShellCatequista - contrasenaCambiada:', contrasenaCambiada);
    
    if (esPrimeraVez && !contrasenaCambiada && !enLeccion) {
      console.log('✅ Mostrando BienvenidaCatequista');
      setMostrarBienvenida(true);
    } else {
      console.log('❌ No se muestra bienvenida, mostrando PanelCatequista');
      setMostrarBienvenida(false);
    }
  }, [userDoc, enLeccion]);

  if (mostrarBienvenida) {
    console.log('🔄 Renderizando BienvenidaCatequista');
    return <BienvenidaCatequista onCompletado={() => setMostrarBienvenida(false)} />;
  }

  console.log('🔄 Renderizando PanelCatequista');
  return <PanelCatequista />;
};

// ── Rutas ──────────────────────────────────────────────────────────────────
const RutaEstudiante = () => {
  const { usuarioId, loading } = useAuth();
  if (loading) return <Cargando />;
  if (!usuarioId) return <Login />;
  return <AppShell />;
};

const RutaCatequista = () => {
  const { usuarioId, loading, userDoc } = useAuth();
  const rol = userDoc?.rol || 'estudiante';
  
  console.log('🔍 RutaCatequista - usuarioId:', usuarioId);
  console.log('🔍 RutaCatequista - rol:', rol);
  console.log('🔍 RutaCatequista - loading:', loading);
  
  if (loading) return <Cargando />;
  if (!usuarioId || (rol !== 'catequista' && rol !== 'coordinador')) {
    console.log('🔑 Redirigiendo a LoginCatequista');
    return <LoginCatequista />;
  }
  console.log('✅ Usuario válido, mostrando AppShellCatequista');
  return <AppShellCatequista />;
};

// ── App Principal ──────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <TitlesProvider>
          <GameProvider>
            <MissionsProvider>
              <ToastProvider>
                <ContextConnector>
                  <Routes>
                    <Route path="/" element={<RutaEstudiante />} />
                    <Route path="/catequista" element={<RutaCatequista />} />
                  </Routes>
                </ContextConnector>
              </ToastProvider>
            </MissionsProvider>
          </GameProvider>
        </TitlesProvider>
      </ShopProvider>
    </AuthProvider>
  );
}