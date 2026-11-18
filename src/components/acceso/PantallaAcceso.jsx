import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import GuiaLuz from '../GuiaLuz';
import Lily from '../tutorial/Lily';
import { mensajeAcceso } from '../../utils/mensajeAcceso';
import '../../styles/acceso.css';

export default function PantallaAcceso({ catequista = false, acceder, onExito, onEnviando }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const bloqueo = useRef(false);
  const errorRef = useRef(null);
  const id = useId();
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);

  async function enviar(e) {
    e.preventDefault();
    if (bloqueo.current) return;
    if (!email.trim() || !password) { setError('Escribe tu correo y tu contraseña para entrar.'); return; }
    bloqueo.current = true; setCargando(true); setError(''); onEnviando?.(true);
    try { await acceder(email.trim(), password); onExito?.(); }
    catch (err) { setError(mensajeAcceso(err)); }
    finally { bloqueo.current = false; setCargando(false); onEnviando?.(false); }
  }

  return <main className={'acceso-pagina' + (catequista ? ' acceso-catequista' : '')}>
    <div className="acceso-contenedor">
      <header className="acceso-marca"><img src="/logo.jpg" alt="Escudo de la Iglesia San José"/><div><strong>San JoseKids</strong><span>Equipo de Catequesis · San José, Diriamba</span></div></header>
      <div className="acceso-distribucion">
        <section className="acceso-presentacion" aria-labelledby={id + '-bienvenida'}>
          <span className="acceso-etiqueta">✦ APRENDEMOS Y CRECEMOS EN LA FE</span>
          <h1 id={id + '-bienvenida'}>{catequista ? <>Acompañamos<br/><em>su camino.</em></> : <>Una nueva aventura.<br/><em>Una luz más.</em></>}</h1>
          <p>{catequista ? 'Un espacio para acompañar a tus alumnos y celebrar cada nuevo aprendizaje.' : 'Explora nuevos reinos, aprende con tus amigos y descubre los tesoros de tu fe.'}</p>
          <div className="acceso-amigos"><GuiaLuz/><div className="acceso-burbuja"><strong>{catequista ? '¡Qué bueno tenerte aquí!' : '¡Qué alegría verte!'}</strong><span>{catequista ? 'Juntos hacemos brillar sus talentos.' : 'Soy Lucy. ¿Seguimos nuestra aventura?'}</span></div><div className="acceso-lily" aria-hidden="true"><Lily/></div></div>
          <div className="acceso-camino" aria-hidden="true"><span>📖 Aprender</span><i>✦</i><span>🌟 Descubrir</span><i>✦</i><span>💛 Compartir</span></div>
        </section>
        <section className="acceso-tarjeta" aria-labelledby={id + '-titulo'}>
          <nav className="acceso-roles" aria-label="Elige tu acceso"><Link to="/" aria-current={!catequista ? 'page' : undefined}>😇 Estudiante</Link><Link to="/catequista" aria-current={catequista ? 'page' : undefined}>👋 Catequista</Link></nav>
          <div className="acceso-formulario-titulo"><span aria-hidden="true">{catequista ? '📚' : '✨'}</span><h2 id={id + '-titulo'}>{catequista ? 'Tu espacio de catequesis' : '¡Entra a tu aventura!'}</h2><p>{catequista ? 'Ingresa con tu cuenta de catequista o coordinación.' : 'Usa el correo y la contraseña que te dio tu catequista.'}</p></div>
          <form onSubmit={enviar} aria-busy={cargando}>
            <div className="acceso-campo"><label htmlFor={id + '-correo'}>Tu correo</label><input id={id + '-correo'} name="username" type="email" inputMode="email" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} required value={email} onChange={e => setEmail(e.target.value)} disabled={cargando} placeholder="nombre@ejemplo.com"/></div>
            <div className="acceso-campo"><label htmlFor={id + '-password'}>Tu contraseña</label><div className="acceso-password"><input id={id + '-password'} name="password" type={visible ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} disabled={cargando} placeholder="Escribe tu contraseña"/><button type="button" disabled={cargando} aria-pressed={visible} aria-controls={id + '-password'} aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setVisible(v => !v)}>{visible ? 'Ocultar' : 'Mostrar'}</button></div></div>
            {error && <p className="acceso-error" id={id + '-error'} role="alert" tabIndex={-1} ref={errorRef}>💛 {error}</p>}
            <button className="acceso-entrar" type="submit" disabled={cargando}>{cargando ? <><span className="acceso-espera" aria-hidden="true"/>Entrando…</> : <>{catequista ? 'Entrar al panel' : '¡Vamos a jugar!'}<span aria-hidden="true">→</span></>}</button>
            <span className="acceso-estado" role="status">{cargando ? 'Estamos preparando tu acceso.' : ''}</span>
          </form>
          <aside className="acceso-ayuda"><span aria-hidden="true">💬</span><p><strong>¿Necesitas ayuda para entrar?</strong><br/>{catequista ? 'Pide al equipo coordinador que revise tus datos de acceso.' : 'Pide a tu familia o a tu catequista que revise tus datos contigo.'}</p></aside>
        </section>
      </div>
      <footer className="acceso-pie">«Dejen que los niños vengan a mí» <span>Mateo 19:14</span><strong>Aprendemos, compartimos y crecemos juntos.</strong></footer>
    </div>
  </main>;
}
