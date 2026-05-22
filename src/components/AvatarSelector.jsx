import React, { useState, useRef } from 'react';

const AVATARES_SANTOS = [
  { id: 'san_jose', nombre: 'San José', emoji: '🪚' },
  { id: 'san_juan_pablo', nombre: 'San Juan Pablo II', emoji: '🌍' },
  { id: 'san_francisco', nombre: 'San Francisco', emoji: '🕊️' },
  { id: 'santa_teresa', nombre: 'Santa Teresa', emoji: '✨' },
  { id: 'san_miguel', nombre: 'San Miguel Arcángel', emoji: '🛡️' },
  { id: 'carlo_acutis', nombre: 'Carlo Acutis', emoji: '💻' },
  { id: 'virgen_maria', nombre: 'Virgen María', emoji: '🌹' },
  { id: 'san_pedro', nombre: 'San Pedro', emoji: '🔑' },
];

const AvatarSelector = ({ isOpen, onClose, onSelectAvatar }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      setError('Por favor selecciona una imagen válida');
      return;
    }
    if (file.size > 500 * 1024) {
      setError('La imagen es muy grande (máx 500KB)');
      return;
    }
    setUploading(true);
    setError(null);
    setPreview(URL.createObjectURL(file));
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        onSelectAvatar(base64String); // solo notifica
        onClose();
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setError('Error al procesar la imagen');
      setUploading(false);
    }
  };

  const handleSelectSanto = (santo) => {
    onSelectAvatar(santo.emoji);
    onClose();
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
            <div onClick={() => fileInputRef.current.click()} className="w-20 h-20 rounded-full bg-white/10 border-2 border-dashed border-white/30 flex items-center justify-center cursor-pointer hover:border-yellow-400 transition-all overflow-hidden">
              {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-3xl">📷</span>}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/jpeg,image/png,image/webp" className="hidden" disabled={uploading} />
            <div>
              <p className="text-white text-sm font-bold">Sube tu foto</p>
              <p className="text-white/30 text-[10px]">JPG, PNG hasta 500KB</p>
              {uploading && <p className="text-yellow-400 text-[10px] mt-1">Procesando...</p>}
              {error && <p className="text-red-400 text-[10px] mt-1">{error}</p>}
            </div>
          </div>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <div className="relative flex justify-center text-xs"><span className="bg-black/50 px-2 text-white/40">O elige un santo</span></div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {AVATARES_SANTOS.map(santo => (
            <button key={santo.id} onClick={() => handleSelectSanto(santo)} className="glass-card p-3 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/10 transition-all group">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400/20 to-amber-400/20 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                {santo.emoji}
              </div>
              <span className="text-[10px] font-black text-white/80">{santo.nombre}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 text-center text-white/20 text-[9px]">Más santos próximamente</div>
      </div>
    </div>
  );
};

export default AvatarSelector;