import { useEffect, useRef } from 'react';
import useLeccion from '../../hooks/useLeccion';
import HeaderLeccion from './HeaderLeccion';
import ProgressBar from './ProgressBar';
import EjercicioSeleccion from './EjercicioSeleccion';
import EjercicioOrdenar from './EjercicioOrdenar';
import EjercicioEscritura from './EjercicioEscritura';
import PantallaVictoria from './PantallaVictoria';
import CompaneroLeccion from './CompaneroLeccion';
import RespuestaLeccion from './RespuestaLeccion';
import '../../styles/aula.css';
const guias = { seleccion: ['lucy', 'Busca la palabra que hace brillar esta oración.'], ordenar: ['francisco', 'Vamos a construirla juntos. Una palabra, y después otra.'], escritura: ['angel', 'Tú puedes escribirla. Lee con calma y fíjate en la primera letra.'] };
export default function LeccionOracion(props) {
  const l = useLeccion(props);
  const notificado = useRef(false);
  const { oracionActual, onVolverMapa, onCompletar, vidas } = props;
  useEffect(() => {
    if (l.isComplete && !notificado.current) {
      notificado.current = true;
      onCompletar({ monedas: l.monedasAc, errores: l.errores, total: l.banco.length, escudosUsados: l.escudosUsados });
    }
  }, [l.isComplete, l.monedasAc, l.errores, l.banco.length, l.escudosUsados, onCompletar]);
  useEffect(() => { document.getElementById('root')?.scrollTo({ top: 0, behavior: 'instant' }); }, [l.paso]);
  if (l.isComplete) return <PantallaVictoria oracion={oracionActual} monedasGanadas={l.monedasAc} errores={l.errores} totalVersos={l.banco.length} escudosUsados={l.escudosUsados} repaso={props.repaso} onVolverMapa={onVolverMapa}/>;
  if (!l.verso) return null;
  const [personaje, mensaje] = guias[l.tipo];
  const bloqueado = l.procesando || vidas <= 0;
  const lista = l.tipo === 'seleccion' ? !!l.seleccionada : l.tipo === 'escritura' ? !!l.escrito.trim() : l.respuestaOrden.trim().split(/\s+/).filter(Boolean).length === l.verso.palabrasOrdenar.length;
  const comprobar = () => { l.handleCerrarMensajeFlotante(); return l.handleValidar(); };
  const siguiente = () => { l.handleCerrarMensajeFlotante(); return l.handleSiguiente(); };
  return <div className="aula-leccion" data-reto={l.tipo}>
    <HeaderLeccion titulo={oracionActual.nombre} progreso={(l.paso + Number(!!l.resultado)) / l.banco.length * 100} vidas={vidas} escudoActivo={l.escudoActivo} onCerrar={onVolverMapa} procesando={l.procesando}/>
    <ProgressBar paso={l.paso} total={l.banco.length} tipo={l.tipo} titulo={oracionActual.nombre} icono={oracionActual.icono}/>
    <main className="aula-contenido" key={l.paso}><CompaneroLeccion personaje={l.resultado === 'escudo' ? 'angel' : personaje} emocion={l.resultado === 'acierto' ? 'feliz' : 'calma'} mensaje={l.resultado === 'acierto' ? '¡Tu esfuerzo está dando frutos!' : l.resultado === 'error' ? 'No pasa nada. Mira la respuesta y sigamos aprendiendo.' : l.resultado === 'escudo' ? 'Tu escudo te protegió. ¡Podemos continuar!' : mensaje}/>
      <div className="aula-reto" key={l.verso.id}>
        {l.tipo === 'seleccion' && <EjercicioSeleccion verso={l.verso} resultado={l.resultado} seleccionada={l.seleccionada} onSeleccionar={l.setSeleccionada} opcionesFiltradas={l.opcionesFiltradas} bloqueado={bloqueado}/>}
        {l.tipo === 'ordenar' && <EjercicioOrdenar verso={l.verso} resultado={l.resultado} onRespuesta={l.setRespOrden} bloqueado={bloqueado}/>}
        {l.tipo === 'escritura' && <EjercicioEscritura verso={l.verso} resultado={l.resultado} escrito={l.escrito} onEscribir={l.setEscrito} onComprobar={comprobar} bloqueado={bloqueado}/>}
        {!l.resultado && <div className="aula-ayudas">{l.tipo === 'seleccion' && l.tienePocion && !l.usandoPocion && <button className="aula-boton aula-boton-secundario" disabled={bloqueado} onClick={l.handleUsarPocion}>🧪 Usar una poción ({props.inventario.filter(i => i === 'pocion_sabiduria').length})</button>}</div>}
      </div>
    </main>
    {vidas <= 0 && !l.resultado ? <footer className="aula-pie"><div className="aula-sin-vidas" role="status"><h2>💛 Hagamos una pausa</h2><p>Recupera vidas para seguir con tu aventura.</p><button className="aula-boton aula-boton-principal" onClick={onVolverMapa}>Volver al mapa</button></div></footer> : <RespuestaLeccion resultado={l.resultado} respuesta={l.tipo === 'ordenar' ? l.verso.palabrasOrdenar.join(' ') : l.verso.palabraFaltante} monedas={l.ultimaGanancia} procesando={l.procesando} puedeComprobar={lista && vidas > 0} onComprobar={comprobar} onContinuar={siguiente} ultimo={l.paso === l.banco.length - 1} error={l.mensajeFlotante?.icon === '⚠️' ? l.mensajeFlotante.message : null} />}
  </div>;
}
