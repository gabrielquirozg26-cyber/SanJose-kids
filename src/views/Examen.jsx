import { useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import niveles from '../data/niveles.json';
import legado from '../data/examen.json';
import { bancoExamen, examenDisponible, seleccionarPreguntas } from '../utils/aprendizaje';
import HeaderLeccion from '../components/leccion/HeaderLeccion';
import ProgressBar from '../components/leccion/ProgressBar';
import CompaneroLeccion from '../components/leccion/CompaneroLeccion';
import RespuestaLeccion from '../components/leccion/RespuestaLeccion';
import PantallaVictoria from '../components/leccion/PantallaVictoria';
import '../styles/aula.css';

function Intento({ unidad, onCerrar }) {
  const { vidas, restarVida, sumarMonedas, aprobarExamen } = useGame();
  const [preguntas] = useState(() => seleccionarPreguntas(bancoExamen(unidad, legado)));
  const [intento] = useState(() => crypto.randomUUID());
  const [paso, setPaso] = useState(0);
  const [seleccion, setSeleccion] = useState(null);
  const [confirmada, setConfirmada] = useState(false);
  const [respuestas, setRespuestas] = useState([]);
  const [monedas, setMonedas] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [ultimaGanancia, setUltimaGanancia] = useState(0);
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
        setUltimaGanancia(ganadas);
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
  if (!pregunta) return <section className="aula-reto"><h1>Este reto se está preparando</h1><button className="aula-boton aula-boton-principal" onClick={onCerrar}>Volver al mapa</button></section>;
  if (resultado) return <PantallaVictoria oracion={unidad} monedasGanadas={monedas + bonus} errores={respuestas.length - resultado.aciertos} totalVersos={preguntas.length} escudosUsados={0} precision={Math.round(resultado.aciertos / preguntas.length * 100)} aprobado={resultado.aprobado} onVolverMapa={onCerrar} mensaje={resultado.aprobado ? bonus ? '¡Ganaste 200 monedas extra y un cofre de plata! Se abrirá al volver al mapa.' : '¡Buen repaso! El premio final se entrega una sola vez por examen.' : !resultado.completo ? 'Nos quedamos sin vidas. Recupera energía y vuelve a intentarlo.' : 'Para aprobar necesitas ' + Math.ceil(preguntas.length * 0.7) + ' aciertos de ' + preguntas.length + '. Descubre las respuestas y vuelve a intentarlo.'}>
    <section className="aula-revision" aria-labelledby="revision-examen"><h2 id="revision-examen">📖 Lo que aprendimos</h2>{preguntas.map((p, i) => <details key={p.id}><summary>{respuestas[i] === p.correcta ? '✓' : '💡'} {p.pregunta}</summary><p>Tu respuesta: {respuestas[i] ?? 'Sin responder'}</p><strong>Respuesta correcta: {p.correcta}</strong><p>{p.explicacion}</p></details>)}</section>
  </PantallaVictoria>;
  const estado = confirmada ? seleccion === pregunta.correcta ? 'acierto' : 'error' : null;
  const personaje = ['lucy', 'angel', 'francisco'][paso % 3];
  return <>
    <HeaderLeccion titulo={unidad.nombre} progreso={(paso + Number(confirmada)) / preguntas.length * 100} vidas={vidas} onCerrar={onCerrar} procesando={guardando}/>
    <ProgressBar paso={paso} total={preguntas.length} titulo={unidad.nombre} icono="🎓" tipo="examen"/>
    <main className="aula-contenido" key={paso}><CompaneroLeccion personaje={personaje} emocion={estado === 'acierto' ? 'feliz' : 'calma'} mensaje={estado === 'acierto' ? '¡Se nota todo lo que estás aprendiendo!' : estado ? 'Cada respuesta nos enseña algo. Vamos a descubrirlo.' : 'Es tu momento de brillar. Lee, piensa y elige con calma.'}/>
      <section className="aula-reto" aria-labelledby="pregunta-examen"><span className="aula-etiqueta">🎓 EL RETO DEL REINO</span><h1 id="pregunta-examen">{pregunta.pregunta}</h1><div className="aula-opciones aula-opciones-largas" role="group" aria-labelledby="pregunta-examen">{pregunta.opciones.map((op, i) => <button key={op} className="aula-opcion" disabled={confirmada || guardando || vidas <= 0} aria-pressed={seleccion === op} data-correcta={confirmada && op === pregunta.correcta} onClick={() => setSeleccion(op)}><span className="aula-letra" aria-hidden="true">{confirmada && op === pregunta.correcta ? '✓' : String.fromCharCode(65 + i)}</span><span>{op}</span></button>)}</div></section>
    </main>
    {vidas <= 0 && !confirmada ? <footer className="aula-pie"><p>💛 Recupera vidas para continuar.</p><button className="aula-boton aula-boton-principal" onClick={onCerrar}>Volver al mapa</button></footer> : <RespuestaLeccion resultado={estado} respuesta={pregunta.correcta} explicacion={confirmada ? pregunta.explicacion : null} monedas={ultimaGanancia} procesando={guardando} puedeComprobar={seleccion !== null} onComprobar={confirmar} onContinuar={siguiente} ultimo={paso === preguntas.length - 1 || vidas <= 0} error={error}/>}
  </>;
}

export default function Examen({ claveUnidad, onCerrar }) {
  const { nivelesCompletados, vidas, examenesAprobados } = useGame();
  const [iniciado, setIniciado] = useState(false);
  const unidad = niveles.unidades.find(u => u.id === claveUnidad);
  const disponible = examenDisponible(niveles.unidades, claveUnidad, nivelesCompletados);
  const cantidad = bancoExamen(unidad, legado).length;
  return <div className="aula-leccion" data-reto="examen">
    {iniciado && disponible ? <Intento unidad={unidad} onCerrar={onCerrar}/> : <>
      <HeaderLeccion titulo={unidad?.nombre ?? 'Examen'} vidas={vidas} onCerrar={onCerrar}/>
      <main className="aula-examen-intro"><CompaneroLeccion personaje="lucy" mensaje="¡Tus amigos y yo te acompañamos! Demuestra lo que aprendiste en este reino."/>
        <section className="aula-reto"><span className="aula-etiqueta">🎓 EXAMEN DEL REINO</span><h1>¿Aceptas el reto?</h1><h2>{unidad?.nombre ?? 'Examen no disponible'}</h2>
          <ul className="aula-reglas"><li>🧩 <strong>{Math.min(8, cantidad)} preguntas</strong> · Acierta {Math.ceil(Math.min(8, cantidad) * 0.7)} para aprobar.</li><li>❤️ Cada error usa una vida. Puedes pensar sin prisa.</li><li>🪙 Ganas 50 monedas por respuesta correcta.</li><li>🧠 Aquí juegas sin pistas ni escudo.</li></ul>
          <p className="aula-premio-examen">🎁 <strong>Tu primer gran premio:</strong> 200 monedas y un cofre de plata al aprobar por primera vez.</p>
          {examenesAprobados.includes(claveUnidad) && <p className="aula-pista">⭐ Ya aprobaste. Puedes repasar sin repetir el premio final.</p>}
          {!disponible && <p className="aula-pista" role="status">Completa las lecciones de este reino y los anteriores para abrir el reto.</p>}
          {vidas <= 0 && <p className="aula-pista" role="status">Recupera vidas antes de empezar.</p>}
          <button className="aula-boton aula-boton-principal aula-empezar" disabled={!disponible || !cantidad || vidas <= 0} onClick={() => setIniciado(true)}>¡Estoy listo! →</button>
        </section>
      </main>
    </>}
  </div>;
}
