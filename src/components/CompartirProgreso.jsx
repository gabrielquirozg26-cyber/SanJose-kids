import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';

const CompartirProgreso = ({ isOpen, onClose, usuario, estadisticas }) => {
  const [capturando, setCapturando] = useState(false);
  const cardRef = useRef();

  if (!isOpen) return null;

  const avatar = usuario.avatar || '😇';
  const esImagen = avatar?.startsWith('data:image') || avatar?.startsWith('http') || avatar?.startsWith('/images/');

  // Función para generar la imagen y compartir o descargar
  const generarImagen = async (accion = 'descargar') => {
    if (!cardRef.current) return;
    setCapturando(true);
    try {
      const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
      if (accion === 'compartir' && navigator.share) {
        // Compartir usando la API nativa (móvil)
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'mi-progreso.png', { type: 'image/png' });
        await navigator.share({
          title: 'Mi progreso en San JoseKids',
          text: `¡Mira mi nivel ${estadisticas.nivel} en San JoseKids!`,
          files: [file],
        });
      } else {
        // Descargar la imagen
        const link = document.createElement('a');
        link.download = `progreso-${usuario.nombre}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error('Error al generar la imagen:', error);
      alert('No se pudo generar la imagen. Intenta de nuevo.');
    } finally {
      setCapturando(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
      <div className="glass-card rounded-3xl p-6 max-w-sm w-full border border-yellow-400/30">
        <h3 className="text-2xl font-black text-white text-center mb-4">📸 Tu progreso</h3>

        {/* Tarjeta que se va a capturar */}
        <div
          ref={cardRef}
          className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-2xl p-6 text-center space-y-4 shadow-2xl"
          style={{ width: '300px', margin: '0 auto' }}
        >
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-yellow-400/80 shadow-lg bg-white/10">
              {esImagen ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl flex items-center justify-center h-full">{avatar}</span>
              )}
            </div>
          </div>

          {/* Nombre y título */}
          <div>
            <h4 className="text-2xl font-black text-white">{usuario.nombre}</h4>
            <p className="text-yellow-300 text-sm font-black">{usuario.rango || 'Catequista'}</p>
          </div>

          {/* Estadísticas principales */}
          <div className="flex justify-center gap-4 text-sm">
            <div className="bg-white/15 rounded-full px-4 py-1.5">
              <span className="text-yellow-300 font-black">🏅 {estadisticas.nivel}</span>
            </div>
            <div className="bg-white/15 rounded-full px-4 py-1.5">
              <span className="text-orange-300 font-black">🔥 {estadisticas.racha}</span>
            </div>
          </div>
          <div className="flex justify-center gap-4 text-sm">
            <div className="bg-white/15 rounded-full px-4 py-1.5">
              <span className="text-yellow-400 font-black">🪙 {estadisticas.monedas}</span>
            </div>
            <div className="bg-white/15 rounded-full px-4 py-1.5">
              <span className="text-amber-400 font-black">📦 {estadisticas.cofres}</span>
            </div>
          </div>

          {/* Frase motivacional */}
          <p className="text-white/70 text-xs italic">✨ “Sigue adelante en tu camino de fe” ✨</p>

          {/* Logos de la parroquia (opcional) */}
          <div className="flex justify-center gap-2 text-white/30 text-[8px]">
            <span>⛪ San JoseKids</span>
            <span>•</span>
            <span>Iglesia San José • Diriamba</span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 mt-6">
          {navigator.share ? (
            <button
              onClick={() => generarImagen('compartir')}
              disabled={capturando}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-sm uppercase tracking-widest hover:scale-105 transition-all"
            >
              {capturando ? 'Generando...' : '📱 Compartir'}
            </button>
          ) : (
            <button
              onClick={() => generarImagen('descargar')}
              disabled={capturando}
              className="flex-1 py-2 rounded-xl bg-yellow-400 text-blue-900 font-black text-sm uppercase tracking-widest hover:scale-105 transition-all"
            >
              {capturando ? 'Generando...' : '💾 Descargar imagen'}
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-white/20 text-white/70 font-black text-sm hover:bg-white/10"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompartirProgreso;