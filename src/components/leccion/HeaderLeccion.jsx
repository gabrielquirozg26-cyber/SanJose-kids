import '../../styles/aula.css';
import { useRef } from 'react';
import { useAulaViewport } from '../../hooks/useAulaViewport';
export default function HeaderLeccion({ titulo, progreso = 0, vidas, escudoActivo, onCerrar, procesando }) {
  const ref = useRef(null);
  useAulaViewport(ref);
  return <header className="aula-header" ref={ref}><div className="aula-marca"><img src="/logo.jpg" alt="Escudo de la Iglesia San José"/><span><strong>San JoseKids</strong><small>Catequesis San José · Diriamba</small></span></div><button className="aula-boton aula-salir" disabled={procesando} onClick={onCerrar} aria-label="Volver al mapa"><span aria-hidden="true">← </span><span className="aula-salir-largo">Volver al mapa</span><span className="aula-salir-corto">Mapa</span></button>
    <div className="aula-header-progreso"><progress value={Math.min(100, Math.max(0, progreso))} max={100} aria-label={'Progreso de ' + titulo}/><span className="aula-vidas" aria-label={vidas + ' vidas'}>❤️ {vidas}{escudoActivo && <span aria-label="Tienes un escudo"> 🛡️</span>}</span></div>
  </header>;
}
