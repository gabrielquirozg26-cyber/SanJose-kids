import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { pasosTutorial } from '../../utils/tutorialLily';
import Lily from './Lily';
import '../../styles/tutorial-lily.css';

export default function RecorridoLily({ modo, indice, onAvanzar, onCerrar, activeTab, onTab }) {
  const pasos = pasosTutorial(modo);
  const paso = pasos[indice];
  const dialogoRef = useRef(null);
  const burbujaRef = useRef(null);
  const tituloRef = useRef(null);
  const [foco, setFoco] = useState(null);
  const id = useId().replaceAll(':', '');
  const arriba = paso.foco === 'navegacion';

  useLayoutEffect(() => {
    const dialogo = dialogoRef.current;
    const anterior = document.activeElement;
    const raiz = document.getElementById('root');
    const overflow = raiz?.style.overflow;
    if (raiz) raiz.style.overflow = 'hidden';
    dialogo.showModal();
    return () => {
      dialogo.close();
      if (raiz) raiz.style.overflow = overflow;
      if (anterior?.isConnected) anterior.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => { onTab(paso.tab); }, [paso.tab, onTab]);
  useEffect(() => { tituloRef.current?.focus({ preventScroll: true }); }, [indice]);

  useLayoutEffect(() => {
    if (activeTab !== paso.tab || !paso.foco) return;
    const raiz = document.getElementById('root');
    let frame = 0;
    let colocado = false;
    const buscar = () => document.querySelector('[data-tutorial="' + paso.foco + '"]') ?? (paso.alternativa ? document.querySelector('[data-tutorial="' + paso.alternativa + '"]') : null);
    const medir = () => {
      const objetivo = buscar();
      if (!objetivo) { setFoco(null); return; }
      const alto = window.visualViewport?.height ?? window.innerHeight;
      const ancho = document.documentElement.clientWidth;
      const globo = burbujaRef.current.getBoundingClientRect();
      const limiteSuperior = arriba ? globo.bottom + 12 : 84;
      const limiteInferior = arriba ? alto - 8 : globo.top - 16;
      let r = objetivo.getBoundingClientRect();
      if (!colocado && !arriba) {
        colocado = true;
        const alturaVisible = Math.min(r.height, Math.max(48, limiteInferior - limiteSuperior));
        const deseado = Math.max(84, limiteSuperior + (limiteInferior - limiteSuperior - alturaVisible) / 2);
        raiz?.scrollBy({ top: r.top - deseado, behavior: 'instant' });
        r = objetivo.getBoundingClientRect();
      }
      const x = Math.max(6, r.left - 6), y = Math.max(limiteSuperior, r.top - 6);
      const derecha = Math.min(ancho - 6, r.right + 6), abajo = Math.min(limiteInferior, r.bottom + 6);
      const nuevo = derecha > x && abajo > y ? { x, y, width: derecha - x, height: abajo - y } : null;
      setFoco(anterior => JSON.stringify(anterior?.rect) === JSON.stringify(nuevo) && anterior?.paso === paso.id ? anterior : { paso: paso.id, rect: nuevo });
    };
    const programar = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(medir); };
    const resize = new ResizeObserver(programar);
    resize.observe(burbujaRef.current);
    if (raiz) resize.observe(raiz);
    const objetivo = buscar();
    if (objetivo) resize.observe(objetivo);
    const cambios = new MutationObserver(programar);
    if (raiz) cambios.observe(raiz, { childList: true, subtree: true });
    window.addEventListener('resize', programar);
    window.visualViewport?.addEventListener('resize', programar);
    document.addEventListener('scroll', programar, true);
    programar();
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); cambios.disconnect();
      window.removeEventListener('resize', programar);
      window.visualViewport?.removeEventListener('resize', programar);
      document.removeEventListener('scroll', programar, true);
    };
  }, [activeTab, paso, arriba]);

  const rect = foco?.paso === paso.id && activeTab === paso.tab ? foco.rect : null;
  return createPortal(<dialog ref={dialogoRef} className="lily-recorrido" aria-labelledby={id + '-titulo'} aria-describedby={id + '-texto'} onCancel={e => { e.preventDefault(); onCerrar('aplazado'); }} onKeyDown={e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); onAvanzar(1); }
    if (e.key === 'ArrowLeft' && indice > 0) { e.preventDefault(); onAvanzar(-1); }
  }}>
    <svg className="lily-foco" aria-hidden="true" width="100%" height="100%"><defs><mask id={id + '-mascara'}><rect width="100%" height="100%" fill="white"/>{rect && <rect {...rect} rx="16" fill="black"/>}</mask></defs><rect width="100%" height="100%" fill="#0b123c" opacity=".84" mask={'url(#' + id + '-mascara)'}/>{rect && <rect {...rect} rx="16" fill="none" stroke="#ffdf8c" strokeWidth="3"/>}</svg>
    <section ref={burbujaRef} className={'lily-burbuja' + (arriba ? ' lily-burbuja-arriba' : '')}>
      <header className="lily-cabecera"><Lily/><div><strong>Lily te acompaña</strong><span>{modo === 'actualizacion' ? 'Novedades de tu aventura' : 'Conoce tu aventura'}</span></div><button className="lily-cerrar" aria-label="Posponer recorrido" onClick={() => onCerrar('aplazado')}>✕</button></header>
      <div className="lily-dialogo-texto"><p className="lily-paso">{paso.icono} Paso {indice + 1} de {pasos.length}</p><h2 id={id + '-titulo'} tabIndex={-1} ref={tituloRef}>{paso.titulo}</h2><p id={id + '-texto'}>{paso.texto}</p></div>
      <progress className="lily-progreso" aria-label="Progreso del recorrido" value={indice + 1} max={pasos.length}/>
      <div className="lily-acciones"><button className="lily-atras" disabled={indice === 0} onClick={() => onAvanzar(-1)}>← Atrás</button><button className="lily-siguiente" onClick={() => onAvanzar(1)}>{indice === pasos.length - 1 ? '¡A mi aventura!' : indice === 0 ? '¡Vamos!' : 'Siguiente →'}</button></div>
      <div className="lily-salidas"><button onClick={() => onCerrar('aplazado')}>Más tarde</button><button onClick={() => onCerrar('omitido')}>Omitir recorrido</button></div>
    </section>
  </dialog>, document.body);
}
