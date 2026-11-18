import { useGame } from '../context/GameContext';
import NavegacionJuego from './NavegacionJuego';
import { contenedorJuego } from '../utils/scrollJuego';
export default function Navbar() {
  const { activeTab, setActiveTab } = useGame();
  function abrir(id) {
    setActiveTab(id);
    contenedorJuego()?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }
  return <NavegacionJuego activeTab={activeTab} onSeleccionar={abrir}/>;
}
