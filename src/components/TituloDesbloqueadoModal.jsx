import DialogoAprendizaje from './DialogoAprendizaje';
import GuiaLuz from './GuiaLuz';

export default function TituloDesbloqueadoModal({ isOpen, onClose, titulo }) {
  return <DialogoAprendizaje abierto={isOpen && !!titulo} onCerrar={onClose} titulo="¡Nuevo título desbloqueado!">
    {titulo && <div className="aventura-titulo-ganado"><GuiaLuz celebrando/><span className="aventura-etiqueta">🏅 UN NUEVO LOGRO PARA TI</span><h1>{titulo.nombre}</h1><p>¡Este título ya es tuyo! Elígelo en tu perfil para llevarlo en tus aventuras.</p><button className="aprendizaje-cta" onClick={onClose}>¡Qué genial! →</button></div>}
  </DialogoAprendizaje>;
}
