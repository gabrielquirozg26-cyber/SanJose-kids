import React, { useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import santosData from '../data/santos.json';

// Función de compresión
const comprimirImagen = async (file, maxWidth = 500, maxHeight = 500, quality = 0.8) => {
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
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
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

const AvatarSelector = ({ isOpen, onClose, onSelectAvatar }) => {
  const { actualizarAvatar, usuarioId, coleccion } = useGame();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const santos = santosData.santos;
  const coleccionSet = new Set(coleccion);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      const compressedFile = await comprimirImagen(file, 500, 500, 0.8);
      
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
      onClose();
    } catch (err) {
      console.error('Error al subir imagen:', err);
      setError('Error al subir la imagen. Intenta de nuevo.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (preview) URL.revokeObjectURL(preview);
    }
  };

  const handleSelectSanto = async (santo) => {
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
              <p className="text-white/30 text-[10px]">JPG, PNG, WebP · Se comprime automáticamente</p>
              {uploading && (
                <div className="mt-1">
                  <p className="text-yellow-400 text-[10px]">Subiendo... {uploadProgress}%</p>
                  <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
              {error && <p className="text-red-400 text-[10px] mt-1">{error}</p>}
            </div>
          </div>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <div className="relative flex justify-center text-xs"><span className="bg-black/50 px-2 text-white/40">Santos desbloqueados</span></div>
        </div>

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