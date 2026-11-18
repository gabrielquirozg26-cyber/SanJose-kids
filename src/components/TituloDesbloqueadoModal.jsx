import DialogoAprendizaje from './DialogoAprendizaje';

export default function TituloDesbloqueadoModal({ isOpen, onClose, titulo }) {
  return <DialogoAprendizaje abierto={isOpen && !!titulo} onCerrar={onClose} titulo="¡Nuevo título desbloqueado!">
    {titulo && <><h1>🏆 {titulo.nombre}</h1><p>Rareza: {titulo.rareza ?? 'Especial'}</p><p>Ya puedes equiparlo desde tu perfil.</p><button className="aprendizaje-cta" onClick={onClose}>¡Continuar!</button></>}
  </DialogoAprendizaje>;
}
