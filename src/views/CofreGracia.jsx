import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

// ── Configuración de cofres (mismo estilo) ────────────────────────────────
export const TIPOS_COFRE = {
  madera: {
    id: 'madera',
    nombre: 'Cofre de Madera',
    icono: '📦',
    color: 'from-amber-800 to-amber-600',
    border: 'border-amber-600/60',
    glow: 'shadow-[0_0_30px_rgba(180,83,9,0.4)]',
    particulas: ['#92400e', '#d97706', '#fbbf24', '#ffffff'],
    descripcion: 'Santo común',
  },
  plata: {
    id: 'plata',
    nombre: 'Cofre de Plata',
    icono: '🎁',
    color: 'from-slate-400 to-slate-300',
    border: 'border-slate-400/60',
    glow: 'shadow-[0_0_40px_rgba(148,163,184,0.5)]',
    particulas: ['#94a3b8', '#cbd5e1', '#ffffff', '#facc15'],
    descripcion: 'Santo raro o común',
  },
  oro: {
    id: 'oro',
    nombre: 'Cofre de Oro',
    icono: '🏆',
    color: 'from-yellow-400 to-amber-300',
    border: 'border-yellow-400/80',
    glow: 'shadow-[0_0_60px_rgba(250,204,21,0.7)]',
    particulas: ['#facc15', '#fbbf24', '#ffffff', '#a78bfa'],
    descripcion: '¡Santo legendario!',
  },
};

// ── Colores según rareza para mostrar en la tarjeta ───────────────────────
const RAREZA_CLASE = {
  comun:      'bg-slate-500/30 text-slate-300 border-slate-500/30',
  raro:       'bg-blue-500/30 text-blue-300 border-blue-500/30',
  legendario: 'bg-yellow-500/30 text-yellow-300 border-yellow-500/30',
};

// ── Funcion de sorteo (ya no se usa directamente, pero se mantiene por si acaso) ──
export const sortearRecompensa = () => null; // Ya no se usa

// ── Componente principal ───────────────────────────────────────────────────
const CofreGracia = ({ tipoCofre = 'madera', recompensa, onCerrar }) => {
  const [fase, setFase] = useState('idle'); // idle → sacudiendo → abriendo → revelando → listo
  const config = TIPOS_COFRE[tipoCofre] ?? TIPOS_COFRE.madera;

  // Secuencia de animación automática al tocar el cofre
  const iniciarApertura = () => {
    if (fase !== 'idle') return;
    setFase('sacudiendo');
    setTimeout(() => setFase('abriendo'), 800);
    setTimeout(() => {
      setFase('revelando');
      // Confeti al revelar
      const boom = () => confetti({
        particleCount: 180,
        spread: 120,
        origin: { y: 0.5 },
        colors: config.particulas,
      });
      boom();
      if (tipoCofre === 'oro') {
        setTimeout(boom, 400);
        setTimeout(boom, 800);
      } else if (tipoCofre === 'plata') {
        setTimeout(boom, 500);
      }
    }, 1800);
    setTimeout(() => setFase('listo'), 2600);
  };

  // Si no hay recompensa (por seguridad) no mostramos nada
  if (!recompensa) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md px-6">
      {/* Fondos dinámicos por tipo */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000
        ${fase === 'revelando' || fase === 'listo' ? 'opacity-100' : 'opacity-0'}`}>
        {tipoCofre === 'oro' && (
          <>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-400/15 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-300/10 rounded-full blur-[80px]" />
          </>
        )}
        {tipoCofre === 'plata' && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-slate-400/10 rounded-full blur-[120px]" />
        )}
        {tipoCofre === 'madera' && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-amber-700/10 rounded-full blur-[100px]" />
        )}
      </div>

      <div className="w-full max-w-sm flex flex-col items-center gap-6 relative">
        {/* Tipo y descripción */}
        <div className="text-center animate-slide-up">
          <p className={`text-[10px] font-black uppercase tracking-[0.5em] mb-1
            ${tipoCofre === 'oro' ? 'text-yellow-400' : tipoCofre === 'plata' ? 'text-slate-300' : 'text-amber-500'}`}>
            {config.descripcion}
          </p>
          <h2 className="text-2xl font-black text-white tracking-tighter">{config.nombre}</h2>
        </div>

        {/* El cofre */}
        <div className="relative flex flex-col items-center">
          {(fase === 'revelando' || fase === 'listo') && (
            <>
              <div className={`absolute inset-[-20px] rounded-full opacity-30 animate-ping bg-gradient-to-br ${config.color}`} />
              <div className={`absolute inset-[-8px] rounded-full opacity-20 animate-pulse bg-gradient-to-br ${config.color}`} />
            </>
          )}

          <div
            onClick={iniciarApertura}
            className={`
              relative w-40 h-40 rounded-3xl flex items-center justify-center cursor-pointer
              bg-gradient-to-br ${config.color} border-4 ${config.border} ${config.glow}
              transition-all duration-300 select-none
              ${fase === 'idle' ? 'hover:scale-105 active:scale-95' : ''}
              ${fase === 'sacudiendo' ? 'animate-[shake_0.15s_ease-in-out_infinite]' : ''}
              ${fase === 'abriendo' ? 'scale-110' : ''}
              ${fase === 'revelando' || fase === 'listo' ? 'scale-90 opacity-80' : ''}
            `}
            style={{
              animation: fase === 'sacudiendo' ? 'shake 0.15s ease-in-out infinite' : undefined,
            }}
          >
            <span className={`text-7xl transition-all duration-500 drop-shadow-2xl select-none
              ${fase === 'abriendo' ? 'scale-125' : ''}
              ${fase === 'revelando' || fase === 'listo' ? 'scale-75 opacity-60' : ''}`}>
              {config.icono}
            </span>

            {fase === 'abriendo' && (
              <div className="absolute inset-0 flex items-start justify-center overflow-hidden rounded-3xl">
                <div className={`w-full h-1/2 bg-gradient-to-br ${config.color} border-b-4 ${config.border} rounded-t-3xl animate-[openLid_0.6s_ease-out_forwards]`} />
              </div>
            )}
          </div>

          {fase === 'idle' && (
            <div className="mt-4 flex flex-col items-center gap-2 animate-bounce">
              <p className="text-white/50 text-xs font-black uppercase tracking-widest">Toca para abrir</p>
              <span className="text-white/30 text-lg">👆</span>
            </div>
          )}

          {fase === 'abriendo' && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i}
                  className={`absolute w-2 h-2 rounded-full bg-gradient-to-br ${config.color} animate-[float_0.8s_ease-out_forwards]`}
                  style={{
                    left: `${20 + (i * 10)}%`,
                    top: `${30 + (i % 3) * 15}%`,
                    animationDelay: `${i * 0.05}s`,
                    opacity: 0,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Recompensa revelada (Santo) ── */}
        {(fase === 'revelando' || fase === 'listo') && recompensa && (
          <div className="w-full animate-slide-up space-y-4">
            <div className={`glass-card rounded-3xl p-6 border text-center space-y-3
              ${tipoCofre === 'oro'   ? 'border-yellow-400/50 bg-yellow-400/5'
              : tipoCofre === 'plata' ? 'border-slate-400/40 bg-slate-400/5'
              :                        'border-amber-600/40 bg-amber-600/5'}`}>

              <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.5em]">
                {recompensa.tipo === 'nuevo' ? '✨ ¡Nuevo Santo! ✨' : '🪙 Santo repetido'}
              </p>

              <div className={`w-24 h-24 rounded-2xl mx-auto flex items-center justify-center text-6xl
                bg-gradient-to-br ${config.color} shadow-xl`}>
                {recompensa.santo.icono}
              </div>

              <div>
                <p className={`font-black text-2xl
                  ${tipoCofre === 'oro' ? 'text-yellow-400'
                  : tipoCofre === 'plata' ? 'text-slate-200'
                  : 'text-amber-400'}`}>
                  {recompensa.santo.nombre}
                </p>
                {recompensa.tipo === 'repetido' && (
                  <p className="text-white/60 text-sm mt-1">
                    🪙 +{recompensa.compensacion} monedas por duplicado
                  </p>
                )}
              </div>

              <span className={`inline-block text-[10px] font-black uppercase px-3 py-1 rounded-full border ${RAREZA_CLASE[recompensa.santo.rareza]}`}>
                {recompensa.santo.rareza.toUpperCase()}
              </span>

              {recompensa.tipo === 'nuevo' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest bg-green-500/20 border-green-500/40 text-green-300">
                  📖 Añadido al álbum
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botón cerrar */}
        {fase === 'listo' && (
          <button onClick={onCerrar}
            className="w-full py-4 rounded-2xl bg-white text-black font-black text-base
              uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all animate-slide-up">
            ¡Genial! 🙏
          </button>
        )}

        {/* Saltarse la animación */}
        {fase !== 'idle' && fase !== 'listo' && (
          <button
            onClick={() => {
              setFase('listo');
              confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 }, colors: config.particulas });
            }}
            className="text-white/20 text-[10px] font-black uppercase tracking-widest hover:text-white/40 transition-colors mt-2">
            Saltar animación
          </button>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          20%       { transform: translateX(-6px) rotate(-3deg); }
          40%       { transform: translateX(6px)  rotate(3deg); }
          60%       { transform: translateX(-4px) rotate(-2deg); }
          80%       { transform: translateX(4px)  rotate(2deg); }
        }
        @keyframes openLid {
          0%   { transform: rotateX(0deg)   translateY(0); opacity: 1; }
          100% { transform: rotateX(-120deg) translateY(-40px); opacity: 0; }
        }
        @keyframes float {
          0%   { transform: translateY(0)    scale(1);   opacity: 1; }
          100% { transform: translateY(-60px) scale(0);  opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default CofreGracia;