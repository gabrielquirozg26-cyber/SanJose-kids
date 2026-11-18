import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from '../components/ui/Toast';
import santosData from '../data/santos.json';
import CabeceraAventura from '../components/CabeceraAventura';
import ImagenJuego from '../components/ImagenJuego';

const rarezas = { comun: 'Común', raro: 'Raro', legendario: 'Legendario' };
const orden = { comun: 0, raro: 1, legendario: 2 };
const normalizar = texto => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export default function Album({ onSeleccionarSanto }) {
  const { coleccion, setActiveTab } = useGame();
  const { showToast } = useToast();
  const [estado, setEstado] = useState('todos');
  const [rareza, setRareza] = useState('todos');
  const [seccion, setSeccion] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const catalogo = santosData.santos;
  const obtenidos = new Set(coleccion);
  const cantidad = catalogo.filter(s => obtenidos.has(s.id)).length;
  const filtrados = catalogo.filter(s =>
    (estado === 'todos' || (estado === 'mios' ? obtenidos.has(s.id) : !obtenidos.has(s.id))) &&
    (rareza === 'todos' || s.rareza === rareza) && (seccion === 'todos' || s.seccion === seccion) &&
    normalizar(s.nombre + ' ' + s.descripcion).includes(normalizar(busqueda.trim())))
    .sort((a, b) => Number(obtenidos.has(b.id)) - Number(obtenidos.has(a.id)) || orden[b.rareza] - orden[a.rareza]);
  function limpiar() { setBusqueda(''); setEstado('todos'); setRareza('todos'); setSeccion('todos'); }
  return <section className="zona-aventura zona-album" data-tutorial="album">
    <CabeceraAventura etiqueta="📖 MI ÁLBUM DE SANTOS" titulo="¡Amigos para tu aventura!" descripcion="Descubre sus historias y aprende de sus grandes pequeños gestos.">
      <div className="juego-progreso"><div><strong>{cantidad} de {catalogo.length} descubiertos</strong><span>{Math.round(cantidad / catalogo.length * 100)}%</span></div><progress value={cantidad} max={catalogo.length} aria-label="Santos descubiertos"/></div>
    </CabeceraAventura>
    <aside className="juego-nota"><span aria-hidden="true">🎁</span><p><strong>¿Cómo consigo más santos?</strong><br/>Completa una lección nueva para ganar un cofre. Los repetidos dan monedas.</p><button className="juego-btn" onClick={() => setActiveTab('mapa')}>¡Ir a la aventura! →</button></aside>
    <nav className="juego-pestanas" aria-label="Ver santos por colección">{[['todos', '📚 Todos'], ['mios', '⭐ Mis santos'], ['faltan', '🔎 Por descubrir']].map(([id, label]) => <button key={id} aria-pressed={estado === id} onClick={() => setEstado(id)}>{label}</button>)}</nav>
    <div className="juego-herramientas"><label>🔍 Busca un santo<input type="search" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Por ejemplo: José"/></label><label>Familia de santos<select value={seccion} onChange={e => setSeccion(e.target.value)}><option value="todos">Todas las familias</option>{[...new Set(catalogo.map(s => s.seccion))].map(s => <option key={s}>{s}</option>)}</select></label><label>Tipo de carta<select value={rareza} onChange={e => setRareza(e.target.value)}><option value="todos">Todos los tipos</option>{Object.entries(rarezas).map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)}</select></label></div>
    <div className="juego-seccion-titulo"><h2>Tu colección de amigos</h2><p role="status">{filtrados.length} cartas</p></div>
    {!filtrados.length ? <div className="juego-vacio"><span aria-hidden="true">🔍</span><h2>¡Busquemos por otro camino!</h2><p>{estado === 'mios' && !cantidad ? 'Tu primer amigo llegará con un cofre. ¡Completa una nueva lección!' : 'Prueba otro nombre o cambia los filtros.'}</p><button className="juego-btn" onClick={limpiar}>Ver todas las cartas</button></div> :
    <div className="album-cartas">{filtrados.map(s => {
      const mia = obtenidos.has(s.id);
      return <button key={s.id} className={'album-carta ' + (mia ? 'album-carta-mia' : 'album-carta-pendiente')} data-rareza={s.rareza} aria-label={s.nombre + (mia ? ', leer su historia' : ', por descubrir')} onClick={() => mia ? onSeleccionarSanto?.(s) : showToast('Este amigo llegará en un cofre. Completa una lección nueva para conseguir uno.', 'info')}>
        <div className="album-carta-arte"><ImagenJuego src={mia ? s.imagen : null} nombre={mia ? s.nombre : 'Carta por descubrir'} icono={s.icono}/><span className="album-rareza">{mia ? rarezas[s.rareza] : '🔒 Por descubrir'}</span></div><div className="album-carta-texto"><h3>{s.nombre}</h3><p>{mia ? '✓ Tu amigo · Leer historia →' : 'Un nuevo amigo te espera'}</p></div>
      </button>;
    })}</div>}
  </section>;
}
