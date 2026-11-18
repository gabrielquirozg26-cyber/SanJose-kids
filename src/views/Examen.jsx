import { useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import niveles from '../data/niveles.json';
import legado from '../data/examen.json';
import { bancoExamen, examenDisponible, seleccionarPreguntas } from '../utils/aprendizaje';
import '../styles/aprendizaje.css';
import GuiaLuz from '../components/GuiaLuz';

function Intento({ unidad, onCerrar }) {
  const { vidas, restarVida, sumarMonedas, aprobarExamen, examenesAprobados } = useGame();
  const [preguntas] = useState(() => seleccionarPreguntas(bancoExamen(unidad, legado)));
  const [intento] = useState(() => crypto.randomUUID());
  const [paso, setPaso] = useState(0);
  const [seleccion, setSeleccion] = useState(null);
  const [confirmada, setConfirmada] = useState(false);
  const [respuestas, setRespuestas] = useState([]);
  const [monedas, setMonedas] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const operando = useRef(false);
  const pregunta = preguntas[paso];
  async function guardar(accion) {
    if (operando.current) return;
    operando.current = true;
    setGuardando(true);
    setError('');
    try { await accion(); }
    catch (e) { setError(e.message || 'No se pudo guardar. Intenta de nuevo.'); }
    finally { operando.current = false; setGuardando(false); }
  }
  const confirmar = () => {
    if (seleccion === null || confirmada || vidas <= 0) return;
    return guardar(async () => {
      if (seleccion === pregunta.correcta) {
        const ganadas = await sumarMonedas(50, 'examen:' + unidad.id + ':' + intento + ':' + paso);
        setMonedas(m => m + ganadas);
      } else await restarVida();
      setConfirmada(true);
    });
  };
  const siguiente = () => {
    if (!confirmada) return;
    return guardar(async () => {
      const nuevas = [...respuestas, seleccion];
      if (paso === preguntas.length - 1 || vidas <= 0) {
        const aciertos = preguntas.filter((p, i) => nuevas[i] === p.correcta).length;
        const completo = nuevas.length === preguntas.length;
        const aprobado = completo && aciertos / preguntas.length >= 0.7;
        const premio = aprobado ? await aprobarExamen(unidad.id) : 0;
        setBonus(premio);
        setRespuestas(nuevas);
        setResultado({ aprobado, aciertos, completo });
      } else {
        setRespuestas(nuevas); setPaso(p => p + 1); setSeleccion(null); setConfirmada(false);
      }
    });
  };
  if (!pregunta) return <section className="aprendizaje-panel"><h1>Examen no disponible</h1><p>Este reino todavía no tiene preguntas válidas.</p><button onClick={onCerrar}>Volver al mapa</button></section>;
  if (resultado) return <section>
    <header className="aprendizaje-cabecera aventura-resultado"><GuiaLuz celebrando={resultado.aprobado}/><span className="aventura-etiqueta">{unidad.nombre}</span><h1>{resultado.aprobado ? '¡Superaste el reto!' : '¡Cada intento te enseña!'}</h1><p>{resultado.aprobado ? 'Luci celebra contigo. ¡Mira lo que has conseguido!' : 'Podemos repasar juntos y volver a probar.'}</p></header>
    <article className="aprendizaje-panel">
      <h2>{resultado.aciertos} de {preguntas.length} respuestas correctas</h2>
      <div className="aventura-premios"><span>🎯 <strong>{Math.round(resultado.aciertos / preguntas.length * 100)}%</strong> de aciertos</span><span>🪙 <strong>+{monedas + bonus}</strong> monedas recibidas</span></div>
      {!resultado.completo && <p>El intento terminó porque se agotaron tus vidas. Recupera vidas y vuelve a intentarlo.</p>}
      {resultado.aprobado && <p>{bonus ? '¡Recibiste 200 monedas extra y un cofre de plata!' : 'Este examen ya estaba aprobado. El premio de aprobación se entrega una sola vez.'}</p>}
      {!resultado.aprobado && <p>Para superar este reto necesitas responder todo y acertar {Math.ceil(preguntas.length * 0.7)} de {preguntas.length}. ¡Vamos paso a paso!</p>}
    </article>
    <h2>📖 Descubre las respuestas</h2>
    {preguntas.map((p, i) => <details key={p.id}>
      <summary>{respuestas[i] === p.correcta ? '✓' : 'Repasar:'} {p.pregunta}</summary>
      <p>Tu respuesta: {respuestas[i] ?? 'Sin responder'}</p><strong>Respuesta correcta: {p.correcta}</strong><p>{p.explicacion}</p>
    </details>)}
    <button className="aprendizaje-cta" onClick={onCerrar}>Volver al mapa</button>
  </section>;
  return <section>
    <header className="aprendizaje-fila"><button className="aprendizaje-secundario" disabled={guardando} onClick={onCerrar}>← Volver al mapa</button><span aria-label={vidas + ' vidas de 5'}>❤️ {vidas} / 5</span></header>
    <p>{unidad.nombre} · Pregunta {paso + 1} de {preguntas.length}</p>
    <progress max={preguntas.length} value={paso + Number(confirmada)} aria-label="Preguntas respondidas" />
    <div className="aventura-pregunta"><span className="aventura-etiqueta">🧭 EL RETO DE LUCI</span><h1 id="pregunta-examen">{pregunta.pregunta}</h1><p>Elige una respuesta y pulsa «Comprobar».</p></div>
    <div className="aprendizaje-opciones" role="group" aria-labelledby="pregunta-examen">{pregunta.opciones.map((op, i) => <button key={op} disabled={confirmada || guardando || vidas <= 0} aria-pressed={seleccion === op} data-correcta={confirmada && op === pregunta.correcta} onClick={() => setSeleccion(op)}><span className="aventura-opcion-letra" aria-hidden="true">{confirmada && op === pregunta.correcta ? '✓' : String.fromCharCode(65 + i)}</span><span>{op}</span></button>)}</div>
    {confirmada && <div className="aprendizaje-panel" role="status"><h2>{seleccion === pregunta.correcta ? '¡Correcto!' : 'Aprendamos juntos'}</h2><p>{pregunta.explicacion}</p></div>}
    {error && <p role="alert">{error}</p>}
    {vidas <= 0 && !confirmada ? <div role="status"><p>Necesitas recuperar vidas para seguir.</p><button onClick={onCerrar}>Volver al mapa</button></div> :
      <button className="aprendizaje-cta" disabled={guardando || (!confirmada && seleccion === null)} onClick={confirmada ? siguiente : confirmar}>
        {guardando ? 'Guardando…' : !confirmada ? 'Comprobar' : paso === preguntas.length - 1 || vidas <= 0 ? '¡Ver mis resultados!' : '¡Siguiente reto! →'}
      </button>}
    <p className="aventura-ayuda">{examenesAprobados.includes(unidad.id) ? '⭐ Ya superaste este reto. ¡Ahora estás practicando!' : '⭐ Sin prisa. Piensa tu respuesta antes de comprobar.'}</p>
  </section>;
}

export default function Examen({ claveUnidad, onCerrar }) {
  const { nivelesCompletados, vidas, examenesAprobados } = useGame();
  const [iniciado, setIniciado] = useState(false);
  const unidad = niveles.unidades.find(u => u.id === claveUnidad);
  const disponible = examenDisponible(niveles.unidades, claveUnidad, nivelesCompletados);
  const cantidad = bancoExamen(unidad, legado).length;
  return <main className="aprendizaje aprendizaje-examen">
    {iniciado && disponible ? <Intento unidad={unidad} onCerrar={onCerrar} /> : <section>
      <header className="aprendizaje-cabecera aventura-intro"><GuiaLuz/><span className="aventura-etiqueta">🎓 EXAMEN DEL REINO</span><h1>¿Aceptas el reto?</h1><p>{unidad?.nombre ?? 'Examen no disponible'}</p></header>
      <article className="aprendizaje-panel">
        <h2>¡Muéstrale a Luci lo que aprendiste!</h2>
        <div className="aventura-reglas"><div><span aria-hidden="true">🧩</span><strong>{Math.min(8, cantidad)} preguntas</strong><span>Acierta {Math.ceil(Math.min(8, cantidad) * 0.7)} para superar el reto.</span></div><div><span aria-hidden="true">❤️</span><strong>A tu ritmo</strong><span>Cada error usa una vida. No hay reloj.</span></div><div><span aria-hidden="true">🪙</span><strong>50 monedas</strong><span>Por cada respuesta correcta.</span></div></div>
        <div className="aventura-cofre"><span aria-hidden="true">🎁</span><p><strong>Tu primer gran premio</strong><br/>200 monedas + un cofre de plata al aprobar por primera vez.</p></div>
        {examenesAprobados.includes(claveUnidad) && <p>Ya aprobaste este examen. Puedes practicar sin repetir el premio final.</p>}
        {!disponible && <p role="status">Completa todas las lecciones de este reino y los anteriores para desbloquear el examen.</p>}
        {vidas <= 0 && <p role="status">Recupera vidas antes de comenzar.</p>}
      </article>
      <button className="aprendizaje-cta" disabled={!disponible || !cantidad || vidas <= 0} onClick={() => setIniciado(true)}>¡Estoy listo! →</button>
      <button className="aprendizaje-cta aprendizaje-secundario" onClick={onCerrar}>Volver al mapa</button>
    </section>}
  </main>;
}
