import React, { useEffect, useState } from 'react';

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#03050b]">
      {/* Fondo con gradientes animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* Logo animado */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-yellow-400/20 blur-xl animate-ping" />
          <div className="absolute inset-0 rounded-full bg-yellow-400/30 blur-2xl animate-pulse" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-yellow-400/50 shadow-2xl animate-float bg-gradient-to-br from-yellow-400/10 to-amber-400/10">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter bg-gradient-to-r from-yellow-400 via-white to-yellow-400 bg-clip-text text-transparent animate-pulse">
            San JoseKids
          </h1>
          <p className="text-white/40 text-xs font-black uppercase tracking-[0.3em]">
            Iglesia San José de Diriamba
          </p>
        </div>

        {/* Barra de carga premium */}
        <div className="w-64 sm:w-80 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <p className="text-white/30 text-[10px] font-black uppercase tracking-widest animate-pulse">
          {progress < 30 && "Cargando paraíso..."}
          {progress >= 30 && progress < 70 && "Preparando lecciones..."}
          {progress >= 70 && "¡Casi listo!"}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;