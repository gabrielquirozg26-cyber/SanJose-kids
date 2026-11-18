import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/celebraciones.css';

export default function DialogoJuego({ titulo, onClose, children, className = '' }) {
  const ref = useRef(null);
  const tituloId = useId();
  useEffect(() => {
    const dialogo = ref.current;
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
  return createPortal(<dialog ref={ref} className={'celebracion-dialogo ' + className} aria-labelledby={tituloId} onCancel={e => { e.preventDefault(); onClose(); }}>
    <div className="celebracion-cabecera"><span>✦ San JoseKids</span><button type="button" className="celebracion-cerrar" onClick={onClose} aria-label="Cerrar ventana">✕</button></div>
    <h2 id={tituloId}>{titulo}</h2>{children}
    <footer className="celebracion-firma"><img src="/logo.jpg" alt="Escudo de la Iglesia San José"/><span>Equipo de Catequesis<br/><strong>San José · Diriamba</strong></span></footer>
  </dialog>, document.body);
}
