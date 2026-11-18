import { useState } from 'react';
import CabeceraAventura from '../components/CabeceraAventura';
import ImagenJuego from '../components/ImagenJuego';
import niveles from '../data/niveles.json';
import santosData from '../data/santos.json';
import { obtenerProgreso } from '../utils/progreso';

export default function PerfilPublico({ usuario, onVolver }) {
  const [tab, setTab] = useState('info');
  if (!usuario) return <section className="zona-aventura"><button className="juego-btn" onClick={onVolver}>← Volver al ranking</button><p>No pudimos abrir este perfil.</p></section>;
  const progreso = obtenerProgreso(usuario.nivelesCompletados ?? [], niveles.unidades);
  const titulo = usuario.titulosDesbloqueados?.find(t => t.id === usuario.tituloEquipado);
  const santos = santosData.santos.filter(s => usuario.coleccion?.includes(s.id));
  const favorito = santosData.santos.find(s => s.id === usuario.santoFavorito);
  const imagen = /^(https?:|data:image|\/images\/)/.test(usuario.avatar ?? '') ? usuario.avatar : null;
  const marco = usuario.marcoEquipado ?? ['marco_vitral_dorado', 'marco_vitral_azul'].find(id => usuario.inventario?.includes(id));
  const aura = !marco && usuario.inventario?.includes('aura_santidad');
  return <section className="zona-aventura zona-perfil-publico"><button className="juego-btn juego-btn-secundario" onClick={onVolver}>← Volver al ranking</button>
    <CabeceraAventura etiqueta="🤝 UN COMPAÑERO DE AVENTURA" titulo={usuario.nombre} descripcion={'⛪ ' + (usuario.grupo || 'Nuestra comunidad de catequesis')}>
      <div className="perfil-credencial"><div data-marco={marco} className={'perfil-avatar ' + (aura ? 'perfil-avatar-aura' : '')}><ImagenJuego src={imagen} nombre={'Avatar de ' + usuario.nombre} icono={imagen ? '😇' : usuario.avatar || '😇'}/></div><span className="juego-chip">🏅 {titulo?.nombre || usuario.rango || 'Aventurero de la fe'}</span></div>
    </CabeceraAventura>
    <nav className="juego-pestanas" aria-label="Secciones del perfil de mi compañero">{[['info', '👋 Sobre mi compañero'], ['coleccion', '📖 Sus tesoros'], ['stats', '🌟 Su camino']].map(([id, label]) => <button key={id} onClick={() => setTab(id)} aria-pressed={tab === id}>{label}</button>)}</nav>
    {tab === 'info' && <div className="perfil-publico-info"><article className="juego-panel"><h2>👋 Un poquito sobre mí</h2><p>{usuario.biografia || 'Este aventurero todavía está escribiendo su historia.'}</p></article><article className="juego-panel"><h2>🙏 Su santo favorito</h2><p>{favorito ? favorito.icono + ' ' + favorito.nombre : 'Todavía está descubriendo a su favorito.'}</p></article></div>}
    {tab === 'coleccion' && <><h2 className="juego-subtitulo">🏅 Títulos conseguidos</h2><div className="juego-insignias">{usuario.titulosDesbloqueados?.length ? usuario.titulosDesbloqueados.map(t => <span className="juego-chip" key={t.id}>{t.nombre}</span>) : <p>Su primer título está por llegar.</p>}</div><h2 className="juego-subtitulo">📖 Sus amigos santos · {santos.length}</h2>{!santos.length && <p>Su primer amigo está por descubrir.</p>}<div className="album-cartas">{santos.map(s => <article className="album-carta" key={s.id}><div className="album-carta-arte"><ImagenJuego src={s.imagen} nombre={s.nombre} icono={s.icono}/></div><div className="album-carta-texto"><h3>{s.nombre}</h3></div></article>)}</div></>}
    {tab === 'stats' && <><div className="perfil-estadisticas"><article className="juego-panel"><p>🏅 Nivel</p><strong>{progreso.nivelActual}</strong></article><article className="juego-panel"><p>🪙 Monedas</p><strong>{(usuario.monedas ?? 0).toLocaleString()}</strong></article><article className="juego-panel"><p>🔥 Racha</p><strong>{usuario.racha ?? 0} días</strong></article><article className="juego-panel"><p>📖 Santos</p><strong>{santos.length}</strong></article></div><article className="juego-panel"><h2>Su camino de aprendizaje</h2><p>{progreso.leccionesCompletadas.length} de {niveles.unidades.flatMap(u => u.lecciones).length} lecciones completadas.</p><div className="juego-progreso"><progress value={progreso.porcentaje} max={100} aria-label="Progreso de aprendizaje"/></div></article></>}
  </section>;
}
