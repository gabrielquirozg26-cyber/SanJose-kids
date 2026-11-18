import { useEffect, useState } from 'react';
import { mezclar } from '../../utils/leccionHelpers';
import { crearPiezasOracion, agregarFicha, textoOrdenado } from '../../utils/ejercicios';

export default function EjercicioOrdenar({ verso, resultado, onRespuesta, bloqueado }) {
  const [fichas] = useState(() => mezclar(crearPiezasOracion(verso.palabrasOrdenar)));
  const [seleccion, setSeleccion] = useState([]);
  const desactivado = !!resultado || bloqueado;
  const texto = textoOrdenado(fichas, seleccion);
  useEffect(() => { onRespuesta(texto); }, [texto, onRespuesta]);
  return <section className="aula-ordenar" aria-labelledby="reto-ordenar">
    <h1 id="reto-ordenar">¡Arma la oración!</h1><p className="aula-instruccion">Toca las piezas de abajo en el orden correcto.</p>
    <div className="aula-tablero-titulo"><span>Tu oración</span><span role="status" aria-live="polite">{seleccion.length} de {fichas.length} piezas</span></div>
    <div className="aula-oracion-creada" aria-label="La oración que estás formando"><p>{texto || 'Aquí aparecerá tu oración…'}</p></div>
    <div className="aula-piezas-titulo"><span aria-hidden="true">👇</span> Elige la siguiente pieza</div>
    <div className="aula-piezas" role="group" aria-label="Piezas para armar la oración">{fichas.map((f, i) => {
      const colocada = seleccion.includes(f.id);
      return <button className="aula-pieza" key={f.id} disabled={desactivado || colocada} aria-label={f.texto + ', pieza ' + (i + 1) + (colocada ? ', ya colocada' : ', añadir a tu oración')} aria-pressed={colocada} onClick={() => setSeleccion(ids => agregarFicha(ids, f.id, fichas))}><span>{f.texto}</span><span className="aula-pieza-marca" aria-hidden="true">{colocada ? '✓' : '+'}</span></button>;
    })}</div>
    <div className="aula-editar-oracion"><button className="aula-boton-texto" disabled={!seleccion.length || desactivado} onClick={() => setSeleccion(ids => ids.slice(0,-1))}>↶ Quitar la última</button><button className="aula-boton-texto" disabled={!seleccion.length || desactivado} onClick={() => setSeleccion([])}>Empezar otra vez</button></div>
  </section>;
}
