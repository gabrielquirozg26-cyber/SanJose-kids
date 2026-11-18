import { useEffect, useId, useRef } from 'react';
import FraseIncompleta from './FraseIncompleta';
export default function EjercicioEscritura({ verso, resultado, escrito, onEscribir, onComprobar, bloqueado }) {
  const ref = useRef(null);
  const id = useId();
  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) ref.current?.focus({ preventScroll: true });
  }, []);
  return <section aria-labelledby="reto-escritura"><span className="aula-etiqueta">✍️ ESCRIBE Y DESCUBRE</span><h1 id="reto-escritura">Escribe la palabra que falta</h1><FraseIncompleta verso={verso} respuesta={escrito} resultado={resultado}/>
    <label className="aula-input-label" htmlFor={id}>Tu respuesta</label><input ref={ref} id={id} className="aula-input" value={escrito} onChange={e => onEscribir(e.target.value)} disabled={!!resultado || bloqueado} autoComplete="off" autoCapitalize="none" spellCheck={false} enterKeyHint="done" aria-describedby={id + '-pista'} onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && escrito.trim() && !resultado && !bloqueado) { e.preventDefault(); onComprobar(); } }} placeholder="Escribe aquí…"/>
    <p className="aula-pista" id={id + '-pista'}>💡 Empieza con «{verso.palabraFaltante[0]}». Puedes usar mayúsculas o minúsculas.</p>
  </section>;
}
