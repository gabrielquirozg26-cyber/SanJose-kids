import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useFechaJuego } from '../hooks/useFechaJuego';
import { estadoRacha } from '../utils/celebraciones';
import DailyStreakModal from './DailyStreakModal';
import '../styles/celebraciones.css';

export default function IndicadorRacha() {
  const { userDoc } = useGame();
  const hoy = useFechaJuego();
  const [abierto, setAbierto] = useState(false);
  const info = estadoRacha(userDoc ?? {}, hoy);
  return <><button className="racha-indicador" data-tutorial="racha" data-estado={info.estado} onClick={() => setAbierto(true)} aria-label={'Ver mi racha: ' + info.racha + ' días. ' + (info.hecha ? 'Hoy completado' : 'Tu luz de hoy está pendiente')}>
    <span className="racha-llama" aria-hidden="true">{info.protegida ? '🛡️' : '🔥'}</span><span><strong>{info.racha ? info.racha + (info.racha === 1 ? ' día juntos' : ' días juntos') : 'Tu primera luz'}</strong><small>{info.hecha ? '✓ Hoy completado' : info.racha ? 'Encendamos la luz de hoy' : '¡Comencemos una aventura!'}</small></span><span aria-hidden="true">›</span>
  </button><DailyStreakModal isOpen={abierto} onClose={() => setAbierto(false)} {...info}/></>;
}
