// src/components/AvatarSelector.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { useToast } from './ui/Toast';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import santosData from '../data/santos.json';

// ── COMPRIMIR IMAGEN ────────────────────────────────────────────────────
const comprimirImagen = async (file, maxWidth = 400, maxHeight = 400, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('No se pudo comprimir la imagen'));
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

// ── VERIFICAR IMAGEN ────────────────────────────────────────────────────
const esImagenValida = (src) => {
  return src && (src.startsWith('data:image') || src.startsWith('/images/') || src.startsWith('http'));
};

// ── EMOJIS RELIGIOSOS ──────────────────────────────────────────────────
const EMOJIS_DISPONIBLES = [
  { id: 'oracion', icono: '🙏', nombre: 'Oración', color: 'from-amber-400/30 to-yellow-400/20' },
  { id: 'cordero', icono: '🐑', nombre: 'Cordero', color: 'from-slate-400/30 to-gray-400/20' },
  { id: 'paloma', icono: '🕊️', nombre: 'Paloma', color: 'from-blue-400/30 to-cyan-400/20' },
  { id: 'cruz', icono: '✝️', nombre: 'Cruz', color: 'from-amber-600/30 to-orange-400/20' },
  { id: 'angel', icono: '👼', nombre: 'Ángel', color: 'from-pink-400/30 to-rose-400/20' },
  { id: 'iglesia', icono: '⛪', nombre: 'Iglesia', color: 'from-indigo-400/30 to-purple-400/20' },
  { id: 'biblia', icono: '📖', nombre: 'Biblia', color: 'from-emerald-400/30 to-green-400/20' },
  { id: 'rezando', icono: '🧎', nombre: 'Rezando', color: 'from-purple-400/30 to-pink-400/20' },
  { id: 'vela', icono: '🕯️', nombre: 'Vela', color: 'from-orange-400/30 to-amber-400/20' },
  { id: 'corazon_sagrado', icono: '❤️‍🔥', nombre: 'Corazón Sagrado', color: 'from-red-400/30 to-rose-400/20' },
  { id: 'estrella_belen', icono: '⭐', nombre: 'Estrella Belén', color: 'from-yellow-400/30 to-amber-400/20' },
  { id: 'manos_unidas', icono: '🤲', nombre: 'Manos Unidas', color: 'from-teal-400/30 to-emerald-400/20' },
  { id: 'rosario', icono: '📿', nombre: 'Rosario', color: 'from-purple-400/30 to-indigo-400/20' },
  { id: 'agua_bendita', icono: '💧', nombre: 'Agua Bendita', color: 'from-cyan-400/30 to-blue-400/20' },
  { id: 'pan', icono: '🍞', nombre: 'Pan', color: 'from-amber-400/30 to-yellow-400/20' },
  { id: 'vino', icono: '🍷', nombre: 'Vino', color: 'from-red-400/30 to-rose-400/20' },
];

// ── ESPECIALES ─────────────────────────────────────────────────────────
const ESPECIALES_DISPONIBLES = [
  { id: 'especial_papa', icono: '👑', nombre: 'Papa Francisco' },
  { id: 'especial_virgen', icono: '👸', nombre: 'Virgen María' },
  { id: 'especial_san_pedro', icono: '🔑', nombre: 'San Pedro' },
  { id: 'especial_san_pablo', icono: '⚔️', nombre: 'San Pablo' },
];

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────
const AvatarSelector = ({ isOpen, onClose, onSelectAvatar }) => {
  const { actualizarAvatar, usuarioId, coleccion, avatarActual } = useGame();
  const { showToast } = useToast();
  
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [santos, setSantos] = useState([]);
  const [selectedTab, setSelectedTab] = useState('santos');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const fileInputRef = useRef(null);

  // ── PARTÍCULAS DE FONDO ──
  const [particles] = useState(() => {
    const colors = ['#facc15', '#a855f7', '#3b82f6', '#ec4899', '#22c55e', '#f97316'];
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      speed: 0.5 + Math.random() * 1.5,
      delay: Math.random() * 5,
      opacity: 0.1 + Math.random() * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  });

  // Cargar santos
  useEffect(() => {
    if (isOpen && santosData?.santos) {
      setSantos(santosData.santos);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setSelectedItem(null);
      setError(null);
      setIsClosing(false);
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const coleccionSet = new Set(coleccion);

  // ── HANDLERS ──────────────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      showToast('❌ Selecciona una imagen válida (JPG, PNG, WebP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('❌ La imagen es muy grande. Máximo 5MB', 'error');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      const compressedFile = await comprimirImagen(file, 400, 400, 0.7);
      
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const fileName = `${usuarioId}_${Date.now()}.jpg`;
      const storageRef = ref(storage, `avatars/${fileName}`);
      
      await uploadBytes(storageRef, compressedFile);
      const downloadURL = await getDownloadURL(storageRef);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      await actualizarAvatar(downloadURL);
      onSelectAvatar(downloadURL);
      
      showToast('✅ ¡Imagen subida y avatar actualizado!', 'success');
      
      setTimeout(() => {
        handleClose();
      }, 500);
      
    } catch (err) {
      console.error('Error al subir imagen:', err);
      showToast('❌ Error al subir la imagen. Verifica tu conexión.', 'error');
      setError('Error al subir la imagen. Verifica tu conexión e intenta de nuevo.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSelectSanto = async (santo) => {
    try {
      let avatarValue;
      
      if (santo.imagen && esImagenValida(santo.imagen)) {
        avatarValue = santo.imagen;
      } else if (santo.icono) {
        avatarValue = santo.icono;
      } else {
        avatarValue = '🙏';
      }
      
      setSelectedItem(santo.id);
      await actualizarAvatar(avatarValue);
      onSelectAvatar(avatarValue);
      
      showToast(`✅ Has seleccionado a ${santo.nombre} como avatar`, 'success');
      
      setTimeout(() => {
        handleClose();
      }, 400);
      
    } catch (err) {
      console.error('Error al seleccionar santo:', err);
      showToast('❌ Error al seleccionar el santo', 'error');
    }
  };

  const handleSelectEmoji = async (emoji) => {
    try {
      setSelectedItem(emoji.id);
      await actualizarAvatar(emoji.icono);
      onSelectAvatar(emoji.icono);
      
      showToast(`✅ Has seleccionado ${emoji.nombre} como avatar`, 'success');
      
      setTimeout(() => {
        handleClose();
      }, 400);
      
    } catch (err) {
      console.error('Error al seleccionar emoji:', err);
      showToast('❌ Error al seleccionar el emoji', 'error');
    }
  };

  const handleSelectEspecial = async (especial) => {
    try {
      setSelectedItem(especial.id);
      await actualizarAvatar(especial.icono);
      onSelectAvatar(especial.icono);
      
      showToast(`✅ Has seleccionado ${especial.nombre} como avatar`, 'success');
      
      setTimeout(() => {
        handleClose();
      }, 400);
      
    } catch (err) {
      console.error('Error al seleccionar especial:', err);
      showToast('❌ Error al seleccionar el especial', 'error');
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const triggerFileInput = () => {
    if (!uploading) {
      fileInputRef.current.click();
    }
  };

  // ── RAREZA EFFECTS ────────────────────────────────────────────────────
  const getRarezaEffect = (rareza) => {
    switch(rareza) {
      case 'legendario':
        return {
          glow: 'shadow-[0_0_30px_rgba(250,204,21,0.3)]',
          border: 'border-yellow-400/60',
          bg: 'from-yellow-400/20 via-amber-400/10 to-yellow-400/5',
          text: 'text-yellow-400',
          pulse: 'animate-pulse-glow',
        };
      case 'raro':
        return {
          glow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]',
          border: 'border-blue-400/50',
          bg: 'from-blue-400/20 to-cyan-400/10',
          text: 'text-blue-400',
          pulse: '',
        };
      case 'epico':
        return {
          glow: 'shadow-[0_0_25px_rgba(168,85,247,0.25)]',
          border: 'border-purple-400/50',
          bg: 'from-purple-400/20 to-pink-400/10',
          text: 'text-purple-400',
          pulse: '',
        };
      default:
        return {
          glow: '',
          border: 'border-white/20',
          bg: 'bg-white/5',
          text: 'text-white/30',
          pulse: '',
        };
    }
  };

  // ── RENDER DE SANTOS ──────────────────────────────────────────────────
  const renderSantos = () => {
    const santosDesbloqueados = santos.filter(s => coleccionSet.has(s.id));
    const totalSantos = santos.length;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-white/40 text-[10px] font-black uppercase tracking-wider">
            🕊️ Santos ({santosDesbloqueados.length}/{totalSantos})
          </span>
          {santosDesbloqueados.length === 0 && (
            <span className="text-yellow-400/60 text-[9px] animate-pulse">
              🔓 Desbloquea en cofres
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {santos.length > 0 ? (
            santos.map((santo, index) => {
              const desbloqueado = coleccionSet.has(santo.id);
              const esSeleccionado = selectedItem === santo.id;
              const esActual = avatarActual === santo.imagen || avatarActual === santo.icono;
              const rareza = getRarezaEffect(santo.rareza);
              const isHovered = hoveredItem === santo.id;
              
              return (
                <motion.button
                  key={santo.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={desbloqueado ? { scale: 1.08, y: -5 } : {}}
                  whileTap={desbloqueado ? { scale: 0.92 } : {}}
                  onMouseEnter={() => setHoveredItem(santo.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => desbloqueado && handleSelectSanto(santo)}
                  disabled={!desbloqueado || uploading}
                  className={`relative glass-card p-3 rounded-2xl flex flex-col items-center gap-2 transition-all duration-500
                    ${desbloqueado && !uploading ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'}
                    ${esSeleccionado ? `ring-2 ${rareza.glow} bg-gradient-to-br ${rareza.bg}` : ''}
                    ${esActual && !esSeleccionado ? 'ring-1 ring-yellow-400/50' : ''}
                    ${isHovered && desbloqueado ? 'scale-105' : ''}
                  `}
                  style={{
                    borderColor: esSeleccionado ? rareza.border.split(' ')[0] : 'rgba(255,255,255,0.05)',
                  }}
                >
                  {/* Efecto de brillo en hover */}
                  {desbloqueado && (
                    <motion.div
                      className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-yellow-400/0 via-yellow-400/30 to-yellow-400/0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isHovered ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  {/* Partículas para legendarios seleccionados */}
                  {desbloqueado && santo.rareza === 'legendario' && esSeleccionado && (
                    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1.5 h-1.5 rounded-full bg-yellow-400"
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: [0, 0.8, 0],
                            x: [0, (Math.random() - 0.5) * 80],
                            y: [0, (Math.random() - 0.5) * 80],
                          }}
                          transition={{
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                          }}
                          style={{
                            left: '50%',
                            top: '50%',
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <div className="relative">
                    <motion.div 
                      className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden
                        ${desbloqueado ? `bg-gradient-to-br from-yellow-400/20 to-amber-400/20` : 'bg-white/5'}
                        ${esSeleccionado ? `ring-2 ${rareza.glow}` : ''}
                        ${santo.rareza === 'legendario' && desbloqueado ? 'animate-pulse' : ''}
                      `}
                      animate={esSeleccionado ? { scale: [1, 1.12, 1] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      {desbloqueado ? (
                        santo.imagen && esImagenValida(santo.imagen) ? (
                          <img 
                            src={santo.imagen} 
                            alt={santo.nombre}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const parent = e.target.parentElement;
                              if (parent) {
                                const fallback = document.createElement('span');
                                fallback.className = 'text-3xl';
                                fallback.textContent = santo.icono || '🙏';
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        ) : (
                          <span className="text-3xl">{santo.icono || '🙏'}</span>
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black/50">
                          <span className="text-2xl">🔒</span>
                        </div>
                      )}
                    </motion.div>

                    {/* Indicador de seleccionado con estrella */}
                    {esSeleccionado && desbloqueado && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/50"
                      >
                        <span className="text-[10px] text-black font-black">✦</span>
                      </motion.div>
                    )}

                    {/* Badge de "Actual" */}
                    {esActual && !esSeleccionado && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full text-[6px] font-black text-white shadow-lg shadow-green-400/50"
                      >
                        ACTUAL
                      </motion.div>
                    )}
                  </div>

                  <span className={`text-[10px] font-black truncate w-full text-center ${
                    desbloqueado ? 'text-white/80' : 'text-white/40'
                  }`}>
                    {santo.nombre}
                  </span>

                  {desbloqueado && santo.rareza && (
                    <span className={`text-[6px] font-black uppercase tracking-wider transition-all ${rareza.text}`}>
                      {santo.rareza === 'legendario' ? '✦ LEGENDARIO ✦' : santo.rareza}
                    </span>
                  )}
                </motion.button>
              );
            })
          ) : (
            <div className="col-span-3 text-center text-white/40 text-sm py-4">
              Cargando santos...
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // ── RENDER DE EMOJIS ──────────────────────────────────────────────────
  const renderEmojis = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-white/40 text-[10px] font-black uppercase tracking-wider">
            ✨ Emojis ({EMOJIS_DISPONIBLES.length}/{EMOJIS_DISPONIBLES.length})
          </span>
          <span className="text-green-400/60 text-[9px] animate-pulse">✓ Todos disponibles</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {EMOJIS_DISPONIBLES.map((emoji, index) => {
            const esSeleccionado = selectedItem === emoji.id;
            const esActual = avatarActual === emoji.icono;
            const isHovered = hoveredItem === emoji.id;
            
            return (
              <motion.button
                key={emoji.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                whileHover={{ scale: 1.12, y: -3 }}
                whileTap={{ scale: 0.88 }}
                onMouseEnter={() => setHoveredItem(emoji.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => handleSelectEmoji(emoji)}
                disabled={uploading}
                className={`relative glass-card p-2 rounded-2xl flex flex-col items-center gap-1 transition-all duration-300
                  ${!uploading ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                  ${esSeleccionado ? 'ring-2 ring-blue-400 bg-blue-400/10 shadow-[0_0_30px_rgba(59,130,246,0.2)]' : ''}
                  ${esActual && !esSeleccionado ? 'ring-1 ring-blue-400/50' : ''}
                  ${isHovered && !esSeleccionado ? 'bg-white/10' : ''}
                `}
              >
                <div className="relative">
                  <motion.div 
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${emoji.color} flex items-center justify-center`}
                    animate={esSeleccionado ? { 
                      scale: [1, 1.15, 1],
                      boxShadow: ['0 0 10px rgba(59,130,246,0.2)', '0 0 30px rgba(59,130,246,0.4)', '0 0 10px rgba(59,130,246,0.2)']
                    } : {}}
                    transition={{ duration: 1.5, repeat: esSeleccionado ? Infinity : 0 }}
                  >
                    <span className="text-3xl">{emoji.icono}</span>
                  </motion.div>
                  
                  {esSeleccionado && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg shadow-blue-400/50"
                    >
                      <span className="text-[8px] text-white font-black">✦</span>
                    </motion.div>
                  )}
                  
                  {esActual && !esSeleccionado && (
                    <div className="absolute -top-1 -right-1 px-1 py-0.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full text-[5px] font-black text-white shadow-lg shadow-green-400/30">
                      ACTUAL
                    </div>
                  )}
                </div>
                
                <span className={`text-[8px] font-medium truncate w-full text-center ${
                  esSeleccionado ? 'text-white' : 'text-white/60'
                }`}>
                  {emoji.nombre}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    );
  };

  // ── RENDER DE ESPECIALES ─────────────────────────────────────────────
  const renderEspeciales = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-white/40 text-[10px] font-black uppercase tracking-wider">
            👑 Especiales (0/{ESPECIALES_DISPONIBLES.length})
          </span>
          <span className="text-purple-400/60 text-[9px] animate-pulse">🎯 Eventos especiales</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {ESPECIALES_DISPONIBLES.map((especial, index) => {
            const desbloqueado = false;
            const isHovered = hoveredItem === especial.id;
            
            return (
              <motion.button
                key={especial.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ scale: 1.03 }}
                onMouseEnter={() => setHoveredItem(especial.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => desbloqueado && handleSelectEspecial(especial)}
                disabled={!desbloqueado || uploading}
                className={`glass-card p-4 rounded-2xl flex flex-col items-center gap-2 transition-all duration-300
                  ${desbloqueado && !uploading ? 'cursor-pointer hover:bg-white/10' : 'opacity-40 cursor-not-allowed'}
                  ${isHovered && desbloqueado ? 'scale-105' : ''}
                `}
              >
                <div className="relative">
                  <motion.div 
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 flex items-center justify-center"
                    animate={desbloqueado ? { 
                      y: [0, -4, 0],
                      boxShadow: ['0 0 10px rgba(168,85,247,0.2)', '0 0 30px rgba(168,85,247,0.3)', '0 0 10px rgba(168,85,247,0.2)']
                    } : {}}
                    transition={{ duration: 2, repeat: desbloqueado ? Infinity : 0 }}
                  >
                    {desbloqueado ? (
                      <span className="text-4xl">{especial.icono}</span>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black/60 rounded-full backdrop-blur-sm">
                        <span className="text-3xl">🔒</span>
                      </div>
                    )}
                  </motion.div>
                </div>
                
                <span className={`text-[10px] font-black text-center ${
                  desbloqueado ? 'text-white/80' : 'text-white/40'
                }`}>
                  {especial.nombre}
                </span>
                
                {!desbloqueado && (
                  <span className="text-[8px] text-purple-400/60 animate-pulse">🔒 Evento especial</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    );
  };

  // ── RENDER PRINCIPAL ──────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* ── FONDO CON EFECTO DE VITRAL ── */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/60 via-purple-900/40 to-amber-900/30" />
        
        {/* Partículas flotantes */}
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, p.opacity, 0],
              x: [p.x, p.x + (Math.random() - 0.5) * 15, p.x],
              y: [p.y, p.y + (Math.random() - 0.5) * 15, p.y],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut'
            }}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}30`,
            }}
          />
        ))}

        {/* Efecto de luz cenital */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-yellow-400/10 rounded-full blur-[120px]" />
      </div>

      {/* ── MODAL ── */}
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative glass-card w-full max-w-md rounded-3xl p-5 max-h-[85vh] overflow-y-auto border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl"
      >
        {/* ── HEADER ── */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400/30 to-amber-400/30 flex items-center justify-center">
              <span className="text-lg">🎨</span>
            </div>
            <h2 className="text-lg font-black text-white tracking-tight">
              Personaliza tu Avatar
            </h2>
          </div>
          <motion.button 
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClose}
            className="text-white/40 hover:text-white text-xl transition-all w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
          >
            ✕
          </motion.button>
        </div>

        {/* ── AVATAR ACTUAL CON HALO ── */}
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="mb-4 p-4 bg-white/5 rounded-2xl border border-white/5"
        >
          <p className="text-white/30 text-[9px] font-black uppercase tracking-wider mb-3 text-center">
            ✨ Avatar actual
          </p>
          <div className="flex items-center justify-center gap-5">
            <div className="relative">
              {/* Halo de luz */}
              <motion.div 
                className="absolute -inset-3 rounded-full bg-gradient-to-r from-yellow-400/20 via-amber-400/20 to-yellow-400/20"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div 
                className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-yellow-400/40 bg-gradient-to-br from-yellow-400/20 to-amber-400/20 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                animate={{ 
                  boxShadow: ['0 0 20px rgba(250,204,21,0.2)', '0 0 40px rgba(250,204,21,0.4)', '0 0 20px rgba(250,204,21,0.2)'] 
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {avatarActual ? (
                  typeof avatarActual === 'string' && avatarActual.startsWith('http') ? (
                    <img src={avatarActual} alt="Avatar actual" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">{avatarActual}</span>
                  )
                ) : (
                  <span className="text-4xl">👤</span>
                )}
              </motion.div>
            </div>
            <div className="text-left">
              <p className="text-white font-black text-sm">Mi avatar</p>
              <p className="text-white/30 text-[9px]">Toca un ítem para cambiarlo</p>
            </div>
          </div>
        </motion.div>

        {/* ── SUBIR IMAGEN ── */}
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-5"
        >
          <p className="text-white/30 text-[9px] font-black uppercase tracking-wider mb-2">
            📸 Subir imagen personalizada
          </p>
          <motion.div 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={triggerFileInput}
            className={`flex items-center gap-4 p-3 rounded-2xl transition-all cursor-pointer
              ${uploading ? 'bg-white/5 border border-yellow-400/30' : 'bg-white/5 border-2 border-dashed border-white/15 hover:border-yellow-400/40 hover:bg-white/10'}
            `}
          >
            <motion.div 
              className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-400/20 flex items-center justify-center flex-shrink-0 overflow-hidden"
              animate={uploading ? { rotate: 360 } : {}}
              transition={{ duration: 2, repeat: uploading ? Infinity : 0 }}
            >
              {preview ? (
                typeof preview === 'string' && (preview.startsWith('http') || preview.startsWith('data:image')) ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">{preview}</span>
                )
              ) : (
                <span className="text-3xl">📷</span>
              )}
            </motion.div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/jpeg,image/png,image/webp" 
              className="hidden" 
              disabled={uploading}
            />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold">Sube tu foto</p>
              <p className="text-white/30 text-[9px] truncate">JPG, PNG, WebP · Se comprime</p>
              {uploading && (
                <div className="mt-1">
                  <p className="text-yellow-400 text-[10px]">Subiendo... {uploadProgress}%</p>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
              {error && <p className="text-red-400 text-[10px] mt-1">{error}</p>}
            </div>
            {!uploading && !preview && (
              <motion.span 
                className="text-green-400/50 text-xs"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ⬆️
              </motion.span>
            )}
          </motion.div>
        </motion.div>

        {/* ── TABS ── */}
        <div className="flex gap-1 mb-4 bg-white/5 rounded-xl p-1">
          {[
            { key: 'santos', icono: '🕊️', label: 'Santos', color: 'from-yellow-400/30 to-amber-400/20' },
            { key: 'emojis', icono: '✨', label: 'Emojis', color: 'from-blue-400/30 to-purple-400/20' },
            { key: 'especiales', icono: '👑', label: 'Especiales', color: 'from-purple-400/30 to-pink-400/20' },
          ].map(tab => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTab(tab.key)}
              className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all relative
                ${selectedTab === tab.key 
                  ? `bg-gradient-to-r ${tab.color} text-white` 
                  : 'text-white/40 hover:text-white/60'
                }`}
            >
              {selectedTab === tab.key && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-white rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.icono} {tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* ── CONTENIDO ── */}
        <AnimatePresence mode="wait">
          <div className="min-h-[200px]">
            {selectedTab === 'santos' && renderSantos()}
            {selectedTab === 'emojis' && renderEmojis()}
            {selectedTab === 'especiales' && renderEspeciales()}
          </div>
        </AnimatePresence>

        {/* ── FOOTER ── */}
        <div className="mt-4 text-center text-white/15 text-[8px] flex items-center justify-center gap-2">
          <span>💡</span>
          <span>Desbloquea más ítems en cofres y eventos</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AvatarSelector;