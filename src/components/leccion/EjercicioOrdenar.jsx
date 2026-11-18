import { useEffect, useRef, useState } from 'react';
import { mezclar } from '../../utils/leccionHelpers';
import { dividirEnTramos, alternarFicha, textoOrdenado } from '../../utils/ejercicios';

export default function EjercicioOrdenar({ verso, resultado, onRespuesta, bloqueado }) {
  const [plan] = useState(() => {
    const tramos = dividirEnTramos(verso.palabrasOrdenar).map(tramo => mezclar(tramo));
    return { tramos, fichas: tramos.flat() };
  });
  const [selecciones, setSelecciones] = useState(() => plan.tramos.map(() => []));
  const [parte, setParte] = useState(0);
  const ref = useRef(null);
  const desactivado = !!resultado || bloqueado;
  const fichas = plan.tramos[parte] ?? [];
  const seleccion = selecciones[parte] ?? [];
  const todas = selecciones.flat();
  const completa = todas.length === plan.fichas.length;
  const texto = textoOrdenado(plan.fichas, todas);
  useEffect(() => { onRespuesta(texto); }, [texto, onRespuesta]);
  useEffect(() => { ref.current?.closest('.aula-contenido')?.scrollTo({ top: 0, behavior: 'instant' }); }, [parte]);
  function cambiarSeleccion(accion) {
    setSelecciones(prev => prev.map((ids, i) => i === parte ? accion(ids) : ids));
  }
  return <section ref={ref} className="aula-ordenar" aria-labelledby="reto-ordenar">
    <h1 id="reto-ordenar">Ordena la oración</h1><p className="aula-instruccion">Toca en orden; toca de nuevo para quitar.</p>
    <div className="aula-tramo-cabecera"><strong>{plan.tramos.length > 1 ? 'Parte ' + (parte + 1) + ' de ' + plan.tramos.length : 'Tus palabras'}</strong><span role="status" aria-live="polite">{seleccion.length} de {fichas.length} palabras</span></div>
    <div className="aula-frase-armada" aria-label="Tu oración en esta parte"><p>{seleccion.length ? textoOrdenado(fichas, seleccion) : 'Tu oración empieza aquí…'}<span className="aula-cursor-frase" aria-hidden="true">{seleccion.length < fichas.length ? ' ▏' : ''}</span></p></div>
    <div className="aula-banco-palabras" role="group" aria-label="Palabras de esta parte">{fichas.map(f => {
      const posicion = seleccion.indexOf(f.id);
      return <button className={'aula-ficha' + (posicion >= 0 ? ' aula-ficha-elegida' : '')} key={f.id} disabled={desactivado} aria-label={(posicion >= 0 ? 'Quitar ' : 'Añadir ') + f.texto + ', ficha ' + (f.id + 1) + (posicion >= 0 ? ', posición ' + (posicion + 1) : '')} aria-pressed={posicion >= 0} onClick={() => cambiarSeleccion(ids => alternarFicha(ids, f.id, fichas))}>{posicion >= 0 && <span className="aula-ficha-numero" aria-hidden="true">{posicion + 1}</span>}{f.texto}</button>;
    })}</div>
    <div className="aula-fichas-info"><div className="aula-fichas-editar"><button className="aula-boton-texto" disabled={!seleccion.length || desactivado} onClick={() => cambiarSeleccion(ids => ids.slice(0, -1))}>↶ Deshacer</button><button className="aula-boton-texto" disabled={!seleccion.length || desactivado} onClick={() => cambiarSeleccion(() => [])}>Borrar parte</button></div></div>
    {plan.tramos.length > 1 && <nav className="aula-tramos-nav" aria-label="Partes de la oración"><button className="aula-boton aula-boton-secundario" disabled={parte === 0 || desactivado} onClick={() => setParte(p => p - 1)}>← Anterior</button><button className="aula-boton aula-boton-secundario" disabled={parte === plan.tramos.length - 1 || seleccion.length !== fichas.length || desactivado} onClick={() => setParte(p => p + 1)}>Siguiente parte →</button></nav>}
    {plan.tramos.length > 1 && (parte > 0 || completa) && <details className="aula-repaso-frase" open={completa || !!resultado}><summary>Tu oración · {todas.length} de {plan.fichas.length} palabras</summary><p>{texto || 'Aquí se unirán todas las partes de tu oración.'}</p><small>Puedes volver a una parte y cambiar el orden antes de comprobar.</small></details>}
  </section>;
}
