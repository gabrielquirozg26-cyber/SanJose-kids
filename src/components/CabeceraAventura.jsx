import GuiaLuz from './GuiaLuz';
import { useEffect } from 'react';
import '../styles/aventura-vistas.css';

export default function CabeceraAventura({ etiqueta, titulo, descripcion, children }) {
  useEffect(() => {
    document.getElementById('root')?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);
  return <header className="juego-portada">
    <div className="juego-portada-texto"><span className="juego-etiqueta">{etiqueta}</span><h1>{titulo}</h1><p>{descripcion}</p>{children}
      <div className="juego-identidad"><img src="/logo.jpg" alt="Escudo de la Iglesia San José"/><span><strong>San JoseKids</strong><small>Equipo de Catequesis · San José, Diriamba</small></span></div>
    </div><div className="juego-portada-guia"><GuiaLuz/><span>¡Tu aventura de fe continúa!</span></div>
  </header>;
}
