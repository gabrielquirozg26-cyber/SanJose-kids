import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const CompartirProgreso = ({ isOpen, onClose, usuario, estadisticas }) => {
  const [capturando, setCapturando] = useState(false);
  const [modo, setModo] = useState('preview');
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

  // ── GENERAR IMAGEN ──────────────────────────────────────────────────────
  const generarImagen = async (accion = 'descargar') => {
    if (!cardRef.current) return;
    setCapturando(true);
    
    // Confeti de celebración
    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#facc15', '#ffffff', '#3b82f6']
    });
    
    try {
      const dataUrl = await toPng(cardRef.current, { 
        quality: 0.95, 
        pixelRatio: 2,
        backgroundColor: '#0f172a',
      });
      
      if (accion === 'compartir' && navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `progreso-${usuario.nombre}.png`, { type: 'image/png' });
        await navigator.share({
          title: 'Mi progreso en San JoseKids',
          text: `¡Mira mi progreso! Nivel ${estadisticas.nivel} · Racha ${estadisticas.racha} 🔥`,
          files: [file],
        });
      } else {
        const link = document.createElement('a');
        link.download = `progreso-${usuario.nombre}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      // Confeti de éxito
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#facc15', '#10b981', '#3b82f6']
        });
      }, 200);
      
    } catch (error) {
      console.error('Error al generar la imagen:', error);
      alert('No se pudo generar la imagen. Intenta de nuevo.');
    } finally {
      setCapturando(false);
    }
  };

  // ── COMPARTIR TEXTO ─────────────────────────────────────────────────────
  const handleCompartirTexto = () => {
    const texto = `✨ ¡Mira mi progreso en San JoseKids! ✨\n\n` +
      `🏅 Nivel: ${estadisticas.nivel} - ${nivelNombre}\n` +
      `🔥 Racha: ${estadisticas.racha} días\n` +
      `🪙 Monedas: ${estadisticas.monedas.toLocaleString()}\n` +
      `📦 Cofres: ${estadisticas.cofres}\n\n` +
      `🙏 "Dejen que los niños vengan a mí" - Mateo 19:14\n\n` +
      `🌐 Únete también: https://sanjosekids.netlify.app/`;
    
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

  // ── ANIMACIONES ─────────────────────────────────────────────────────────
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 25,
        duration: 0.5
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: 30,
      transition: { duration: 0.3 }
    }
  };

  const cardVariants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 20,
        delay: 0.2
      }
    },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Efecto de brillo exterior */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/20 via-pink-500/20 to-purple-500/20 rounded-3xl blur-xl animate-pulse" />
            
            <div className="relative glass-card rounded-3xl p-6 border border-white/20 bg-black/60 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Decoración de fondo */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-400/5 rounded-full blur-[80px]" />

              {/* ── HEADER ── */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/40 mb-3">
                  <span className="text-yellow-400 text-sm">✨</span>
                  <span className="text-yellow-400 font-black text-[10px] uppercase tracking-wider">Comparte tu fe</span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tighter">¡Comparte tu progreso!</h3>
                <p className="text-white/50 text-sm mt-1">Presume tu camino en la catequesis</p>
              </div>

              {/* ── TARJETA DE PROGRESO ── */}
              <motion.div
                variants={cardVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                className="relative mx-auto mb-6"
                style={{ width: '300px' }}
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/20 via-pink-400/20 to-purple-400/20 rounded-2xl blur-lg" />
                
                <div
                  ref={cardRef}
                  className="relative bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 rounded-2xl p-5 text-center space-y-3 shadow-2xl border border-white/10 overflow-hidden"
                >
                  {/* Decoración de fondo */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-2xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-400/5 rounded-full blur-xl" />
                  
                  {/* Logo pequeño */}
                  <div className="absolute top-2 right-2 opacity-20">
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <img src="/logo.jpg" alt="" className="w-full h-full object-cover" />
                    </div>
                  </div>

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

                  {/* Frase y versículo */}
                  <div className="space-y-1">
                    <p className="text-white/50 text-[10px] italic">✨ “Sigue adelante en tu camino de fe” ✨</p>
                    <div className="flex justify-center gap-2 text-white/20 text-[8px] border-t border-white/10 pt-2">
                      <span>⛪ San JoseKids</span>
                      <span>•</span>
                      <span>Iglesia San José · Diriamba</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ── BOTONES DE ACCIÓN ── */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  {navigator.share ? (
                    <button
                      onClick={() => generarImagen('compartir')}
                      disabled={capturando}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 text-blue-900 font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌐</span>
                    <div>
                      <p className="text-white font-black text-sm">Visita San JoseKids</p>
                      <p className="text-white/40 text-[10px]">Comparte la fe con más niños</p>
                    </div>
                  </div>
                  <span className="text-purple-300 group-hover:translate-x-1 transition-transform">→</span>
                </motion.a>
              </div>

              {/* ── BOTÓN CERRAR ── */}
              <button
                onClick={onClose}
                className="mt-4 w-full py-2 rounded-xl border border-white/20 text-white/50 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CompartirProgreso;