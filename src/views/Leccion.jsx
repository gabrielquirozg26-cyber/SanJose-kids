// src/views/Leccion.jsx
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

  if (!oracionActual) return <section className="aula-leccion aula-final"><h1>Volvamos a elegir una aventura</h1><button className="aula-boton aula-boton-principal" onClick={() => setEnLeccion(false)}>Volver al mapa</button></section>;
  // ✅ Asegurar que el ID existe para ambos tipos

  


  const tieneVersos = Array.isArray(oracionActual.versos) && oracionActual.versos.length > 0;
  const tienePreguntas = Array.isArray(oracionActual.preguntas) && oracionActual.preguntas.length > 0;


  return (
    <LeccionContainer
      key={oracionActual.id}
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
