// src/components/leccion/LeccionContainer.jsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LeccionOracion from './LeccionOracion';
import LeccionConcepto from './LeccionConcepto';
import PantallaVictoria from './PantallaVictoria';
import HeaderLeccion from './HeaderLeccion';
import ProgressBar from './ProgressBar';

const LeccionContainer = ({
  oracionActual,
  vidas,
  restarVida,
  sumarMonedas,
  setEnLeccion,
  completarNivel,
  inventario,
  consumirItem,        // ✅ Asegurar que se recibe
  nivelesCompletados,
  tieneVersos,
  tienePreguntas,
}) => {
  const [mostrarVictoria, setMostrarVictoria] = useState(false);
  const [resultadoFinal, setResultadoFinal] = useState(null);

  // src/components/leccion/LeccionContainer.jsx
  // En handleCompletar, usar el nivelId correcto

    // src/components/leccion/LeccionContainer.jsx
    // En handleCompletar

  const handleCompletar = useCallback((resultado) => {
    console.log('🔍 LeccionContainer - handleCompletar');
    console.log('🔍 LeccionContainer - resultado:', resultado);
    console.log('🔍 LeccionContainer - oracionActual?.id:', oracionActual?.id);
    
    // ✅ Asegurar que el nivelId existe
    const nivelId = resultado?.nivelId || oracionActual?.id;
    
    setResultadoFinal({
        ...resultado,
        nivelId: nivelId,
    });
    setMostrarVictoria(true);
    }, [oracionActual?.id]);

    const handleVolverMapa = useCallback(() => {
        setEnLeccion(false);
  }, [setEnLeccion]);

  // ── LECCIÓN DE CONCEPTO (QUIZ) ──────────────────────────────────────────
  if (tienePreguntas && !tieneVersos) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-slate-900 text-white font-sans flex flex-col relative overflow-hidden">
        <HeaderLeccion
          titulo={oracionActual.nombre}
          icono={oracionActual.icono}
          progreso={0}
          vidas={vidas}
          escudoActivo={inventario.includes('escudo_miguel')}
          onCerrar={handleVolverMapa}
        />
        <main className="flex-1 flex flex-col justify-center px-5 max-w-2xl mx-auto w-full">
          {!mostrarVictoria ? (
            <LeccionConcepto
              preguntas={oracionActual.preguntas}
              onCompletar={handleCompletar}
              vidas={vidas}
              restarVida={restarVida}
              sumarMonedas={sumarMonedas}
              consumirItem={consumirItem}        // ✅ PASAR consumirItem
              inventario={inventario}
              oracionActual={oracionActual}
              yaCompletadoAntes={nivelesCompletados?.includes(oracionActual.id) || false}
              completarNivel={completarNivel} 
            />
          ) : (
            <PantallaVictoria
              oracion={oracionActual}
              monedasGanadas={resultadoFinal?.monedas || 0}
              errores={resultadoFinal?.errores || 0}
              totalVersos={resultadoFinal?.total || 1}
              escudosUsados={resultadoFinal?.escudosUsados || 0}
              onVolverMapa={handleVolverMapa}
            />
          )}
        </main>
      </div>
    );
  }

  // ── LECCIÓN DE ORACIÓN ──────────────────────────────────────────────────
  if (tieneVersos) {
    return (
      <LeccionOracion
        oracionActual={oracionActual}
        setEnLeccion={setEnLeccion}
        completarNivel={completarNivel}
        sumarMonedas={sumarMonedas}
        restarVida={restarVida}
        consumirItem={consumirItem}        // ✅ PASAR consumirItem
        inventario={inventario}
        nivelesCompletados={nivelesCompletados}
        vidas={vidas}
        onCompletar={handleCompletar}
        onVolverMapa={handleVolverMapa}
      />
    );
  }

  // ── FALLBACK ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-slate-900 text-white font-sans flex flex-col items-center justify-center px-6">
      <div className="text-center">
        <p className="text-4xl mb-4">⚠️</p>
        <p className="text-white font-black text-xl">No hay contenido disponible</p>
        <button
          onClick={handleVolverMapa}
          className="mt-4 px-6 py-3 rounded-xl bg-yellow-400 text-blue-900 font-black hover:scale-105 transition-all"
        >
          Volver al mapa
        </button>
      </div>
    </div>
  );
};

export default LeccionContainer;