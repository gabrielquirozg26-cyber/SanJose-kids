import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { activeTab, setActiveTab } = useGame();
  const [hoveredTab, setHoveredTab] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // ── OCULTAR/MOSTRAR NAVBAR AL SCROLL ──
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const tabs = [
    { id: 'mapa', icono: '🗺️', label: 'Mapa', color: 'from-emerald-400/20 to-emerald-500/10' },
    { id: 'album', icono: '📖', label: 'Álbum', color: 'from-blue-400/20 to-blue-500/10' },
    { id: 'tienda', icono: '🛒', label: 'Tienda', color: 'from-amber-400/20 to-amber-500/10' },
    { id: 'ranking', icono: '🏆', label: 'Ranking', color: 'from-purple-400/20 to-purple-500/10' },
    { id: 'misiones', icono: '⭐', label: 'Misiones', color: 'from-yellow-400/20 to-yellow-500/10' },
    { id: 'perfil', icono: '👤', label: 'Perfil', color: 'from-pink-400/20 to-pink-500/10' },
  ];

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : 100 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-2xl border-t border-white/10 shadow-2xl"
    >
      <div className="max-w-xl mx-auto px-1 py-1.5 sm:py-2">
        <div className="flex justify-between items-center gap-0.5 sm:gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isHovered = hoveredTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                onMouseEnter={() => setHoveredTab(tab.id)}
                onMouseLeave={() => setHoveredTab(null)}
                whileTap={{ scale: 0.92 }}
                className={`relative flex flex-col items-center justify-center flex-1 py-1.5 sm:py-2 rounded-xl transition-all duration-300
                  ${isActive 
                    ? `bg-gradient-to-t ${tab.color} text-yellow-300 scale-105` 
                    : 'text-white/40 hover:text-white/70'
                  }`}
              >
                {/* Efecto de brillo para el tab activo */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-yellow-400 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.8)]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Icono con animación */}
                <motion.span 
                  className="text-xl sm:text-2xl mb-0.5 drop-shadow-lg transition-transform duration-200"
                  animate={{ 
                    scale: isActive ? 1.15 : isHovered ? 1.1 : 1,
                    y: isActive ? -2 : 0
                  }}
                >
                  {tab.icono}
                </motion.span>

                {/* Label con animación */}
                <motion.span 
                  className={`text-[8px] sm:text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
                    isActive ? 'text-yellow-300' : 'text-white/50'
                  }`}
                  animate={{
                    opacity: isActive || isHovered ? 1 : 0.7,
                    scale: isActive ? 1.05 : 1
                  }}
                >
                  {tab.label}
                </motion.span>

                {/* Efecto de onda al hacer hover */}
                {isHovered && !isActive && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    className="absolute inset-0 rounded-xl bg-white/5 pointer-events-none"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Indicador de scroll para mostrar/ocultar */}
      <AnimatePresence>
        {!isVisible && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => setIsVisible(true)}
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md rounded-full p-1.5 border border-white/10"
          >
            <span className="text-white/40 text-sm">▲</span>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;