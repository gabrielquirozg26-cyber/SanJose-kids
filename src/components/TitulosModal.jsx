import { useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import DialogoAprendizaje from './DialogoAprendizaje';

export default function TitulosModal({ isOpen, onClose, onComprar }) {
  const { titulosLegendarios, titulosDesbloqueados, monedas } = useGame();
  const [ocupado, setOcupado] = useState(null);
  const [error, setError] = useState('');
  const operando = useRef(false);
  async function comprar(titulo) {
    if (operando.current) return;
    operando.current = true; setOcupado(titulo.id); setError('');
    try { await onComprar(titulo); }
    catch (e) { setError(e.message || 'No se pudo comprar el título. Intenta de nuevo.'); }
    finally { operando.current = false; setOcupado(null); }
  }
  return <DialogoAprendizaje abierto={isOpen} onCerrar={() => { if (!operando.current) onClose(); }} titulo="Tienda de títulos">
    <p>🏅 ¿Qué nombre llevará tu aventurero? Elige tu favorito.</p><div className="aventura-saldo">🪙 Tienes <strong>{monedas}</strong> monedas</div>
    {error && <p role="alert">{error}</p>}
    <div className="aprendizaje-lista">{titulosLegendarios.map(t => {
      const adquirido = titulosDesbloqueados.some(d => d.id === t.id);
      return <article className="aprendizaje-panel aventura-titulo-card" key={t.id}>
        <div className="aventura-medalla" aria-hidden="true">{t.icono}</div><h3>{t.nombre}</h3><p>{t.descripcion}</p>
        <p>🪙 {t.precio} monedas</p>
        <button disabled={adquirido || monedas < t.precio || !!ocupado} onClick={() => comprar(t)}>
          {ocupado === t.id ? 'Guardando…' : adquirido ? '✓ Adquirido' : monedas < t.precio ? 'Te faltan ' + (t.precio - monedas) + ' monedas' : 'Comprar título'}
        </button>
      </article>;
    })}</div>
  </DialogoAprendizaje>;
}
