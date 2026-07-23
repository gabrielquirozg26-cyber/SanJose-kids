// src/views/Leccion.jsx
import React from 'react';
import { useGame } from '../context/GameContext';
import LeccionContainer from '../components/leccion/LeccionContainer';

const Leccion = () => {
  const {
    vidas,
    restarVida,
    sumarMonedas,
    setEnLeccion,
    completarNivel,
    oracionActual,
    inventario,
    consumirItem,        // ✅ EXTRAER consumirItem de GameContext
    nivelesCompletados,
  } = useGame();

  if (!oracionActual) return null;
  // ✅ Asegurar que el ID existe para ambos tipos

  
  console.log('🔍 Leccion - oracionActual:', oracionActual);

  const tieneVersos = Array.isArray(oracionActual.versos) && oracionActual.versos.length > 0;
  const tienePreguntas = Array.isArray(oracionActual.preguntas) && oracionActual.preguntas.length > 0;

  if (!tieneVersos && !tienePreguntas) return null;

  return (
    <LeccionContainer
      oracionActual={oracionActual}
      vidas={vidas}
      restarVida={restarVida}
      sumarMonedas={sumarMonedas}
      setEnLeccion={setEnLeccion}
      completarNivel={completarNivel}
      inventario={inventario}
      consumirItem={consumirItem}        // ✅ PASAR consumirItem
      nivelesCompletados={nivelesCompletados}
      tieneVersos={tieneVersos}
      tienePreguntas={tienePreguntas}
    />
  );
};

export default Leccion;