import React from 'react';
import { useGame } from '../context/GameContext';
import nivelesData from '../data/niveles.json';

// ── Datos del mapa ─────────────────────────────────────────────────────────
const MAPA = [
  { nivelId: 1,  unidad: 1, unidadNombre: 'Semillas de Fe',        oracionId: 'u1_padre_nuestro',     icono: '🙏', nombre: 'Padre Nuestro'        },
  { nivelId: 2,  unidad: 1, unidadNombre: 'Semillas de Fe',        oracionId: 'u1_ave_maria',         icono: '🌹', nombre: 'Ave María'            },
  { nivelId: 3,  unidad: 1, unidadNombre: 'Semillas de Fe',        oracionId: 'u1_gloria',            icono: '✨', nombre: 'Gloria'               },
  { nivelId: 4,  unidad: 1, unidadNombre: 'Semillas de Fe',        oracionId: 'u1_angel_guarda',      icono: '👼', nombre: 'Ángel de la Guarda'   },
  { nivelId: 5,  unidad: 2, unidadNombre: 'Corazón Limpio',        oracionId: 'u2_yo_confieso',       icono: '😔', nombre: 'Yo Confieso'          },
  { nivelId: 6,  unidad: 2, unidadNombre: 'Corazón Limpio',        oracionId: 'u2_acto_contricion',   icono: '🕊️', nombre: 'Acto de Contrición'   },
  { nivelId: 7,  unidad: 2, unidadNombre: 'Corazón Limpio',        oracionId: 'u2_dulce_madre',       icono: '💙', nombre: 'Dulce Madre'          },
  { nivelId: 8,  unidad: 3, unidadNombre: 'La Roca de la Iglesia', oracionId: 'u3_credo_apostolico',  icono: '⛪', nombre: 'Credo Apostólico'     },
  { nivelId: 9,  unidad: 3, unidadNombre: 'La Roca de la Iglesia', oracionId: 'u3_salve',             icono: '🌊', nombre: 'La Salve'             },
  { nivelId: 10, unidad: 4, unidadNombre: 'Camino de Vida',        oracionId: 'u4_mandamientos',      icono: '📜', nombre: '10 Mandamientos'      },
  { nivelId: 11, unidad: 4, unidadNombre: 'Camino de Vida',        oracionId: 'u4_bienaventuranzas',  icono: '🕊️', nombre: 'Bienaventuranzas'     },
  { nivelId: 12, unidad: 5, unidadNombre: 'Gracia y Virtud',       oracionId: 'u5_sacramentos',       icono: '✝️', nombre: '7 Sacramentos'        },
  { nivelId: 13, unidad: 5, unidadNombre: 'Gracia y Virtud',       oracionId: 'u5_obras_misericordia', icono: '🤲', nombre: 'Obras de Misericordia' },
  { nivelId: 14, unidad: 6, unidadNombre: 'El Jardín de María',    oracionId: 'u6_misterios_gozosos',    icono: '📿', nombre: 'Misterios Gozosos'    },
  { nivelId: 15, unidad: 6, unidadNombre: 'El Jardín de María',    oracionId: 'u6_misterios_dolorosos',  icono: '✝️', nombre: 'Misterios Dolorosos'  },
  { nivelId: 16, unidad: 6, unidadNombre: 'El Jardín de María',    oracionId: 'u6_misterios_gloriosos',  icono: '👑', nombre: 'Misterios Gloriosos'  },
  { nivelId: 17, unidad: 6, unidadNombre: 'El Jardín de María',    oracionId: 'u6_misterios_luminosos',  icono: '💫', nombre: 'Misterios Luminosos'  },
];

// ── Examen por unidad ──────────────────────────────────────────────────────
// nivelMinimo: el nivelActual mínimo para desbloquear el examen de esa unidad
// (= último nivelId de la unidad + 1, porque nivelActual avanza al completar)
const EXAMENES = {
  1: { clave: 'unidad1', nombre: 'Semillas de Fe',        nivelMinimo: 5  },
  2: { clave: 'unidad2', nombre: 'Corazón Limpio',        nivelMinimo: 8  },
  3: { clave: 'unidad3', nombre: 'La Roca de la Iglesia', nivelMinimo: 10 },
  4: { clave: 'unidad4', nombre: 'Camino de Vida',        nivelMinimo: 12 },
  5: { clave: 'unidad5', nombre: 'Gracia y Virtud',       nivelMinimo: 14 },
  6: { clave: 'unidad6', nombre: 'El Jardín de María',    nivelMinimo: 18 },
};

// ── Helpers ────────────────────────────────────────────────────────────────
const getVersos = (oracionId) => {
  for (const key of Object.keys(nivelesData)) {
    const oracion = nivelesData[key].oraciones?.find(o => o.id === oracionId);
    if (oracion) return oracion;
  }
  return null;
};

const agruparPorUnidad = () => {
  const grupos = {};
  MAPA.forEach(n => {
    if (!grupos[n.unidad]) grupos[n.unidad] = { id: n.unidad, nombre: n.unidadNombre, nodos: [] };
    grupos[n.unidad].nodos.push(n);
  });
  return Object.values(grupos);
};

// ── Botón de nivel ─────────────────────────────────────────────────────────
const NivelBtn = ({ nodo, index, completado, desbloqueado, onPress }) => (
  <div
    className="flex flex-col items-center transition-transform duration-500"
    style={{ transform: `translateX(${index % 2 === 0 ? '-50px' : '50px'})` }}
  >
    <div className="relative">
      {completado && (
        <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-30 animate-pulse" />
      )}
      {desbloqueado && !completado && (
        <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse" />
      )}
      <button
        onClick={desbloqueado || completado ? onPress : undefined}
        className={`relative w-24 h-24 rounded-full flex items-center justify-center text-4xl
          shadow-2xl border-b-[10px] transition-all
          active:scale-95 active:border-b-0 active:translate-y-2
          ${completado
            ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 border-yellow-700'
            : desbloqueado
              ? 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-800'
              : 'bg-white/10 border-slate-600/50 cursor-not-allowed opacity-40'
          }`}
      >
        {completado || desbloqueado ? nodo.icono : '🔒'}
      </button>
    </div>

    <div className={`mt-4 px-4 py-1.5 rounded-full border shadow-sm transition-all
      ${completado
        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
        : desbloqueado
          ? 'bg-blue-500/20 text-blue-200 border-blue-400/40'
          : 'bg-white/5 text-white/20 border-white/10'
      }`}
    >
      <span className="font-black text-[11px] tracking-widest uppercase">{nodo.nombre}</span>
    </div>
  </div>
);

// ── Botón de examen de unidad ──────────────────────────────────────────────
const ExamenBtn = ({ examen, desbloqueado, aprobado, onPress }) => {
  if (!desbloqueado && !aprobado) {
    // Bloqueado: muestra candado pero con info de cuándo se desbloquea
    return (
      <div className="w-full mt-6 px-4">
        <div className="glass-card rounded-2xl p-4 border border-white/5 flex items-center gap-3 opacity-40">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl shrink-0">
            🔒
          </div>
          <div>
            <p className="text-white/50 font-black text-sm">Examen de Unidad</p>
            <p className="text-white/25 text-xs">Completa todas las oraciones para desbloquear</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-6 px-4">
      <button
        onClick={onPress}
        className={`w-full rounded-2xl p-4 border transition-all active:scale-95
          flex items-center gap-4
          ${aprobado
            ? 'bg-green-500/15 border-green-400/40 hover:bg-green-500/20'
            : 'bg-yellow-400/10 border-yellow-400/40 hover:bg-yellow-400/15 shadow-[0_0_20px_rgba(250,204,21,0.1)]'
          }`}
      >
        {/* Icono */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 border
          ${aprobado
            ? 'bg-green-500/20 border-green-400/40'
            : 'bg-yellow-400/15 border-yellow-400/30'
          }`}>
          {aprobado ? '✅' : '🎓'}
        </div>

        {/* Info */}
        <div className="flex-1 text-left">
          <p className={`font-black text-sm ${aprobado ? 'text-green-300' : 'text-yellow-300'}`}>
            {aprobado ? 'Examen aprobado' : 'Examen de Unidad'}
          </p>
          <p className="text-white/40 text-xs mt-0.5">
            {aprobado
              ? `${examen.nombre} — ¡Completado!`
              : `${examen.nombre} · 8 preguntas · +50🪙 c/u`}
          </p>
        </div>

        {/* Flecha / badge */}
        <div className={`shrink-0 px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-widest
          ${aprobado
            ? 'bg-green-500/20 text-green-400'
            : 'bg-yellow-400 text-blue-900'
          }`}>
          {aprobado ? '✓' : 'Entrar'}
        </div>
      </button>
    </div>
  );
};

// ── Componente principal ───────────────────────────────────────────────────
const Mapa = ({ onIniciarExamen }) => {
  const { nivelActual, vidas, iniciarLeccion, examenesAprobados = [] } = useGame();
  const grupos = agruparPorUnidad();

  const handlePresionar = (nodo) => {
    if (vidas <= 0) return;
    const oracion = getVersos(nodo.oracionId);
    if (!oracion) return;
    iniciarLeccion(oracion);
  };

  return (
    <div className="flex flex-col items-center w-full pb-8 relative">

      {/* Aviso sin vidas */}
      {vidas <= 0 && (
        <div className="w-full glass-card rounded-2xl p-4 mb-6 border border-red-500/30 text-center">
          <p className="text-red-400 font-black text-sm animate-pulse">❤️ Sin vidas — regresa en unas horas</p>
        </div>
      )}

      {grupos.map((grupo, gi) => {
        const examen        = EXAMENES[grupo.id];
        const examenDesbloq = nivelActual >= examen.nivelMinimo;
        const examenAprobado = examenesAprobados.includes(examen.clave);

        return (
          <div key={gi} className="w-full mb-16">

            {/* Encabezado de unidad */}
            <div className="text-center mb-10">
              <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em] mb-1">
                Unidad {gi + 1}
              </p>
              <h2 className="text-4xl font-black text-white tracking-tighter drop-shadow-lg">
                {grupo.nombre}
              </h2>
            </div>

            {/* Niveles en zigzag */}
            <div className="flex flex-col items-center gap-y-14 w-full px-8">
              {grupo.nodos.map((nodo, index) => (
                <NivelBtn
                  key={nodo.nivelId}
                  nodo={nodo}
                  index={index}
                  completado={nivelActual > nodo.nivelId}
                  desbloqueado={nivelActual === nodo.nivelId}
                  onPress={() => handlePresionar(nodo)}
                />
              ))}
            </div>

            {/* Botón de examen al final de la unidad */}
            <ExamenBtn
              examen={examen}
              desbloqueado={examenDesbloq}
              aprobado={examenAprobado}
              onPress={() => onIniciarExamen(examen.clave, examen.nombre)}
            />

            {/* Separador entre unidades */}
            {gi < grupos.length - 1 && (
              <div className="flex items-center gap-3 mt-10 px-8 opacity-20">
                <div className="flex-1 h-px bg-white/30" />
                <span className="text-white text-xs">✦</span>
                <div className="flex-1 h-px bg-white/30" />
              </div>
            )}
          </div>
        );
      })}

      {/* Decoración de fondo */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-30">
        <div className="absolute top-1/4 left-10 w-32 h-32 bg-yellow-200 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/3 right-10 w-40 h-40 bg-blue-200 rounded-full blur-[100px]" />
      </div>
    </div>
  );
};

export default Mapa;
