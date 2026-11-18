import { useId } from 'react';
import GuiaLuz from '../GuiaLuz';

const nombres = { lucy: 'Lucy', angel: 'Ángel Nico', francisco: 'San Francisco' };

export function PersonajeLeccion({ personaje = 'lucy', emocion = 'calma' }) {
  const id = useId().replaceAll(':', '');
  if (personaje === 'lucy') return <div className={'personaje-leccion personaje-' + emocion}><GuiaLuz celebrando={emocion === 'feliz'}/></div>;
  const angel = personaje === 'angel';
  return <svg className={'personaje-leccion personaje-' + emocion} viewBox="0 0 260 260" role="img" aria-label={nombres[personaje] + (emocion === 'feliz' ? ' celebra tu esfuerzo' : ' te acompaña en el reto')}>
    <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop stopColor={angel ? '#baf5e9' : '#cda77c'}/><stop offset="1" stopColor={angel ? '#66c5c1' : '#8f6350'}/></linearGradient></defs>
    <circle cx="130" cy="130" r="108" fill={angel ? '#baf5e9' : '#e5c997'} opacity=".09"/>
    <ellipse cx="130" cy="238" rx="67" ry="10" fill="#0c1742" opacity=".25"/>
    {angel && <g className="personaje-alas" fill="#f3fbff" stroke="#b2d4e7" strokeWidth="3"><path d="M91 147C32 82 13 119 35 165c12 24 33 31 59 22Z"/><path d="M169 147c59-65 78-28 56 18-12 24-33 31-59 22Z"/><path d="m45 140 40 35m130-35-40 35" strokeLinecap="round"/></g>}
    <g className="personaje-cuerpo">
      <path d="M91 208v19q-18 14-22 3v-18m100-4v19q18 14 22 3v-18" fill="#5a526a" stroke="#5a526a" strokeWidth="9" strokeLinecap="round"/>
      <path d="M88 125q42-22 84 0l24 94q-66 25-132 0Z" fill={'url(#' + id + ')'} stroke={angel ? '#baf5e9' : '#deb98d'} strokeWidth="3"/>
      <path d="m117 134 13 19 13-19" fill="#fff4dc"/>
      {!angel && <><path d="M79 186q51 15 101 0" stroke="#f4ddaf" strokeWidth="6" fill="none"/><path d="m165 190 5 31m-1-21 13 9" stroke="#f4ddaf" strokeWidth="5" strokeLinecap="round"/><path d="M127 159v22m-8-13h16" stroke="#f6e4c1" strokeWidth="5" strokeLinecap="round"/></>}
      {angel && <path d="m130 163 8 12 14 3-10 10 1 15-13-6-13 6 1-15-10-10 14-3Z" fill="#ffdb70" stroke="#fff4ba" strokeWidth="2"/>}
      <path d={emocion === 'feliz' ? 'M83 151Q52 150 51 118m126 33q31-1 32-33' : 'M84 157q-18 23-30 10m122-10q18 23 30 10'} stroke="#edb494" strokeWidth="15" strokeLinecap="round" fill="none"/>
      <circle cx="130" cy="88" r="48" fill="#f4c5a4"/>
      <path d={angel ? 'M84 85q-10-59 46-56 58 0 47 58l-20-24q-20 21-43-1L85 89Z' : 'M83 92q-12-59 47-59 59 0 47 59l-10-33q-36 20-73 0Z'} fill={angel ? '#78534a' : '#674936'}/>
      {!angel && <path d="M87 103q43 40 86 0-7 43-43 40-35-1-43-40Z" fill="#795744"/>}
      <ellipse cx="102" cy="101" rx="10" ry="6" fill="#eaa291"/><ellipse cx="158" cy="101" rx="10" ry="6" fill="#eaa291"/>
      {emocion === 'feliz' ? <path d="m108 87 7-5 7 5m16 0 7-5 7 5" fill="none" stroke="#413a50" strokeWidth="4" strokeLinecap="round"/> : <g fill="#413a50"><ellipse cx="115" cy="86" rx="4" ry="6"/><ellipse cx="145" cy="86" rx="4" ry="6"/></g>}
      <path d="M120 106q10 10 20 0" stroke={angel ? '#75434b' : '#fff0d8'} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      {angel && <ellipse cx="130" cy="17" rx="34" ry="9" fill="none" stroke="#ffdf77" strokeWidth="7"/>}
    </g>
    {!angel && <g className="personaje-pajarito"><ellipse cx="206" cy="152" rx="22" ry="17" fill="#87d4ef"/><path d="m219 147 15 5-15 5" fill="#ffda76"/><circle cx="213" cy="145" r="3" fill="#243451"/><path d="m187 151 18 4-13 8" fill="#5aa7db"/></g>}
    <path d="m39 53 4 10 10 4-10 4-4 10-4-10-10-4 10-4Z" fill="#ffdd79"/>
  </svg>;
}

export default function CompaneroLeccion({ personaje = 'lucy', emocion = 'calma', mensaje, etiqueta }) {
  return <aside className="aula-companero" aria-label={'Te acompaña ' + nombres[personaje]}>
    <PersonajeLeccion key={personaje + emocion} personaje={personaje} emocion={emocion}/>
    <div className="aula-bocadillo"><span>{nombres[personaje]} {etiqueta && '· ' + etiqueta}</span><p>{mensaje}</p></div>
  </aside>;
}
