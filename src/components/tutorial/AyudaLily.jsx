import { useTutorialLily } from './TutorialContext';
import Lily from './Lily';
import '../../styles/tutorial-lily.css';

export default function AyudaLily() {
  const tutorial = useTutorialLily();
  if (!tutorial) return null;
  return <aside className="lily-ayuda"><Lily/><div><h2>¿Exploramos juntos?</h2><p>Puedo enseñarte el juego o recordarte las novedades.</p><div className="lily-ayuda-acciones"><button onClick={() => tutorial.abrir('completo')}>Lily, muéstrame el juego</button><button onClick={() => tutorial.abrir('actualizacion')}>Ver las novedades</button></div></div></aside>;
}
