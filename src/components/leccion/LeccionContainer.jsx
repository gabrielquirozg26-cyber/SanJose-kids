import { useCallback, useState } from 'react';
import LeccionOracion from './LeccionOracion';
import LeccionConcepto from './LeccionConcepto';
import PantallaVictoria from './PantallaVictoria';
import '../../styles/aula.css';
export default function LeccionContainer(props) {
  const { oracionActual, setEnLeccion, vidas, nivelesCompletados, tienePreguntas, tieneVersos } = props;
  const [resultado, setResultado] = useState(null);
  const [repaso] = useState(() => nivelesCompletados.includes(oracionActual.id));
  const [intento, setIntento] = useState(0);
  const cerrar = useCallback(() => setEnLeccion(false), [setEnLeccion]);
  const completar = useCallback(datos => setResultado(datos), []);
  if (tieneVersos) return <LeccionOracion {...props} repaso={repaso} onCompletar={completar} onVolverMapa={cerrar}/>;
  if (tienePreguntas) return resultado ? <PantallaVictoria oracion={oracionActual} repaso={repaso} monedasGanadas={resultado.monedas} errores={resultado.errores} totalVersos={resultado.total} escudosUsados={resultado.escudosUsados} precision={resultado.precision} aprobado={resultado.aprobado} onVolverMapa={cerrar} puedeReintentar={vidas > 0} onReintentar={() => { setResultado(null); setIntento(n => n + 1); }}/>
    : <LeccionConcepto {...props} key={intento} preguntas={oracionActual.preguntas} onCompletar={completar} onCerrar={cerrar} yaCompletadoAntes={repaso}/>;
  return <section className="aula-leccion aula-final"><h1>Esta aventura aún se está preparando</h1><button className="aula-boton aula-boton-principal" onClick={cerrar}>Volver al mapa</button></section>;
}
