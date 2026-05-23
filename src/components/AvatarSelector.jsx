import React, { useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import santosData from '../data/santos.json';

const AvatarSelector = ({ isOpen, onClose, onSelectAvatar }) => {
  const { actualizarAvatar, coleccion } = useGame();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const santos = santosData.santos;
  // Mapa rápido para comprobar si está desbloqueado
  const coleccionSet = new Set(coleccion);

  // Subir foto personal (Base64)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida');
      return;
    }
    if (file.size > 500 * 1024) {
      setError('La imagen es muy grande (máx 500KB). Elige una más pequeña.');
      return;
    }

    setUploading(true);
    setError(null);
    setPreview(URL.createObjectURL(file));

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        await actualizarAvatar(base64String);
        onSelectAvatar(base64String);
        onClose();
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error al procesar imagen:', err);
      setError('Error al procesar la imagen. Intenta de nuevo.');
      setUploading(false);
    }
  };

  // Seleccionar un santo desbloqueado
  const handleSelectSanto = async (santo) => {
    // Guardamos la URL de la imagen si existe, si no, el emoji (fallback)
    const avatarValue = santo.imagen || santo.icono || '😇';
    await actualizarAvatar(avatarValue);
    onSelectAvatar(avatarValue);
    onClose();
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-md rounded-3xl p-5 max-h-[85vh] overflow-y-auto animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-black text-white">Elegir avatar</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white text-2xl">&times;</button>
        </div>

        {/* Subir foto personal */}
        <div className="mb-6">
          <p className="text-white/60 text-xs font-black uppercase tracking-wider mb-2">Foto personal</p>
          <div className="flex items-center gap-4">
            <div 
              onClick={triggerFileInput}
              className="w-20 h-20 rounded-full bg-white/10 border-2 border-dashed border-white/30 flex items-center justify-center cursor-pointer hover:border-yellow-400 transition-all overflow-hidden"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">📷</span>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/jpeg,image/png,image/webp" 
              className="hidden" 
              disabled={uploading}
            />
            <div>
              <p className="text-white text-sm font-bold">Sube tu foto</p>
              <p className="text-white/30 text-[10px]">JPG, PNG hasta 500KB</p>
              {uploading && <p className="text-yellow-400 text-[10px] mt-1">Procesando...</p>}
              {error && <p className="text-red-400 text-[10px] mt-1">{error}</p>}
            </div>
          </div>
        </div>

        {/* Separador */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <div className="relative flex justify-center text-xs"><span className="bg-black/50 px-2 text-white/40">Santos desbloqueados</span></div>
        </div>

        {/* Grid de santos (solo los que has desbloqueado) */}
        <div className="grid grid-cols-3 gap-3">
          {santos.map(santo => {
            const desbloqueado = coleccionSet.has(santo.id);
            return (
              <button
                key={santo.id}
                onClick={() => desbloqueado && handleSelectSanto(santo)}
                disabled={!desbloqueado}
                className={`glass-card p-3 rounded-2xl flex flex-col items-center gap-2 transition-all group
                  ${desbloqueado ? 'hover:bg-white/10 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                title={desbloqueado ? `Usar ${santo.nombre} como avatar` : `Desbloquea a ${santo.nombre} en cofres primero`}
              >
                <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400/20 to-amber-400/20 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform">
                  {desbloqueado ? (
                    santo.imagen ? (
                      <img 
                        src={santo.imagen} 
                        alt={santo.nombre}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Si la imagen falla, mostrar emoji
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<span class="text-3xl">${santo.icono || '😇'}</span>`;
                        }}
                      />
                    ) : (
                      <span className="text-3xl">{santo.icono || '😇'}</span>
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black/50">
                      <span className="text-2xl">🔒</span>
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-black truncate w-full text-center ${desbloqueado ? 'text-white/80' : 'text-white/40'}`}>
                  {santo.nombre}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 text-center text-white/20 text-[9px]">
          Desbloquea más santos en cofres para usarlos como avatar
        </div>
      </div>
    </div>
  );
};

export default AvatarSelector;