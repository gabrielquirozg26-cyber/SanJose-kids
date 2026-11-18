import { useEffect, useState } from 'react';
import { mezclar } from '../../utils/leccionHelpers';
import { crearFichas, agregarFicha, textoOrdenado } from '../../utils/ejercicios';
export default function EjercicioOrdenar({ verso, resultado, onRespuesta, bloqueado }) {
  const [fichas] = useState(() => mezclar(crearFichas(verso.palabrasOrdenar)));
  const [seleccion, setSeleccion] = useState([]);
  const desactivado = !!resultado || bloqueado;
  useEffect(() => { onRespuesta(textoOrdenado(fichas, seleccion)); }, [fichas, seleccion, onRespuesta]);
  return <section aria-labelledby="reto-ordenar"><span className="aula-etiqueta">🧩 CONSTRUYE LA ORACIÓN</span><h1 id="reto-ordenar">¡Cada palabra en su lugar!</h1><p className="aula-instruccion">Toca las palabras en orden. Para quitar una, tócala otra vez.</p>
    <div className="aula-frase-armada" aria-label="Tu oración" aria-live="polite">{!seleccion.length && <p>Tu oración empieza aquí…</p>}{seleccion.map((id, i) => <button className="aula-ficha aula-ficha-elegida" key={id} disabled={desactivado} aria-label={'Quitar ' + fichas.find(f => f.id === id).texto + ', palabra ' + (i + 1)} onClick={() => setSeleccion(prev => prev.filter(actual => actual !== id))}>{fichas.find(f => f.id === id).texto}</button>)}</div>
    <div className="aula-fichas-info"><span>{seleccion.length} de {fichas.length} palabras</span><button className="aula-boton-texto" disabled={!seleccion.length || desactivado} onClick={() => setSeleccion(prev => prev.slice(0, -1))}>↶ Deshacer</button><button className="aula-boton-texto" disabled={!seleccion.length || desactivado} onClick={() => setSeleccion([])}>Empezar de nuevo</button></div>
    <div className="aula-banco-palabras" aria-label="Palabras disponibles">{fichas.map(f => <button className="aula-ficha" key={f.id} disabled={desactivado || seleccion.includes(f.id)} aria-label={'Añadir ' + f.texto + ', ficha ' + (f.id + 1)} aria-pressed={seleccion.includes(f.id)} onClick={() => setSeleccion(prev => agregarFicha(prev, f.id, fichas))}>{f.texto}</button>)}</div>
  </section>;
}
