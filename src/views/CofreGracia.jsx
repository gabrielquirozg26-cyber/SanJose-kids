import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import GuiaLuz from '../components/GuiaLuz';
import ImagenJuego from '../components/ImagenJuego';
import DialogoJuego from '../components/ui/DialogoJuego';
import '../styles/aventura-vistas.css';

const nombres = { madera: 'Cofre de madera', plata: 'Cofre de plata', oro: 'Cofre de oro' };
const rarezas = { comun: 'Común', raro: 'Raro', epico: 'Épico', legendario: 'Legendario' };
const estrellas = [[12,32],[82,28],[28,10],[70,60],[45,5],[10,68],[90,65],[62,15]];
function DibujoCofre({ tipo }) {
  const color = tipo === 'oro' ? '#e9b84b' : tipo === 'plata' ? '#a8c5e3' : '#b98152';
  return <svg className="cofre-dibujo" viewBox="0 0 260 200" role="img" aria-label={nombres[tipo] ?? nombres.madera}>
    <ellipse cx="130" cy="180" rx="100" ry="12" fill="#0e173d" opacity=".5"/>
    <path d="M38 93h184v69q0 14-14 14H52q-14 0-14-14Z" fill={color} stroke="#513f49" strokeWidth="5"/>
    <path d="M45 119h170M88 97v77M175 97v77" stroke="#513f49" strokeWidth="6" opacity=".45"/>
    <path d="M43 163h174" stroke="#ffe9b3" strokeWidth="6"/>
    <g className="cofre-tapa"><path d="M34 92V73q0-36 36-36h120q36 0 36 36v19Z" fill={color} stroke="#513f49" strokeWidth="5"/><path d="M45 82V73q0-24 25-24h120" fill="none" stroke="#fff0ba" strokeWidth="7" strokeLinecap="round"/><path d="M85 40v51M177 40v51" stroke="#513f49" strokeWidth="7" opacity=".4"/><path d="M32 94h196" stroke="#ffdf8c" strokeWidth="10" strokeLinecap="round"/></g>
    <rect x="109" y="83" width="42" height="47" rx="12" fill="#ffdf8c" stroke="#71573d" strokeWidth="3"/><circle cx="130" cy="102" r="6" fill="#71573d"/><path d="M130 104v12" stroke="#71573d" strokeWidth="5"/>
  </svg>;
}

export default function CofreGracia({ tipoCofre, recompensa, onCerrar, onVerAlbum }) {
  const [estado, setEstado] = useState('cerrado');
  const abriendo = useRef(false);
  const reducir = useReducedMotion();
  useEffect(() => {
    if (estado !== 'abriendo') return;
    const timer = setTimeout(() => setEstado('revelado'), reducir ? 100 : 1000);
    return () => clearTimeout(timer);
  }, [estado, reducir]);
  const abrir = () => {
    if (abriendo.current) return;
    abriendo.current = true;
    setEstado('abriendo');
  };
  const nuevo = recompensa?.tipo === 'nuevo';
  const repetido = recompensa?.tipo === 'repetido';
  const santo = recompensa?.santo;
  const revelado = estado === 'revelado';
  return <DialogoJuego titulo={revelado ? nuevo ? '¡Un nuevo amigo te acompaña!' : repetido ? '¡Tu colección también te regala!' : 'Tu regalo de aventura' : '¡Un regalo para tu aventura!'} onClose={onCerrar} className={'cofre-dialogo cofre-' + estado}>
    {!revelado && <p className="celebracion-intro">{nombres[tipoCofre] ?? nombres.madera} · Lucy quiere descubrirlo contigo.</p>}
    {!revelado && <div className="cofre-escena"><div className="cofre-luz" aria-hidden="true"/><DibujoCofre tipo={tipoCofre}/>{estado === 'abriendo' && !reducir && <div className="cofre-estrellas" aria-hidden="true">{estrellas.map(([x,y],i) => <span key={i} style={{'--x': x + '%','--y': y + '%'}}>✦</span>)}</div>}<div className="cofre-amiga"><GuiaLuz/></div></div>}
    <div className="cofre-resultado-texto" role="status">{estado === 'abriendo' ? 'La tapa se abre… ¡aquí viene tu regalo!' : estado === 'cerrado' ? '¿Listo para descubrir quién llegó?' : 'Tu premio ya está guardado.'}</div>
    {revelado && <article className="cofre-carta" data-rareza={santo?.rareza}>
      <span className="cofre-distintivo">{nuevo ? '✦ Nuevo en tu álbum' : repetido ? '🪙 Amigo repetido' : '✦ Regalo recibido'}</span>
      {santo && <><ImagenJuego src={santo.imagen} nombre={santo.nombre} icono={santo.icono}/><h3>{santo.nombre}</h3><p className="cofre-rareza">{rarezas[santo.rareza] ?? 'Coleccionable'} · Compañero de tu aventura de fe</p></>}
      {repetido && <p>Ya te acompañaba. Recibiste <strong>+{recompensa.compensacion ?? 0} monedas</strong>.</p>}
      {nuevo && <p>¡Descubre su historia en tu álbum!</p>}
    </article>}
    {!revelado ? <button className="celebracion-btn" disabled={estado === 'abriendo'} onClick={abrir}>{estado === 'abriendo' ? 'Descubriendo…' : '¡Abrir mi cofre!'}</button> : <>{santo && onVerAlbum && <button className="celebracion-btn" onClick={onVerAlbum}>Ver en mi álbum →</button>}<button className={'celebracion-btn' + (onVerAlbum && santo ? ' celebracion-btn-secundario' : '')} onClick={onCerrar}>¡Seguir jugando!</button></>}
    {!revelado && <p><small>El regalo ya está guardado aunque cierres esta ventana.</small></p>}
  </DialogoJuego>;
}
