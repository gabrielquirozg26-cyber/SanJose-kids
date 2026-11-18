import { useGame } from '../context/GameContext';
import './Navbar.css';
const pestañas = [
  ['mapa', '🗺️', 'Mapa'], ['album', '📖', 'Álbum'], ['tienda', '🛒', 'Tienda'],
  ['ranking', '🏆', 'Ranking'], ['misiones', '⭐', 'Misiones'], ['perfil', '👤', 'Perfil'],
];
export default function Navbar() {
  const { activeTab, setActiveTab } = useGame();
  function abrir(id) {
    setActiveTab(id);
    document.getElementById('root')?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }
  return <nav className="nav-juego" data-tutorial="navegacion" aria-label="Mi aventura San JoseKids"><div className="nav-juego-pestanas">{pestañas.map(([id, icono, label]) => <button className="nav-juego-boton" key={id} aria-current={activeTab === id ? 'page' : undefined} onClick={() => abrir(id)}><span className="nav-juego-icono" aria-hidden="true">{icono}</span><span className="nav-juego-label">{label}</span></button>)}</div></nav>;
}
