import { useEffect, useRef, useState } from 'react';
import { mezclar } from '../../utils/leccionHelpers';
import HeaderLeccion from './HeaderLeccion';
import ProgressBar from './ProgressBar';
import CompaneroLeccion from './CompaneroLeccion';
import RespuestaLeccion from './RespuestaLeccion';
export default function LeccionConcepto({ preguntas, oracionActual, onCompletar, onCerrar, vidas, restarVida, sumarMonedas, consumirItem, inventario, yaCompletadoAntes, completarNivel }) {
  const [paso, setPaso] = useState(0);
  const [seleccion, setSeleccion] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [monedas, setMonedas] = useState(0);
  const [ultimaGanancia, setUltimaGanancia] = useState(0);
  const [escudos, setEscudos] = useState(0);
  const [filtradas, setFiltradas] = useState(null);
  const [opciones] = useState(() => preguntas.map(p => mezclar(p.opciones)));
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const operando = useRef(false);
  const pregunta = preguntas[paso];
  useEffect(() => { document.getElementById('root')?.scrollTo({ top: 0, behavior: 'instant' }); }, [paso]);
  async function ejecutar(accion) {
    if (operando.current) return;
    operando.current = true; setProcesando(true); setError('');
    try { await accion(); }
    catch (e) { setError(e.message || 'No pudimos guardar. Intenta otra vez.'); }
    finally { operando.current = false; setProcesando(false); }
  }
  function comprobar() {
    if (!seleccion || resultado || vidas <= 0) return;
    return ejecutar(async () => {
      if (seleccion === pregunta.correcta) {
        const premio = await sumarMonedas(yaCompletadoAntes ? 2 : 25, 'pregunta:' + paso);
        setMonedas(m => m + premio); setUltimaGanancia(premio); setAciertos(n => n + 1); setResultado('acierto');
      } else if (inventario.includes('escudo_miguel') && await consumirItem('escudo_miguel')) {
        setEscudos(n => n + 1); setResultado('escudo');
      } else { await restarVida(); setErrores(n => n + 1); setResultado('error'); }
    });
  }
  function siguiente() {
    if (!resultado) return;
    return ejecutar(async () => {
      if (paso < preguntas.length - 1 && vidas > 0) {
        setPaso(n => n + 1); setSeleccion(null); setResultado(null); setFiltradas(null); return;
      }
      const completo = paso === preguntas.length - 1;
      const precision = aciertos / preguntas.length * 100;
      const aprobado = completo && precision >= 70;
      const premio = aprobado ? await completarNivel(errores === 0) : null;
      onCompletar({ monedas: monedas + (premio?.bonus ?? 0), errores, total: preguntas.length, escudosUsados: escudos, precision: Math.round(precision), aprobado, nivelId: oracionActual.id });
    });
  }
  function usarPocion() {
    if (resultado || filtradas || !inventario.includes('pocion_sabiduria')) return;
    return ejecutar(async () => {
      if (!await consumirItem('pocion_sabiduria')) throw new Error('No quedan pociones en tu mochila.');
      const incorrectas = pregunta.opciones.filter(op => op !== pregunta.correcta);
      setSeleccion(null);
      setFiltradas(mezclar([pregunta.correcta, ...(incorrectas.length >= 2 ? incorrectas.slice(0, -2) : incorrectas.slice(0, -1))]));
    });
  }
  const personaje = paso % 3 === 0 ? 'francisco' : paso % 3 === 1 ? 'angel' : 'lucy';
  return <div className="aula-leccion" data-reto="concepto">
    <HeaderLeccion titulo={oracionActual.nombre} progreso={(paso + Number(!!resultado)) / preguntas.length * 100} vidas={vidas} escudoActivo={inventario.includes('escudo_miguel')} onCerrar={onCerrar} procesando={procesando}/>
    <ProgressBar paso={paso} total={preguntas.length} titulo={oracionActual.nombre} icono={oracionActual.icono} tipo="concepto"/>
    <main className="aula-contenido" key={paso}><CompaneroLeccion personaje={resultado === 'escudo' ? 'angel' : personaje} emocion={resultado === 'acierto' ? 'feliz' : 'calma'} mensaje={resultado === 'acierto' ? '¡Una nueva idea para tu aventura de fe!' : resultado ? 'Lo importante es lo que aprendemos. Lee la explicación conmigo.' : 'Escucha la pregunta con calma. ¿Qué has aprendido sobre este tema?'}/>
      <section className="aula-reto" aria-labelledby="pregunta-concepto"><span className="aula-etiqueta">💡 DESCUBRE Y APRENDE</span><h1 id="pregunta-concepto">{pregunta.pregunta}</h1><div className="aula-opciones aula-opciones-largas" role="group" aria-labelledby="pregunta-concepto">{(filtradas ?? opciones[paso]).map((op, i) => <button className="aula-opcion" key={op} disabled={!!resultado || procesando || vidas <= 0} aria-pressed={seleccion === op} data-correcta={!!resultado && op === pregunta.correcta} onClick={() => setSeleccion(op)}><span className="aula-letra" aria-hidden="true">{resultado && op === pregunta.correcta ? '✓' : String.fromCharCode(65 + i)}</span><span>{op}</span></button>)}</div>{!resultado && <div className="aula-ayudas">{!filtradas && inventario.includes('pocion_sabiduria') && <button className="aula-boton aula-boton-secundario" disabled={procesando} onClick={usarPocion}>🧪 Usar una poción</button>}</div>}</section>
    </main>
    {vidas <= 0 && !resultado ? <footer className="aula-pie"><p role="status">💛 Recupera vidas para seguir descubriendo.</p><button className="aula-boton aula-boton-principal" onClick={onCerrar}>Volver al mapa</button></footer> : <RespuestaLeccion resultado={resultado} respuesta={pregunta.correcta} explicacion={resultado ? pregunta.explicacion : null} monedas={ultimaGanancia} procesando={procesando} puedeComprobar={!!seleccion && vidas > 0} onComprobar={comprobar} onContinuar={siguiente} ultimo={paso === preguntas.length - 1 || vidas <= 0} error={error} />}
  </div>;
}
