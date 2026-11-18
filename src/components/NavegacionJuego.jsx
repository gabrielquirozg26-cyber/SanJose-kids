import './Navbar.css';

const pestañas = [
  ['mapa', '🗺️', 'Mapa'], ['album', '📖', 'Álbum'], ['tienda', '🛒', 'Tienda'],
  ['ranking', '🏆', 'Ranking'], ['misiones', '⭐', 'Misiones'], ['perfil', '👤', 'Perfil'],
];
export default function NavegacionJuego({ activeTab, onSeleccionar }) {
  return <nav className="nav-juego" data-tutorial="navegacion" aria-label="Mi aventura San JoseKids"><div className="nav-juego-pestanas">{pestañas.map(([id, icono, label]) => <button className="nav-juego-boton" key={id} aria-current={activeTab === id ? 'page' : undefined} onClick={() => onSeleccionar(id)}><span className="nav-juego-icono" aria-hidden="true">{icono}</span><span className="nav-juego-label">{label}</span></button>)}</div></nav>;
}
