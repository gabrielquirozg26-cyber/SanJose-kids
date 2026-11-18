import { useId } from 'react';
import './GuiaLuz.css';

// Ilustración vectorial compartida: se adapta a cualquier tamaño sin cargar imágenes.
export default function GuiaLuz({ celebrando = false, className = '' }) {
  const id = useId().replaceAll(':', '');
  return <svg className={'guia-luz ' + className} viewBox="0 0 280 240" role="img" aria-label={celebrando ? 'Luci, tu estrella compañera, celebra contigo' : 'Luci, tu estrella compañera, te invita a explorar'}>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff5a8"/><stop offset=".55" stopColor="#ffd354"/><stop offset="1" stopColor="#ffa847"/></linearGradient>
    </defs>
    <circle cx="140" cy="121" r="96" fill="#b6c7ff" opacity=".1"/>
    <circle cx="140" cy="121" r="76" fill="none" stroke="#c6d5ff" strokeDasharray="4 10" opacity=".3"/>
    <ellipse cx="141" cy="216" rx="65" ry="10" fill="#0b1640" opacity=".22"/>
    <g className="guia-luz-personaje">
      <path d="M112 176q-10 25-26 24m79-24q11 25 27 24" stroke="#e7a444" strokeWidth="13" strokeLinecap="round"/>
      <path d={celebrando ? 'M72 121Q38 110 38 78m170 43q34-11 34-43' : 'M72 121q-29 7-32-12m168 12q26 8 34-15'} stroke="#ffd466" strokeWidth="13" strokeLinecap="round" fill="none"/>
      <path d="M148 37l23 44 48 8q15 3 5 15l-34 34 7 48q2 17-14 10l-43-23-44 23q-15 7-13-10l8-48-35-34q-11-12 5-15l48-8 23-44q8-15 16 0Z" fill={'url(#' + id + ')'} stroke="#ffea92" strokeWidth="4" strokeLinejoin="round"/>
      <path d="m140 49 18 34" stroke="#fff9d5" strokeWidth="7" strokeLinecap="round" opacity=".9"/>
      <ellipse cx="111" cy="126" rx="13" ry="8" fill="#ef927e" opacity=".65"/><ellipse cx="170" cy="126" rx="13" ry="8" fill="#ef927e" opacity=".65"/>
      {celebrando ? <path d="m112 110 8-6 8 6m25 0 8-6 8 6" stroke="#49364a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/> : <><ellipse cx="120" cy="111" rx="5" ry="8" fill="#49364a"/><ellipse cx="160" cy="111" rx="5" ry="8" fill="#49364a"/><circle cx="121" cy="108" r="2" fill="white"/><circle cx="161" cy="108" r="2" fill="white"/></>}
      <path d="M129 131q11 14 23 0" stroke="#49364a" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="m115 173 25-12 26 12-26 13Z" fill="#6d76d8"/><path d="m128 175 12-7 12 7-12 6Z" fill="#c8d6ff"/>
    </g>
    <g fill="#ffe493"><path d="m34 42 4 10 10 4-10 4-4 10-4-10-10-4 10-4Z"/><path d="m231 156 4 9 9 4-9 4-4 9-4-9-9-4 9-4Z"/></g>
    <g fill="#aebdff"><circle cx="231" cy="48" r="5"/><circle cx="55" cy="180" r="4"/><circle cx="199" cy="21" r="3"/></g>
  </svg>;
}
