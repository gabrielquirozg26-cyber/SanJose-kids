import { PersonajeLeccion } from './CompaneroLeccion';
import '../../styles/aula.css';
export default function PantallaVictoria({ oracion, monedasGanadas, errores, totalVersos, escudosUsados, onVolverMapa, aprobado = true, precision, onReintentar, puedeReintentar = true, repaso, mensaje, children }) {
  return <section className="aula-leccion aula-final"><header className="aula-marca"><img src="/logo.jpg" alt="Escudo de la Iglesia San José"/><span><strong>San JoseKids</strong><small>Aprendemos y crecemos en la fe</small></span></header>
    <div className="aula-final-contenido"><div className="aula-amigos-final"><PersonajeLeccion personaje="angel" emocion={aprobado ? 'feliz' : 'calma'}/><PersonajeLeccion personaje="lucy" emocion={aprobado ? 'feliz' : 'calma'}/><PersonajeLeccion personaje="francisco" emocion={aprobado ? 'feliz' : 'calma'}/></div>
      <span className="aula-etiqueta">{aprobado ? repaso ? '⭐ REPASO COMPLETADO' : '⭐ UN PASO MÁS EN TU AVENTURA' : '💛 SEGUIMOS APRENDIENDO'}</span><h1>{aprobado ? '¡Mira hasta dónde llegaste!' : '¡Vamos a intentarlo otra vez!'}</h1><p>{oracion?.nombre}</p>
      <div className="aula-resultados"><article><span aria-hidden="true">🪙</span><strong>+{monedasGanadas}</strong><p>Monedas de la actividad</p></article><article><span aria-hidden="true">{precision === undefined ? '🧩' : '🎯'}</span><strong>{precision === undefined ? totalVersos : precision + '%'}</strong><p>{precision === undefined ? 'Retos recorridos' : 'Respuestas correctas'}</p></article><article><span aria-hidden="true">{escudosUsados ? '🛡️' : '🌱'}</span><strong>{escudosUsados || errores || '✓'}</strong><p>{escudosUsados ? 'Escudos que te cuidaron' : errores ? 'Oportunidades de aprender' : '¡Buen trabajo!'}</p></article></div>
      <p className="aula-final-mensaje">{mensaje ?? (aprobado ? repaso ? '¡Buen repaso! Ganaste monedas de práctica. Los cofres se consiguen al completar nuevas lecciones.' : 'Tus compañeros celebran contigo. Los premios extra te esperan al volver al mapa.' : 'Repasa las respuestas con calma. Este nivel todavía está por completar.')}</p>
      {children}
      {!aprobado && onReintentar && <button className="aula-boton aula-boton-principal" disabled={!puedeReintentar} onClick={onReintentar}>{puedeReintentar ? '¡Lo intento de nuevo!' : 'Recupera vidas para volver a intentar'}</button>}
      <button className={'aula-boton ' + (aprobado ? 'aula-boton-principal' : 'aula-boton-secundario')} onClick={onVolverMapa}>Volver a mi aventura →</button>
    </div>
  </section>;
}
