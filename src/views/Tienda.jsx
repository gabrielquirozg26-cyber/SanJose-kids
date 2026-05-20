import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import confetti from 'canvas-confetti';

// ── Catálogo completo ──────────────────────────────────────────────────────
const CATALOGO = [
  {
    id: 'corazon_extra',
    icono: '❤️',
    nombre: 'Corazón Extra',
    descripcion: 'Recupera 1 vida ahora mismo. Consumible.',
    precio: 75,
    rareza: 'comun',
    consumible: true,
  },
  {
    id: 'escudo_miguel',
    icono: '🛡️',
    nombre: 'Escudo de San Miguel',
    descripcion: 'Protección contra un error en tu próxima lección.',
    precio: 100,
    rareza: 'comun',
    consumible: false,
  },
  {
    id: 'pocion_sabiduria',
    icono: '🧪',
    nombre: 'Poción de Sabiduría',
    descripcion: 'Elimina 2 opciones incorrectas automáticamente.',
    precio: 150,
    rareza: 'comun',
    consumible: false,
  },
  {
    id: 'reloj_arena',
    icono: '⏳',
    nombre: 'Reloj de Arena',
    descripcion: 'Tiempo extra en ejercicios de ordenar palabras.',
    precio: 120,
    rareza: 'comun',
    consumible: false,
  },
  {
    id: 'seguro_racha',
    icono: '🔥',
    nombre: 'Seguro de Racha',
    descripcion: 'Protege tu racha si un día no puedes jugar.',
    precio: 200,
    rareza: 'raro',
    consumible: false,
  },
  {
    id: 'aura_santidad',
    icono: '✨',
    nombre: 'Aura de Santidad',
    descripcion: 'Efecto visual brillante para tu avatar en el ranking.',
    precio: 300,
    rareza: 'raro',
    consumible: false,
  },
  {
    id: 'marco_vitral_azul',
    icono: '🔵',
    nombre: 'Marco Vitral Azul',
    descripcion: 'Borde artístico azul para tu foto de perfil.',
    precio: 250,
    rareza: 'raro',
    consumible: false,
  },
  {
    id: 'marco_vitral_dorado',
    icono: '🟡',
    nombre: 'Marco Vitral Dorado',
    descripcion: 'Borde artístico dorado para tu foto de perfil.',
    precio: 400,
    rareza: 'epico',
    consumible: false,
  },
  {
    id: 'titulo_guardian',
    icono: '⚜️',
    nombre: 'Título: Guardián del Credo',
    descripcion: 'Cambia tu rango a "Guardián del Credo" visible en el ranking.',
    precio: 500,
    rareza: 'epico',
    consumible: false,
  },
  {
    id: 'titulo_maestro',
    icono: '👑',
    nombre: 'Título: Maestro de la Fe',
    descripcion: 'El rango más alto. Visible para todo el grupo.',
    precio: 800,
    rareza: 'legendario',
    consumible: false,
  },
];

const RAREZA_STYLE = {
  comun:      { badge: 'bg-slate-500/30 text-slate-300 border-slate-500/30',    card: 'border-white/10'            },
  raro:       { badge: 'bg-blue-500/30 text-blue-300 border-blue-500/30',       card: 'border-blue-400/20'         },
  epico:      { badge: 'bg-purple-500/30 text-purple-300 border-purple-500/30', card: 'border-purple-400/20'       },
  legendario: { badge: 'bg-yellow-500/30 text-yellow-300 border-yellow-500/30', card: 'border-yellow-400/40'       },
};

const RAREZA_LABEL = {
  comun: 'Común', raro: 'Raro', epico: 'Épico', legendario: 'Legendario',
};

const FILTROS = ['todos', 'comun', 'raro', 'epico', 'legendario'];

// ── Toast de feedback ──────────────────────────────────────────────────────
const Toast = ({ mensaje, tipo }) => (
  <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl
    font-black text-sm uppercase tracking-widest shadow-2xl animate-slide-up
    ${tipo === 'ok'    ? 'bg-green-500 text-white'
    : tipo === 'error' ? 'bg-red-500 text-white'
    :                    'bg-yellow-400 text-blue-900'}`}
  >
    {mensaje}
  </div>
);

// ── Componente principal ───────────────────────────────────────────────────
const Tienda = () => {
  const {
    monedas, vidas, inventario,
    comprarItem, minutosHastaVida,
  } = useGame();

  const [filtro, setFiltro]     = useState('todos');
  const [toast, setToast]       = useState(null);
  const [comprando, setCompr]   = useState(null);

  const mostrarToast = (mensaje, tipo = 'ok') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 2500);
  };

  const catalogo = filtro === 'todos'
    ? CATALOGO
    : CATALOGO.filter(i => i.rareza === filtro);

  const handleComprar = async (item) => {
    if (comprando) return;

    // Validaciones previas con feedback claro
    if (monedas < item.precio) {
      mostrarToast(`Necesitas 🪙 ${item.precio - monedas} más`, 'error');
      return;
    }
    if (!item.consumible && inventario.includes(item.id)) {
      mostrarToast('Ya tienes este objeto', 'error');
      return;
    }
    if (item.id === 'corazon_extra' && vidas >= 5) {
      mostrarToast('Ya tienes todas las vidas ❤️', 'error');
      return;
    }

    setCompr(item.id);
    const ok = await comprarItem(item);
    setCompr(null);

    if (ok) {
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#facc15', '#fff', '#3b82f6'],
      });
      if (item.id === 'corazon_extra') {
        mostrarToast('❤️ +1 Vida recuperada', 'ok');
      } else if (item.id === 'titulo_guardian' || item.id === 'titulo_maestro') {
        mostrarToast('👑 ¡Título aplicado!', 'ok');
      } else {
        mostrarToast(`✅ ${item.nombre} obtenido`, 'ok');
      }
    } else {
      mostrarToast('No se pudo completar la compra', 'error');
    }
  };

  // Tiempo hasta próxima vida
  const mins = minutosHastaVida();
  const tiempoVida = mins > 0
    ? mins >= 60
      ? `${Math.floor(mins / 60)}h ${mins % 60}m`
      : `${mins}m`
    : null;

  return (
    <div className="py-6 space-y-5 animate-slide-up">

      {/* Toast */}
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} />}

      {/* ── Cabecera ── */}
      <div className="glass-card rounded-3xl p-5 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
              Bazar de la Gracia
            </h2>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-0.5">
              Objetos sagrados
            </p>
          </div>
          <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 px-4 py-2 rounded-2xl">
            <span className="text-lg">🪙</span>
            <span className="text-yellow-300 font-black text-lg">{monedas}</span>
          </div>
        </div>

        {/* Vidas con contador regresivo */}
        <div className="flex items-center justify-between bg-white/5 rounded-2xl px-4 py-2.5 border border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-base">❤️</span>
            <span className="font-black text-sm text-white">
              {vidas} / 5 vidas
            </span>
          </div>
          {tiempoVida ? (
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
              +1 en {tiempoVida}
            </span>
          ) : (
            <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">
              Completas ✓
            </span>
          )}
        </div>
      </div>

      {/* ── Filtros ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {FILTROS.map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`shrink-0 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border transition-all
              ${filtro === f
                ? 'bg-white text-black border-white'
                : 'bg-white/5 text-white/40 border-white/10 hover:border-white/30'}`}
          >
            {f === 'todos' ? 'Todos' : RAREZA_LABEL[f]}
          </button>
        ))}
      </div>

      {/* ── Catálogo ── */}
      <div className="grid grid-cols-1 gap-4">
        {catalogo.map(item => {
          const estilo      = RAREZA_STYLE[item.rareza];
          const yaComprado  = !item.consumible && inventario.includes(item.id);
          const sinFondos   = monedas < item.precio;
          const estaCompr   = comprando === item.id;
          const esCorazon   = item.id === 'corazon_extra';
          const vidasLlenas = esCorazon && vidas >= 5;

          return (
            <div key={item.id}
              className={`glass-card rounded-3xl p-5 border transition-all duration-300
                ${estilo.card}
                ${yaComprado ? 'opacity-70' : ''}
                ${estaCompr  ? 'scale-[1.01] shadow-[0_0_25px_rgba(250,204,21,0.2)]' : ''}`}
            >
              <div className="flex items-center gap-4">

                {/* Icono */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0
                  ${yaComprado ? 'bg-green-500/10' : 'bg-white/5'}`}>
                  {item.icono}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-black text-white text-sm">{item.nombre}</h3>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${estilo.badge}`}>
                      {RAREZA_LABEL[item.rareza]}
                    </span>
                    {item.consumible && (
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0
                        bg-orange-500/20 text-orange-300 border-orange-500/30">
                        Consumible
                      </span>
                    )}
                  </div>
                  <p className="text-white/40 text-xs leading-snug">{item.descripcion}</p>
                </div>

                {/* Botón */}
                <div className="shrink-0">
                  {yaComprado ? (
                    <div className="w-16 h-10 rounded-xl bg-green-500/20 border border-green-500/30
                      flex items-center justify-center gap-1">
                      <span className="text-green-400 text-xs font-black">✓</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleComprar(item)}
                      disabled={sinFondos || estaCompr || vidasLlenas}
                      className={`px-3 py-2 rounded-xl font-black text-xs transition-all active:scale-95
                        ${sinFondos || vidasLlenas
                          ? 'bg-white/5 text-white/20 cursor-not-allowed'
                          : estaCompr
                            ? 'bg-yellow-400/50 text-blue-900 cursor-wait'
                            : 'bg-yellow-400 text-blue-900 hover:bg-yellow-300 shadow-lg shadow-yellow-400/20'
                        }`}
                    >
                      {estaCompr ? '…' : `🪙 ${item.precio}`}
                    </button>
                  )}
                </div>
              </div>

              {/* Efecto activo para items con seguro de racha */}
              {item.id === 'seguro_racha' && inventario.includes('seguro_racha') && (
                <div className="mt-3 flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-1.5">
                  <span className="text-xs">🛡️</span>
                  <p className="text-orange-300 text-[10px] font-black uppercase tracking-wider">
                    Activo — protege tu racha
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-white/20 text-[9px] font-black uppercase tracking-[0.4em] pb-2">
        Más artículos próximamente
      </p>
    </div>
  );
};

export default Tienda;
