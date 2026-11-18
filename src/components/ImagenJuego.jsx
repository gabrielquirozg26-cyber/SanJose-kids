import { useState } from 'react';

export default function ImagenJuego({ src, nombre, icono = '😇', className = '' }) {
  const [fallida, setFallida] = useState(null);
  return <span className={'juego-imagen ' + className}>
    {src && fallida !== src ? <img src={src} alt={nombre} loading="lazy" onError={() => setFallida(src)}/> : <span role="img" aria-label={nombre}>{icono}</span>}
  </span>;
}
