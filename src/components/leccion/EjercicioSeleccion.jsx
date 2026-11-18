import { useState } from 'react';
import { mezclar } from '../../utils/leccionHelpers';
import FraseIncompleta from './FraseIncompleta';
export default function EjercicioSeleccion({ verso, resultado, seleccionada, onSeleccionar, opcionesFiltradas, bloqueado }) {
  const [opciones] = useState(() => mezclar(verso.opcionesSeleccion));
  return <section aria-labelledby="reto-seleccionar"><span className="aula-etiqueta">🔎 ELIGE UNA PALABRA</span><h1 id="reto-seleccionar">¿Cuál completa la oración?</h1><FraseIncompleta verso={verso} respuesta={seleccionada} resultado={resultado}/>
    <div className="aula-opciones" role="group" aria-labelledby="reto-seleccionar">{(opcionesFiltradas ?? opciones).map((op, i) => <button className="aula-opcion" key={op} aria-pressed={seleccionada === op} disabled={!!resultado || bloqueado} data-correcta={!!resultado && op === verso.palabraFaltante} onClick={() => onSeleccionar(op)}><span className="aula-letra" aria-hidden="true">{resultado && op === verso.palabraFaltante ? '✓' : String.fromCharCode(65 + i)}</span><span>{op}</span></button>)}</div>
  </section>;
}
