import { dividirFrase } from '../../utils/ejercicios';

export default function FraseIncompleta({ verso, respuesta, resultado }) {
  const { antes, despues } = dividirFrase(verso.texto, verso.palabraFaltante);
  return <p className="aula-frase">{antes}<span className="aula-hueco" data-resultado={resultado ?? ''}>{respuesta || '•••'}</span>{despues}</p>;
}
