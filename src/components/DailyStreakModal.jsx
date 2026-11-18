import GuiaLuz from './GuiaLuz';
import DialogoJuego from './ui/DialogoJuego';

export function LucesRacha({ racha = 0 }) {
  const tramo = Math.floor(Math.max(0, racha - 1) / 7) * 7;
  return <div className="racha-tramo"><p>Tu camino, una luz cada día</p><ol aria-label="Tramo de siete días de racha">{Array.from({ length: 7 }, (_, i) => {
    const dia = tramo + i + 1;
    return <li key={dia} data-encendida={dia <= racha} aria-label={'Día ' + dia + (dia <= racha ? ', alcanzado' : ', por alcanzar')}><span aria-hidden="true">{dia <= racha ? '✦' : '○'}</span><small>{dia}</small></li>;
  })}</ol><small>Un tramo de tu racha, no un calendario de asistencia.</small></div>;
}

export default function DailyStreakModal({ isOpen, onClose, racha = 0, recompensa, estado = 'activo', protegida = false, onContinuar }) {
  if (!isOpen) return null;
  const premio = Number.isFinite(recompensa) && recompensa > 0;
  const titulo = premio ? '¡Tu constancia brilla!' : racha ? racha + (racha === 1 ? ' día de aventura' : ' días de aventura') : '¡Encendamos tu primera luz!';
  return <DialogoJuego titulo={titulo} onClose={onClose} className="racha-dialogo">
    <div className="celebracion-mascota"><GuiaLuz celebrando={premio}/></div>
    <p className="celebracion-intro">{premio ? 'Un paso pequeño cada día hace un gran camino.' : estado === 'activo' ? '¡Hoy ya hiciste brillar tu luz!' : racha ? 'Una lección hoy mantiene tu camino encendido.' : 'Siempre podemos empezar. ¡Lucy te acompaña!'}</p>
    {protegida && <p className="celebracion-nota">🛡️ Tu protector cuida este tramo. Juega hoy para continuar.</p>}
    <LucesRacha racha={racha}/>
    {premio && <div className="racha-premio" role="status"><span aria-hidden="true">🪙</span><div><strong>+{recompensa} monedas</strong><p>Ya guardadas en tu aventura</p></div></div>}
    <button className="celebracion-btn" onClick={onContinuar ?? onClose}>{premio || estado === 'activo' ? '¡Seguir mi aventura!' : '¡Vamos al mapa!'}</button>
  </DialogoJuego>;
}
