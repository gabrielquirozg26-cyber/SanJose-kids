import { contenedorJuego } from '../../utils/scrollJuego';
import { useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { TutorialContext } from './TutorialContext';
import RecorridoLily from './RecorridoLily';
import { leerTutorial, guardarTutorial, prepararTutorial, pasosTutorial, registroTutorial } from '../../utils/tutorialLily';

export default function TutorialProvider({ children, bloqueado, primerAcceso }) {
  const { usuarioId, userDoc, activeTab, setActiveTab } = useGame();
  // Conserva el primer acceso aunque la bienvenida acabe de actualizar la contraseña.
  const [sesion, setSesion] = useState(() => prepararTutorial(primerAcceso ? { ...userDoc, contrasenaCambiada: false } : userDoc, leerTutorial(usuarioId)));
  const regreso = useRef({ tab: activeTab, scroll: contenedorJuego()?.scrollTop ?? 0 });
  const iniciado = useRef(false);
  useEffect(() => {
    if (sesion.abierto && !bloqueado && !iniciado.current) {
      regreso.current = { tab: activeTab, scroll: contenedorJuego()?.scrollTop ?? 0 };
      iniciado.current = true;
    }
  }, [sesion.abierto, bloqueado, activeTab]);
  const guardar = (siguiente, estado) => guardarTutorial(usuarioId, registroTutorial(siguiente, estado, leerTutorial(usuarioId)));
  function abrir(modo = 'completo') {
    iniciado.current = true;
    regreso.current = { tab: activeTab, scroll: contenedorJuego()?.scrollTop ?? 0 };
    const registro = leerTutorial(usuarioId);
    const anterior = prepararTutorial(userDoc, registro);
    const nueva = { modo, paso: registro?.estado === 'aplazado' && anterior.modo === modo ? anterior.paso : 0, abierto: true };
    guardar(nueva, 'pendiente'); setSesion(nueva);
  }
  function cerrar(estado) {
    guardar(sesion, estado); setSesion(s => ({ ...s, abierto: false }));
    setActiveTab(regreso.current.tab);
    requestAnimationFrame(() => contenedorJuego()?.scrollTo({ top: regreso.current.scroll, behavior: 'instant' }));
  }
  function avanzar(delta) {
    const pasos = pasosTutorial(sesion.modo);
    if (sesion.paso + delta >= pasos.length) { cerrar('completado'); return; }
    const siguiente = { ...sesion, paso: Math.max(0, sesion.paso + delta) };
    guardar(siguiente, 'pendiente'); setSesion(siguiente);
  }
  return <TutorialContext.Provider value={{ abrir, abierto: sesion.abierto && !bloqueado }}>
    {children}
    {sesion.abierto && !bloqueado && <RecorridoLily modo={sesion.modo} indice={sesion.paso} onAvanzar={avanzar} onCerrar={cerrar} activeTab={activeTab} onTab={setActiveTab}/>}
  </TutorialContext.Provider>;
}
