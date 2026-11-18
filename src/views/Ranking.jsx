import { useEffect, useEffectEvent, useState } from 'react';
import { useGame } from '../context/GameContext';
import CabeceraAventura from '../components/CabeceraAventura';
import ImagenJuego from '../components/ImagenJuego';
import RankingGrupos from './RankingGrupos';
const medallas = ['🥇', '🥈', '🥉'];
const foto = avatar => typeof avatar === 'string' && /^(https?:|data:image|\/images\/)/.test(avatar) ? avatar : null;
function Avatar({ usuario }) { return <ImagenJuego src={foto(usuario.avatar)} nombre={'Avatar de ' + usuario.nombre} icono={foto(usuario.avatar) ? '😇' : usuario.avatar || '😇'}/>; }
export default function Ranking({ onSeleccionarUsuario }) {
  const { grupo, usuarioId, monedas, obtenerRanking, obtenerRankingGlobal, obtenerRankingGrupos, setActiveTab } = useGame();
  const [modo, setModo] = useState('grupo');
  const [reintento, setReintento] = useState(0);
  const [resultado, setResultado] = useState({ modo: null, lista: [], error: null });
  const obtener = useEffectEvent(tipo => tipo === 'grupos' ? obtenerRankingGrupos() : tipo === 'global' ? obtenerRankingGlobal() : (!grupo || grupo === 'Sin Grupo') ? Promise.resolve(null) : obtenerRanking(grupo));
  useEffect(() => {
    let vigente = true;
    async function cargar() {
      try {
        const lista = await obtener(modo);
        if (vigente) setResultado({ modo, grupo, reintento, lista: lista ?? [], error: lista === null ? 'grupo' : null });
      } catch {
        if (vigente) setResultado({ modo, grupo, reintento, lista: [], error: 'conexion' });
      }
    }
    void cargar();
    return () => { vigente = false; };
  }, [modo, grupo, reintento]);
  const cargando = resultado.modo !== modo || resultado.grupo !== grupo || resultado.reintento !== reintento;
  const lista = cargando ? [] : resultado.lista;
  const posicion = lista.findIndex(u => u.uid === usuarioId);
  return <section className="zona-aventura zona-ranking">
    <CabeceraAventura etiqueta="🏆 COMPAÑEROS DE AVENTURA" titulo="¡Juntos llegamos más lejos!" descripcion="Celebra tus pasos y los de tus amigos. Aquí cada uno aprende a su ritmo.">
      <button className="juego-btn" onClick={() => setActiveTab('mapa')}>Seguir mi aventura →</button>
    </CabeceraAventura>
    <nav className="juego-pestanas" aria-label="Elegir clasificación">{[['grupo', '🏠 Mi grupo'], ['global', '🌎 Todos'], ['grupos', '🤝 Equipos']].map(([id, label]) => <button key={id} onClick={() => setModo(id)} aria-pressed={modo === id}>{label}</button>)}</nav>
    <div className="juego-nota"><span aria-hidden="true">⭐</span><p><strong>Tu esfuerzo también cuenta</strong><br/>{modo === 'grupos' ? 'Sumamos las monedas de cada equipo de catequesis.' : 'La lista se ordena por monedas disponibles. Al comprar, tu saldo cambia.'}</p><span className="juego-chip">🪙 Tus monedas: {monedas.toLocaleString()}</span></div>
    {cargando ? <p className="juego-panel" role="status">Luci está reuniendo a tus compañeros…</p> : resultado.error ? <div className="juego-vacio"><h2>{resultado.error === 'grupo' ? 'Tu equipo te espera' : 'No pudimos cargar la lista'}</h2><p>{resultado.error === 'grupo' ? 'Pide a tu catequista que te asigne un grupo. Mientras tanto puedes ver a todos.' : 'Comprueba la conexión e intenta otra vez.'}</p><button className="juego-btn" onClick={() => resultado.error === 'grupo' ? setModo('global') : setReintento(n => n + 1)}>{resultado.error === 'grupo' ? 'Ver a todos' : 'Intentar de nuevo'}</button></div> : modo === 'grupos' ? <RankingGrupos grupos={lista}/> : !lista.length ? <div className="juego-vacio"><span aria-hidden="true">🌱</span><h2>¡La aventura está comenzando!</h2><p>Cuando haya compañeros en esta lista, aparecerán aquí.</p><button className="juego-btn" onClick={() => setActiveTab('mapa')}>Volver al mapa</button></div> : <>
      <div className="juego-seccion-titulo"><h2>{modo === 'grupo' ? grupo : 'Nuestra comunidad'}</h2><p>{lista.length} aventureros{posicion >= 0 ? ' · Tu posición: ' + (posicion + 1) : ''}</p></div>
      <div className="ranking-podio" aria-label="Primeras posiciones">{lista.slice(0, 3).map((u, i) => <button className="ranking-podio-carta" key={u.uid ?? i} data-puesto={i} onClick={() => onSeleccionarUsuario?.(u)}><span className="ranking-medalla" aria-hidden="true">{medallas[i]}</span><Avatar usuario={u}/><h3>{u.nombre}</h3><span className="juego-chip">🪙 {(u.monedas ?? 0).toLocaleString()}</span><p>{i + 1}ª posición</p></button>)}</div>
      <h2 className="juego-subtitulo">Todos aportamos algo especial</h2>
      <ol className="ranking-lista">{lista.map((u, i) => <li key={u.uid ?? i}><button className={'ranking-fila ' + (u.uid === usuarioId ? 'ranking-fila-mia' : '')} onClick={() => onSeleccionarUsuario?.(u)} aria-label={'Ver perfil de ' + u.nombre}><span className="ranking-numero">{i < 3 ? medallas[i] : i + 1}</span><Avatar usuario={u}/><span className="ranking-nombre"><strong>{u.nombre}{u.uid === usuarioId ? ' · Tú' : ''}</strong><small>{u.rango || 'Aventurero de la fe'}</small></span><span className="ranking-saldo">🪙 {(u.monedas ?? 0).toLocaleString()}</span><span aria-hidden="true">→</span></button></li>)}</ol>
    </>}
  </section>;
}
