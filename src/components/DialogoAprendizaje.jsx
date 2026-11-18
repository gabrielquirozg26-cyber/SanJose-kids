import { useEffect, useRef } from 'react';
import '../styles/aprendizaje.css';

export default function DialogoAprendizaje({ abierto, onCerrar, titulo, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialogo = ref.current;
    if (abierto && dialogo && !dialogo.open) dialogo.showModal();
    return () => { if (dialogo?.open) dialogo.close(); };
  }, [abierto]);
  if (!abierto) return null;
  return <dialog ref={ref} className="aprendizaje-dialogo" aria-label={titulo}
    onCancel={e => { e.preventDefault(); onCerrar(); }}>
    <div className="aprendizaje">
      <header className="aprendizaje-fila"><h2>{titulo}</h2><button className="aprendizaje-secundario" onClick={onCerrar} aria-label="Cerrar ventana">✕</button></header>
      {children}
    </div>
  </dialog>;
}
