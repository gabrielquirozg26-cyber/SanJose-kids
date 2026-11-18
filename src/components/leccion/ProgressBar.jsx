export default function ProgressBar({ paso, total, tipo, titulo, icono }) {
  const tipos = { seleccion: '🔎 Seleccionar', ordenar: '🧩 Ordenar', escritura: '✍️ Escribir', concepto: '💡 Descubrir', examen: '🎓 Examen' };
  return <div className="aula-ruta"><span>{icono} {titulo}</span><span>{tipos[tipo] ?? 'Reto'} · {Math.min(paso + 1, total)} de {total}</span></div>;
}
