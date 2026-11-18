import { useRef, useState } from 'react';
import { useMissions } from '../context/MissionsContext';
import { useTitles } from '../context/TitlesContext';
import { useToast } from '../components/ui/Toast';
import './Misiones.css';

function Estrella({ className = '' }) {
  return <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="m32 5 7.8 16 17.7 2.6-12.8 12.5 3 17.6L32 45.4l-15.7 8.3 3-17.6L6.5 23.6 24.2 21Z" fill="currentColor"/><path d="m32 15 5.4 11 12.1 1.8-8.8 8.5 2.1 12.1L32 42.7" stroke="#fff5cf" strokeWidth="2" strokeLinecap="round"/></svg>;
}

export default function Misiones() {
  const { misionesState, reclamarMision, MISIONES_DIARIAS, MISIONES_SEMANALES, loading } = useMissions();
  const { logrosPendientes, canjearLogro, titulosPorNivel } = useTitles();
  const { showToast } = useToast();
  const [filtro, setFiltro] = useState('todas');
  const [ocupada, setOcupada] = useState(null);
  const operando = useRef(false);
  const pendientes = logrosPendientes.map(l => titulosPorNivel.find(t => t.id === l.id)).filter(Boolean);
  const grupos = [
    { id: 'diarias', nombre: 'Un poquito cada día', etiqueta: 'Misiones diarias', icono: '☀️', definiciones: MISIONES_DIARIAS, plazo: 'Se renuevan cada día a las 18:00 · Nicaragua' },
    { id: 'semanales', nombre: 'Una semana para brillar', etiqueta: 'Misiones semanales', icono: '✦', definiciones: MISIONES_SEMANALES, plazo: 'Se renuevan el domingo a las 18:00 · Nicaragua' },
  ];
  const todas = grupos.flatMap(g => g.definiciones.map(d => ({ ...d, grupo: g.id, estado: misionesState?.[g.id]?.[d.id] ?? { progreso: 0, reclamada: false } })));
  const listas = todas.filter(d => d.estado.progreso >= d.meta && !d.estado.reclamada);
  const completadas = todas.filter(d => d.estado.progreso >= d.meta).length;
  const monedasListas = listas.reduce((suma, d) => suma + d.recompensa, 0);
  const totalRecompensas = listas.length + pendientes.length;
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
  if (loading) return <main className="misiones-page"><p role="status">Preparando tus misiones…</p></main>;
  return <main className="misiones-page">
    <header className="misiones-portada">
      <div className="misiones-portada-texto"><span className="misiones-eyebrow">✦ CADA PASO CUENTA</span><h1>Pequeños retos.<br/><em>Una gran aventura.</em></h1><p>Aprende algo nuevo, cuida tu fe y deja que tus logros brillen.</p></div>
      <aside className="misiones-tesoro" aria-label="Recompensas disponibles">
        <div className="misiones-insignia"><Estrella /></div>
        <span className="misiones-eyebrow">TU ESFUERZO TIENE PREMIO</span>
        <h2>{totalRecompensas ? totalRecompensas + (totalRecompensas === 1 ? ' recompensa lista' : ' recompensas listas') : 'Tu próxima victoria te espera'}</h2>
        <p>{totalRecompensas ? '¡Lo has conseguido! Es momento de recoger tus premios.' : 'Elige una misión y avanza a tu ritmo. Cada pequeño paso suma.'}</p>
        <button className="misiones-btn misiones-btn-oro" onClick={verRecompensas}>{totalRecompensas ? 'Ver mis recompensas' : 'Explorar misiones'} <span aria-hidden="true">↗</span></button>
      </aside>
    </header>

    <div className="misiones-resumen" aria-label="Resumen de tus misiones">
      <div><span className="misiones-resumen-icono" aria-hidden="true">✓</span><p><strong>{completadas}<small> / {todas.length}</small></strong><span>Misiones completadas</span></p></div>
      <div><span className="misiones-resumen-icono" aria-hidden="true">◉</span><p><strong>{monedasListas}</strong><span>Monedas por reclamar</span></p></div>
      <div><span className="misiones-resumen-icono" aria-hidden="true">♜</span><p><strong>{pendientes.length}</strong><span>Títulos por reclamar</span></p></div>
    </div>

    <section id="misiones-recompensas" className="misiones-logros" aria-labelledby="misiones-logros-titulo">
      <div className="misiones-logros-cabecera"><span className="misiones-logros-sello" aria-hidden="true">🏅</span><div><h2 id="misiones-logros-titulo">Tu colección de títulos</h2><p>{pendientes.length ? 'Un recuerdo especial de lo que has aprendido.' : 'Al completar nuevas lecciones ganarás títulos para tu perfil.'}</p></div>{pendientes.length > 0 && <span className="misiones-contador">{pendientes.length} nuevos</span>}</div>
      {pendientes.map(t => <article className="misiones-titulo" key={t.id}>
        <div><span className="misiones-eyebrow">TÍTULO CONSEGUIDO</span><h3>{t.nombre}</h3><p>Reclámalo y llévalo contigo en tu perfil.</p></div>
        <button className="misiones-btn misiones-btn-oro" disabled={!!ocupada} onClick={() => reclamar(t.id, () => canjearLogro(t.id), 'Título añadido a tu colección')}>{ocupada === t.id ? 'Guardando…' : 'Reclamar título'} <span aria-hidden="true">→</span></button>
      </article>)}
    </section>

    <div className="misiones-filtros-cabecera"><h2>Elige tu próximo reto</h2><nav className="misiones-filtros" aria-label="Filtrar misiones">
      {[['todas', 'Todas'], ['diarias', 'Diarias'], ['semanales', 'Semanales'], ['listas', 'Por reclamar']].map(([id, nombre]) => <button key={id} aria-pressed={filtro === id} onClick={() => setFiltro(id)}>{nombre}{id === 'listas' && listas.length > 0 && <span>{listas.length}</span>}</button>)}
    </nav></div>
    {filtro === 'listas' && !listas.length && <div className="misiones-vacio"><Estrella /><h3>{pendientes.length ? 'Tus títulos te esperan arriba' : '¡Todo recogido por aquí!'}</h3><p>{pendientes.length ? 'Reclama los títulos que has ganado y sigue con tu aventura.' : 'Sigue aprendiendo para desbloquear tu próxima recompensa.'}</p><button className="misiones-btn misiones-btn-contorno" onClick={() => setFiltro('todas')}>Ver todas las misiones</button></div>}
    {grupos.filter(g => filtro === 'todas' || filtro === 'listas' || filtro === g.id).map(g => {
      const misiones = todas.filter(d => d.grupo === g.id && (filtro !== 'listas' || listas.some(l => l.id === d.id)));
      if (!misiones.length) return null;
      const completas = todas.filter(d => d.grupo === g.id && d.estado.progreso >= d.meta).length;
      return <section key={g.id} className="misiones-grupo" aria-labelledby={g.id}>
        <header className="misiones-grupo-cabecera"><div><span className="misiones-eyebrow">{g.icono} {g.etiqueta}</span><h2 id={g.id}>{g.nombre}</h2><p>{g.plazo}</p></div><span className="misiones-grupo-cuenta">{completas} / {g.definiciones.length}<small>completadas</small></span></header>
        <div className="misiones-grid">{misiones.map(d => {
          const m = d.estado;
          const progreso = Math.min(d.meta, Math.max(0, m.progreso));
          const lista = progreso >= d.meta;
          const estado = m.reclamada ? 'recibida' : lista ? 'lista' : 'progreso';
          return <article className={'mision-card mision-card--' + estado} key={d.id}>
            <div className="mision-card-top"><span className="mision-icono" aria-hidden="true">{d.icono}</span><span className="mision-premio"><span aria-hidden="true">◉</span> +{d.recompensa}<small>monedas</small></span></div>
            <div className="mision-contenido"><h3>{d.titulo}</h3><p>{d.descripcion}</p></div>
            <div className="mision-progreso-texto"><span>{m.reclamada ? '✓ Recompensa recibida' : lista ? '✦ ¡Misión conseguida!' : 'Tu progreso'}</span><strong>{progreso}<small> / {d.meta}</small></strong></div>
            <progress max={d.meta} value={progreso} aria-label={d.titulo} />
            <button className={'misiones-btn ' + (lista && !m.reclamada ? 'misiones-btn-oro' : 'misiones-btn-contorno')} disabled={!lista || m.reclamada || !!ocupada} onClick={() => reclamar(d.id, () => reclamarMision(g.id, d.id), '+' + d.recompensa + ' monedas recibidas')}>
              {ocupada === d.id ? 'Guardando…' : m.reclamada ? '✓ Premio recibido' : lista ? 'Recoger recompensa' : 'En progreso'}{lista && !m.reclamada && <span aria-hidden="true">→</span>}
            </button>
          </article>;
        })}</div>
      </section>;
    })}
    <p className="misiones-pie">✦ Tu aventura se construye un pequeño paso a la vez.</p>
  </main>;
}
