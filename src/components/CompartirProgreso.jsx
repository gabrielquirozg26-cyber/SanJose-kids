import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { motion, AnimatePresence } from 'framer-motion';

const CompartirProgreso = ({ isOpen, onClose, usuario, estadisticas }) => {
  const [capturando, setCapturando] = useState(false);
  const [modoCompartir, setModoCompartir] = useState('preview');
  const cardRef = useRef();

  if (!isOpen) return null;

  const avatar = usuario.avatar || '😇';
  const esImagen = avatar?.startsWith('data:image') || avatar?.startsWith('http') || avatar?.startsWith('/images/');
  const nivelNombre = {
    1:'Padre Nuestro',2:'Ave María',3:'Gloria',4:'Ángel de la Guarda',
    5:'Yo Confieso',6:'Acto de Contrición',7:'Dulce Madre',
    8:'Credo Apostólico',9:'La Salve',10:'10 Mandamientos',
    11:'Bienaventuranzas',12:'7 Sacramentos',13:'Obras de Misericordia',
    14:'Misterios Gozosos',15:'Misterios Dolorosos',16:'Misterios Gloriosos',17:'Misterios Luminosos'
  }[estadisticas.nivel] || 'Iniciado';

  const generarImagen = async (accion = 'descargar') => {
    if (!cardRef.current) return;
    setCapturando(true);
    try {
      const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
      if (accion === 'compartir' && navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'mi-progreso.png', { type: 'image/png' });
        await navigator.share({
          title: 'Mi progreso en San JoseKids',
          text: `¡Mira mi progreso! Nivel ${estadisticas.nivel} · Racha ${estadisticas.racha} 🔥`,
          files: [file],
        });
      } else {
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

  const handleCompartirTexto = () => {
    const texto = `¡Mira mi progreso en San JoseKids! 🎉\nNivel: ${estadisticas.nivel} - ${nivelNombre}\n🔥 Racha: ${estadisticas.racha} días\n🪙 Monedas: ${estadisticas.monedas}\n📦 Cofres: ${estadisticas.cofres}\n\nÚnete también: https://sanjosekids.netlify.app/`;
    if (navigator.share) {
      navigator.share({
        title: 'Mi progreso en San JoseKids',
        text: texto,
      });
    } else {
      navigator.clipboard.writeText(texto);
      alert('✅ Texto copiado al portapapeles');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Efecto de brillo exterior */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 rounded-3xl blur-xl opacity-70 animate-pulse" />
            
            <div className="relative glass-card rounded-3xl p-6 border border-white/20 bg-black/60 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Header con animación */}
              <motion.div 
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="text-center mb-6"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/40 mb-3">
                  <span className="text-yellow-400 text-sm">✨</span>
                  <span className="text-yellow-400 font-black text-xs uppercase tracking-wider">Comparte tu fe</span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tighter">¡Comparte tu progreso!</h3>
                <p className="text-white/50 text-sm mt-1">Presume tu camino en la catequesis</p>
              </motion.div>

              {/* Vista previa de la tarjeta (mejorada) */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="relative mx-auto mb-6"
                style={{ width: '300px' }}
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/20 via-pink-400/20 to-purple-400/20 rounded-2xl blur-lg" />
                <div
                  ref={cardRef}
                  className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-2xl p-5 text-center space-y-3 shadow-2xl border border-white/20 overflow-hidden"
                >
                  {/* Decoración de fondo */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-2xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-400/5 rounded-full blur-xl" />
                  
                  {/* Avatar con glow */}
                  <div className="relative inline-block">
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full blur opacity-70" />
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white/30 bg-white/10 shadow-lg mx-auto">
                      {esImagen ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl flex items-center justify-center h-full">{avatar}</span>
                      )}
                    </div>
                  </div>

                  {/* Nombre y nivel */}
                  <div>
                    <h4 className="text-xl font-black text-white">{usuario.nombre}</h4>
                    <p className="text-yellow-300 text-xs font-black mt-0.5">{usuario.rango || 'Catequista'}</p>
                    <div className="inline-block mt-1 px-2 py-0.5 rounded-full bg-white/10 text-[8px] font-black text-white/70">
                      🎓 {nivelNombre}
                    </div>
                  </div>

                  {/* Stats en grid */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-white/10 rounded-xl p-2">
                      <p className="text-[10px] text-white/50 font-black">🏅 Nivel</p>
                      <p className="text-xl font-black text-yellow-400">{estadisticas.nivel}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-2">
                      <p className="text-[10px] text-white/50 font-black">🔥 Racha</p>
                      <p className="text-xl font-black text-orange-400">{estadisticas.racha}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-2">
                      <p className="text-[10px] text-white/50 font-black">🪙 Monedas</p>
                      <p className="text-xl font-black text-yellow-300">{estadisticas.monedas.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-2">
                      <p className="text-[10px] text-white/50 font-black">📦 Cofres</p>
                      <p className="text-xl font-black text-amber-400">{estadisticas.cofres}</p>
                    </div>
                  </div>

                  {/* Frase motivacional y QR */}
                  <p className="text-white/60 text-[10px] italic">✨ “Sigue adelante en tu camino de fe” ✨</p>
                  <div className="flex justify-center gap-2 text-white/20 text-[8px] border-t border-white/10 pt-2 mt-1">
                    <span>⛪ San JoseKids</span>
                    <span>•</span>
                    <span>Iglesia San José • Diriamba</span>
                  </div>
                </div>
              </motion.div>

              {/* Opciones para compartir */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  {navigator.share ? (
                    <button
                      onClick={() => generarImagen('compartir')}
                      disabled={capturando}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                      {capturando ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          📱 Compartir imagen
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => generarImagen('descargar')}
                      disabled={capturando}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 text-blue-900 font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                      {capturando ? (
                        <div className="w-5 h-5 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          💾 Descargar imagen
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={handleCompartirTexto}
                    className="flex-1 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    📝 Compartir texto
                  </button>
                </div>

                {/* Enlace a la web */}
                <motion.a
                  href="https://sanjosekids.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/40 hover:border-purple-400/80 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌐</span>
                    <div>
                      <p className="text-white font-black text-sm">Visita San JoseKids</p>
                      <p className="text-white/40 text-[10px]">Comparte la fe con más niños</p>
                    </div>
                  </div>
                  <span className="text-purple-300 group-hover:translate-x-1 transition-transform">→</span>
                </motion.a>
              </div>

              {/* Botón cerrar */}
              <button
                onClick={onClose}
                className="mt-4 w-full py-2 rounded-xl border border-white/20 text-white/50 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CompartirProgreso;