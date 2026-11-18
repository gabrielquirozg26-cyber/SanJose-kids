import { useRef, useState } from 'react';
import { useMissions } from '../context/MissionsContext';
import { useTitles } from '../context/TitlesContext';
import { useToast } from '../components/ui/Toast';
import './Misiones.css';
import GuiaLuz from '../components/GuiaLuz';
import { useGame } from '../context/GameContext';

export default function Misiones() {
  const { setActiveTab } = useGame();
  const { misionesState, reclamarMision, MISIONES_DIARIAS, MISIONES_SEMANALES, loading } = useMissions();
  const { logrosPendientes, canjearLogro, titulosPorNivel } = useTitles();
  const { showToast } = useToast();
  const [filtro, setFiltro] = useState('todas');
  const [ocupada, setOcupada] = useState(null);
  const operando = useRef(false);
  const pendientes = logrosPendientes.map(l => titulosPorNivel.find(t => t.id === l.id)).filter(Boolean);
  const grupos = [
    { id: 'diarias', nombre: 'Tus retos de hoy', etiqueta: 'Misiones diarias', icono: '☀️', definiciones: MISIONES_DIARIAS, plazo: 'Se renuevan cada día a las 18:00 · Nicaragua' },
    { id: 'semanales', nombre: 'La aventura de esta semana', etiqueta: 'Misiones semanales', icono: '✦', definiciones: MISIONES_SEMANALES, plazo: 'Se renuevan el domingo a las 18:00 · Nicaragua' },
  ];
  const todas = grupos.flatMap(g => g.definiciones.map(d => ({ ...d, grupo: g.id, estado: misionesState?.[g.id]?.[d.id] ?? { progreso: 0, reclamada: false } })));
  const listas = todas.filter(d => d.estado.progreso >= d.meta && !d.estado.reclamada);
  const completadas = todas.filter(d => d.estado.progreso >= d.meta).length;
  const monedasListas = listas.reduce((suma, d) => suma + d.recompensa, 0);
  const totalRecompensas = listas.length + pendientes.length;
  const proxima = todas.filter(d => !d.estado.reclamada && d.estado.progreso < d.meta)
    .sort((a, b) => b.estado.progreso / b.meta - a.estado.progreso / a.meta)[0];
  const nombres = { d1: '¡Vamos a aprender!', d2: 'Un tesoro de monedas', d3: '¡Una lección perfecta!', d4: 'Enciende tu racha', s1: 'Una semana de aventuras', s2: 'Explora nuevos caminos', s3: 'El gran tesoro', s4: 'Cinco días brillando' };
  async function reclamar(clave, accion, mensaje) {
    if (operando.current) return;
    operando.current = true;
    setOcupada(clave);
    try {
      const ok = await accion();
      showToast(ok ? mensaje : 'No se pudo reclamar. Comprueba tu conexión y si ya la recibiste.', ok ? 'success' : 'warning');
    } catch (error) {
      showToast(error.message || 'No se pudo guardar. Intenta de nuevo.', 'error');
    } finally {
      operando.current = false;
      setOcupada(null);
    }
  }
  function verRecompensas() {
    setFiltro(totalRecompensas ? 'listas' : 'todas');
    document.getElementById('misiones-recompensas')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }
  function tarjeta(d) {
    const m = d.estado;
    const progreso = Math.min(d.meta, Math.max(0, m.progreso));
    const lista = progreso >= d.meta;
    const estado = m.reclamada ? 'recibida' : lista ? 'lista' : 'progreso';
    return <article className={'mision-card mision-card--' + estado} data-tipo={d.tipo} key={d.id}>
      <div className="mision-card-top"><span className="mision-icono" aria-hidden="true">{d.icono}</span><span className="mision-premio"><span aria-hidden="true">🪙</span> +{d.recompensa}<small>monedas</small></span></div>
      <div className="mision-contenido"><h3>{nombres[d.id] ?? d.titulo}</h3><p>{d.descripcion}</p></div>
      <div className="mision-progreso-texto"><span>{m.reclamada ? '✓ ¡Premio en tu bolsillo!' : lista ? '★ ¡Lo conseguiste!' : 'Cada paso cuenta'}</span><strong>{progreso}<small> / {d.meta}</small></strong></div>
      <progress max={d.meta} value={progreso} aria-label={d.titulo} />
      <button className={'misiones-btn ' + (lista && !m.reclamada ? 'misiones-btn-oro' : 'misiones-btn-contorno')} disabled={m.reclamada || !!ocupada} onClick={() => lista ? reclamar(d.id, () => reclamarMision(d.grupo, d.id), '+' + d.recompensa + ' monedas recibidas') : setActiveTab('mapa')}>
        {ocupada === d.id ? 'Guardando…' : m.reclamada ? '✓ Recibido' : lista ? '¡Recoger mi premio!' : 'Ir al mapa'}{!m.reclamada && <span aria-hidden="true">→</span>}
      </button>
    </article>;
  }
  if (loading) return <main className="misiones-page"><p role="status">Luci está preparando tus misiones…</p></main>;
  return <main className="misiones-page">
    <header className="misiones-portada">
      <div className="misiones-portada-texto"><span className="misiones-eyebrow">⭐ TU TABLERO DE AVENTURAS</span><h1>¡Hoy puedes<br/><em>brillar un poco más!</em></h1><p>Soy Luci. ¿Vamos a descubrir tu próximo reto?</p>
        <button className="misiones-btn misiones-btn-oro" onClick={totalRecompensas ? verRecompensas : () => setActiveTab('mapa')}>{totalRecompensas ? '¡Recoger mis premios!' : '¡Vamos al mapa!'} <span aria-hidden="true">→</span></button>
      </div>
      <div className="misiones-luci"><span className="misiones-bocadillo">{totalRecompensas ? '¡Tienes premios esperando!' : '¡Yo te acompaño!'}</span><GuiaLuz celebrando={totalRecompensas > 0}/><span className="misiones-luci-nombre">LUCI · TU COMPAÑERA DE AVENTURA</span></div>
    </header>

    <div className="misiones-resumen" aria-label="Resumen de tus misiones">
      <div><span className="misiones-resumen-icono" aria-hidden="true">🎯</span><p><strong>{completadas}<small> / {todas.length}</small></strong><span>Retos conseguidos</span></p></div>
      <div><span className="misiones-resumen-icono" aria-hidden="true">🪙</span><p><strong>{monedasListas}</strong><span>Monedas esperando</span></p></div>
      <div><span className="misiones-resumen-icono" aria-hidden="true">🏅</span><p><strong>{pendientes.length}</strong><span>Títulos para ti</span></p></div>
    </div>

    <section id="misiones-recompensas" className="misiones-logros" aria-labelledby="misiones-logros-titulo">
      <div className="misiones-logros-cabecera"><span className="misiones-logros-sello" aria-hidden="true">🏅</span><div><h2 id="misiones-logros-titulo">{pendientes.length ? '¡Ganaste nuevos títulos!' : 'Tu colección de títulos'}</h2><p>{pendientes.length ? 'Son tuyos. ¡Recógelos y enséñalos en tu perfil!' : 'Aprende nuevas lecciones y gana un nombre de aventurero.'}</p></div>{pendientes.length > 0 && <span className="misiones-contador">{pendientes.length} nuevos</span>}</div>
      {pendientes.map(t => <article className="misiones-titulo" key={t.id}>
        <div><span className="misiones-eyebrow">✦ TÍTULO CONSEGUIDO</span><h3>{t.nombre}</h3></div>
        <button className="misiones-btn misiones-btn-oro" disabled={!!ocupada} onClick={() => reclamar(t.id, () => canjearLogro(t.id), 'Título añadido a tu colección')}>{ocupada === t.id ? 'Guardando…' : '¡Es mío!'} <span aria-hidden="true">→</span></button>
      </article>)}
    </section>

    {!totalRecompensas && proxima && <aside className="misiones-sugerencia"><span aria-hidden="true">🧭</span><div><span className="misiones-eyebrow">TU PRÓXIMO RETO</span><h2>{nombres[proxima.id] ?? proxima.titulo}</h2><p>{proxima.descripcion}</p></div><button className="misiones-btn misiones-btn-contorno" onClick={() => setActiveTab('mapa')}>¡Vamos! →</button></aside>}
    <div className="misiones-filtros-cabecera"><h2>¿Qué aventura eliges?</h2><nav className="misiones-filtros" aria-label="Filtrar misiones">
      {[['todas', '🧭 Todas'], ['diarias', '☀️ Hoy'], ['semanales', '🌈 Esta semana'], ['listas', '🎁 Premios']].map(([id, nombre]) => <button key={id} aria-pressed={filtro === id} onClick={() => setFiltro(id)}>{nombre}{id === 'listas' && listas.length > 0 && <span>{listas.length}</span>}</button>)}
    </nav></div>
    {filtro === 'listas' && !listas.length && <div className="misiones-vacio"><GuiaLuz celebrando/><h3>{pendientes.length ? '¡Tus títulos te esperan arriba!' : '¡Ya recogiste tus premios!'}</h3><p>Hay más aventuras por descubrir. ¿Seguimos?</p><button className="misiones-btn misiones-btn-oro" onClick={() => setActiveTab('mapa')}>¡Volver a la aventura!</button></div>}
    {grupos.filter(g => filtro === 'todas' || filtro === 'listas' || filtro === g.id).map(g => {
      const misiones = todas.filter(d => d.grupo === g.id && (filtro !== 'listas' || listas.some(l => l.id === d.id)));
      if (!misiones.length) return null;
      const activas = misiones.filter(d => !d.estado.reclamada).sort((a, b) => Number(b.estado.progreso >= b.meta) - Number(a.estado.progreso >= a.meta));
      const recibidas = misiones.filter(d => d.estado.reclamada);
      return <section key={g.id} className="misiones-grupo" aria-labelledby={g.id}>
        <header className="misiones-grupo-cabecera"><div><span className="misiones-eyebrow">{g.icono} {g.etiqueta}</span><h2 id={g.id}>{g.nombre}</h2></div><span className="misiones-grupo-cuenta">{recibidas.length} / {g.definiciones.length}<small>premios recogidos</small></span></header>
        {activas.length > 0 && <div className="misiones-grid">{activas.map(tarjeta)}</div>}
        {recibidas.length > 0 && <details className="misiones-recibidas"><summary>✅ ¡{recibidas.length} premios ya son tuyos! <span>Ver logros</span></summary><div className="misiones-grid">{recibidas.map(tarjeta)}</div></details>}
        <p className="misiones-plazo">{g.plazo}</p>
      </section>;
    })}
    <p className="misiones-pie">⭐ No hace falta correr. Aprende a tu ritmo.</p>
  </main>;
}
