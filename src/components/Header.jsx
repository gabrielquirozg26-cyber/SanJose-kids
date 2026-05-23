import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';

const Header = () => {
  const { nombre, monedas, vidas, userDoc } = useGame();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const avatar = userDoc?.avatar || '😇';
  const esImagen = avatar?.startsWith('http') || avatar?.startsWith('data:image') || avatar?.startsWith('/images/');
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-black/60 backdrop-blur-xl border-b border-white/10' : 'bg-black/40 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
        {/* Logo + Título */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-yellow-400/50 shadow-lg flex-shrink-0 bg-gradient-to-br from-yellow-400/20 to-amber-400/20">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-black tracking-tighter bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent truncate">
              San JoseKids
            </h1>
            <p className="hidden sm:block text-[9px] font-bold text-white/40 uppercase tracking-wider">
              Iglesia San José · Diriamba
            </p>
          </div>
        </div>

        {/* Avatar + badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Avatar del usuario */}
          <div className="relative group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-yellow-400/50 overflow-hidden bg-white/5 flex items-center justify-center">
              {esImagen ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg sm:text-xl">{avatar}</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-black/50"></div>
          </div>

          {/* Monedas */}
          <div className="glass-card !bg-black/40 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1">
            <span className="text-xs sm:text-sm">🪙</span>
            <span className="font-black text-yellow-400 text-xs sm:text-sm">{monedas}</span>
          </div>

          {/* Vidas */}
          <div className="glass-card !bg-black/40 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1">
            <span className="text-xs sm:text-sm animate-pulse">❤️</span>
            <span className="font-black text-white text-xs sm:text-sm">{vidas}/5</span>
          </div>

          {/* Nombre (solo desktop) */}
          <div className="hidden md:flex glass-card !bg-black/40 px-3 py-1.5 rounded-full items-center gap-1">
            <span className="text-sm">😇</span>
            <span className="font-black text-white text-sm truncate max-w-[100px]">{nombre}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;