export default function RankingGrupos({ grupos }) {
  if (!grupos.length) return <div className="juego-vacio"><h2>¡Formemos equipo!</h2><p>Los grupos aparecerán aquí cuando tengan aventureros.</p></div>;
  return <div className="ranking-equipos"><h2 className="juego-subtitulo">🤝 Nuestros equipos de catequesis</h2>{grupos.map((g, i) => <details className="juego-panel ranking-equipo" key={g.nombre}>
    <summary><span aria-hidden="true">{['🥇', '🥈', '🥉'][i] ?? '🌟'}</span><span><strong>{g.nombre}</strong><small>{g.estudiantes.length} aventureros · Ver compañeros</small></span><span className="juego-chip">🪙 {g.monedasTotal.toLocaleString()}</span></summary>
    <ul>{g.estudiantes.map((u, n) => <li key={u.uid ?? n}><span>{n + 1}. {u.nombre}</span><strong>🪙 {(u.monedas ?? 0).toLocaleString()}</strong></li>)}</ul>
  </details>)}</div>;
}
