import { useId } from 'react';

// Personaje original del tutorial; Lucy conserva su identidad en el resto del juego.
export default function Lily() {
  const id = useId().replaceAll(':', '');
  return <svg className="lily-avatar" viewBox="0 0 180 190" role="img" aria-label="Lily, tu angelita guía">
    <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#cbbcff"/><stop offset="1" stopColor="#8999ef"/></linearGradient></defs>
    <ellipse cx="88" cy="177" rx="43" ry="7" fill="#101a42" opacity=".2"/>
    <g className="lily-saludo"><path d="M61 100C9 63 9 130 61 143M119 100c52-37 52 30 0 43" fill="#edf3ff" stroke="#b4cbef" strokeWidth="3"/>
      <ellipse cx="90" cy="22" rx="27" ry="7" fill="none" stroke="#ffdc76" strokeWidth="5"/>
      <path d="M57 75q-4-42 33-42t33 42v35H57Z" fill="#705347"/>
      <path d="M69 113h42l17 49q-38 17-76 0Z" fill={'url(#' + id + ')'} stroke="#e0d8ff" strokeWidth="3"/>
      <path d="m73 159-4 13m38-13 4 13" stroke="#705347" strokeWidth="10" strokeLinecap="round"/>
      <path d="M62 122q-18-3-20-19m76 19q17-7 20-22" fill="none" stroke="#f2c5a5" strokeWidth="10" strokeLinecap="round"/>
      <ellipse cx="90" cy="80" rx="29" ry="33" fill="#f5ceb0"/>
      <path d="M59 70q4-40 35-29 29-1 29 31-18-3-29-19-11 17-35 17Z" fill="#705347"/>
      <ellipse cx="79" cy="81" rx="3" ry="5" fill="#49364a"/><ellipse cx="102" cy="81" rx="3" ry="5" fill="#49364a"/>
      <ellipse cx="72" cy="92" rx="7" ry="4" fill="#e99c97"/><ellipse cx="109" cy="92" rx="7" ry="4" fill="#e99c97"/>
      <path d="M83 95q8 9 15 0" fill="none" stroke="#80535c" strokeWidth="3" strokeLinecap="round"/>
      <path d="M86 124h8m-4-4v16" stroke="#fff0b5" strokeWidth="4" strokeLinecap="round"/>
      <path d="m136 82 4 9 10 2-8 7 1 10-9-5-8 5 1-10-7-7 10-2Z" fill="#ffdc76"/>
    </g>
  </svg>;
}
