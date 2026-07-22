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
  const vidasMostradas = Math.min(vidas, 5);

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
      scrolled ? 'bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-lg' : 'bg-black/40 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
        {/* ── LOGO Y NOMBRE CON SUBTÍTULO ── */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Logo circular con glow */}
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-0.5 rounded-full bg-yellow-400/30 blur-sm animate-pulse" />
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-yellow-400/50 shadow-lg bg-gradient-to-br from-yellow-400/20 to-amber-400/20">
              <img src="/logo.jpg" alt="San JoseKids" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Nombre y subtítulo */}
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-black tracking-tighter bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-300 bg-clip-text text-transparent truncate">
              San JoseKids
            </h1>
            <p className="text-[8px] sm:text-[10px] font-bold text-white/40 tracking-[0.2em] truncate">
              Iglesia San José · Diriamba
            </p>
          </div>
        </div>

        {/* ── BADGES DE USUARIO ── */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Avatar */}
          <div className="relative group hidden sm:flex">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-yellow-400/50 overflow-hidden bg-white/5 flex items-center justify-center transition-all group-hover:scale-105 group-hover:border-yellow-400">
              {esImagen ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-base sm:text-lg">{avatar}</span>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-black/50"></div>
          </div>

          {/* Monedas */}
          <div className="glass-card !bg-black/40 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1 border border-white/10 hover:border-yellow-400/30 transition-all">
            <span className="text-[10px] sm:text-sm">🪙</span>
            <span className="font-black text-yellow-400 text-[10px] sm:text-sm">{monedas.toLocaleString()}</span>
          </div>

          {/* Vidas */}
          <div className="glass-card !bg-black/40 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1 border border-white/10 hover:border-red-400/30 transition-all">
            <span className="text-[10px] sm:text-sm animate-pulse">❤️</span>
            <span className="font-black text-white text-[10px] sm:text-sm">{vidasMostradas}/5</span>
          </div>

          {/* Nombre del usuario (solo desktop) */}
          <div className="hidden lg:flex glass-card !bg-black/40 px-3 py-1.5 rounded-full items-center gap-1.5 border border-white/10">
            <span className="text-sm">😇</span>
            <span className="font-black text-white text-sm truncate max-w-[80px]">{nombre}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;