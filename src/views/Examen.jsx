import { useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import niveles from '../data/niveles.json';
import legado from '../data/examen.json';
import { bancoExamen, examenDisponible, seleccionarPreguntas } from '../utils/aprendizaje';
import '../styles/aprendizaje.css';

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
    <header className="aprendizaje-cabecera"><h1>{resultado.aprobado ? '¡Examen aprobado!' : 'Sigamos practicando'}</h1><p>{unidad.nombre}</p></header>
    <article className="aprendizaje-panel">
      <h2>{resultado.aciertos} de {preguntas.length} respuestas correctas</h2>
      <p>Precisión: {Math.round(resultado.aciertos / preguntas.length * 100)}% · Monedas recibidas: {monedas + bonus}</p>
      {!resultado.completo && <p>El intento terminó porque se agotaron tus vidas. Recupera vidas y vuelve a intentarlo.</p>}
      {resultado.aprobado && <p>{bonus ? '¡Recibiste 200 monedas extra y un cofre de plata!' : 'Este examen ya estaba aprobado. El premio de aprobación se entrega una sola vez.'}</p>}
      {!resultado.aprobado && <p>Necesitas completar el examen y acertar al menos el 70%. Revisa tus respuestas y repasa las lecciones.</p>}
    </article>
    <h2>Revisa lo aprendido</h2>
    {preguntas.map((p, i) => <details key={p.id}>
      <summary>{respuestas[i] === p.correcta ? '✓' : 'Repasar:'} {p.pregunta}</summary>
      <p>Tu respuesta: {respuestas[i] ?? 'Sin responder'}</p><strong>Respuesta correcta: {p.correcta}</strong><p>{p.explicacion}</p>
    </details>)}
    <button className="aprendizaje-cta" onClick={onCerrar}>Volver al mapa</button>
  </section>;
  return <section>
    <header className="aprendizaje-fila"><button className="aprendizaje-secundario" disabled={guardando} onClick={onCerrar}>Salir del examen</button><span>Vidas: {vidas} / 5</span></header>
    <p>{unidad.nombre} · Pregunta {paso + 1} de {preguntas.length}</p>
    <progress max={preguntas.length} value={paso} aria-label="Preguntas respondidas" />
    <h1>{pregunta.pregunta}</h1>
    <div className="aprendizaje-opciones">{pregunta.opciones.map(op => <button key={op} disabled={confirmada || guardando || vidas <= 0} aria-pressed={seleccion === op} data-correcta={confirmada && op === pregunta.correcta} onClick={() => setSeleccion(op)}>{confirmada && op === pregunta.correcta ? '✓ ' : ''}{op}</button>)}</div>
    {confirmada && <div className="aprendizaje-panel" role="status"><h2>{seleccion === pregunta.correcta ? '¡Correcto!' : 'Aprendamos juntos'}</h2><p>{pregunta.explicacion}</p></div>}
    {error && <p role="alert">{error}</p>}
    {vidas <= 0 && !confirmada ? <div role="status"><p>Necesitas recuperar vidas para seguir.</p><button onClick={onCerrar}>Volver al mapa</button></div> :
      <button className="aprendizaje-cta" disabled={guardando || (!confirmada && seleccion === null)} onClick={confirmada ? siguiente : confirmar}>
        {guardando ? 'Guardando…' : !confirmada ? 'Confirmar respuesta' : paso === preguntas.length - 1 || vidas <= 0 ? 'Ver resultados' : 'Siguiente pregunta'}
      </button>}
    <p>Las respuestas se guardan antes de continuar. {examenesAprobados.includes(unidad.id) ? 'Estás practicando un examen ya aprobado.' : 'El premio final se entrega al aprobar por primera vez.'}</p>
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
      <header className="aprendizaje-cabecera"><p>🎓 Examen del reino</p><h1>{unidad?.nombre ?? 'Examen no disponible'}</h1></header>
      <article className="aprendizaje-panel">
        <h2>Antes de empezar</h2>
        <p>{Math.min(8, cantidad)} preguntas basadas en las lecciones de este reino. Necesitas un 70% de aciertos y cada error consume una vida.</p>
        <p>Recibes 50 monedas por acierto. La primera aprobación entrega 200 monedas extra y un cofre de plata.</p>
        {examenesAprobados.includes(claveUnidad) && <p>Ya aprobaste este examen. Puedes practicar sin repetir el premio final.</p>}
        {!disponible && <p role="status">Completa todas las lecciones de este reino y los anteriores para desbloquear el examen.</p>}
        {vidas <= 0 && <p role="status">Recupera vidas antes de comenzar.</p>}
      </article>
      <button className="aprendizaje-cta" disabled={!disponible || !cantidad || vidas <= 0} onClick={() => setIniciado(true)}>Comenzar examen</button>
      <button className="aprendizaje-cta aprendizaje-secundario" onClick={onCerrar}>Volver al mapa</button>
    </section>}
  </main>;
}
