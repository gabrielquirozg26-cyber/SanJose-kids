import { useEffect, useState } from 'react';
import { fechaJuego } from '../utils/economia.js';

export function useFechaJuego() {
  const [hoy, setHoy] = useState(fechaJuego);
  useEffect(() => {
    const timer = setInterval(() => setHoy(fechaJuego()), 60000);
    return () => clearInterval(timer);
  }, []);
  return hoy;
}
