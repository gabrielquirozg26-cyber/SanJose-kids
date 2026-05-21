import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import confetti from 'canvas-confetti';

// ── Helpers ────────────────────────────────────────────────────────────────
const mezclar = (arr) => [...arr].sort(() => Math.random() - 0.5);

const normalizar = (str) =>
  str.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');

const elegirTipo = (anterior) => {
  const tipos = ['seleccion', 'ordenar', 'escritura'];
  const disponibles = tipos.filter(t => t !== anterior);
  return disponibles[Math.floor(Math.random() * disponibles.length)];
};

// ══════════════════════════════════════════════════════════════════════════
// ANIMACIÓN ESCUDO DE SAN MIGUEL
// ══════════════════════════════════════════════════════════════════════════
const AnimacionEscudo = ({ onFin }) => {
  useEffect(() => {
    confetti({
      particleCount: 120, spread: 100, origin: { y: 0.5 },
      colors: ['#e2e8f0', '#facc15', '#94a3b8', '#fbbf24'], shapes: ['star'],
    });
    const t = setTimeout(onFin, 2800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute w-40 h-40 rounded-full bg-blue-400/20 animate-ping" />
        <div className="absolute w-32 h-32 rounded-full bg-yellow-400/20 animate-pulse" />
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400/30 to-blue-500/30
          border-4 border-yellow-400 flex items-center justify-center shadow-[0_0_60px_rgba(250,204,21,0.6)]">
          <span className="text-6xl drop-shadow-2xl">🛡️</span>
        </div>
      </div>
      <div className="text-center space-y-2 animate-slide-up px-8">
        <p className="text-yellow-400 font-black text-xs uppercase tracking-[0.5em]">El escudo de</p>
        <h2 className="text-white font-black text-3xl tracking-tight">San Miguel</h2>
        <p className="text-white font-black text-lg">te ha protegido</p>
        <p className="text-white/50 text-sm font-bold italic mt-2">Tu error fue absorbido ✦ ¡Sigue adelante!</p>
      </div>
      <div className="mt-8 w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full" style={{ animation: 'shrink 2.8s linear forwards' }} />
      </div>
      <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// PANTALLA DE VICTORIA (sin botón de cofre, solo estadísticas y botón Volver)
// ══════════════════════════════════════════════════════════════════════════
const PantallaVictoria = ({
  oracion, monedasGanadas, errores, totalVersos,
  escudosUsados, tipoCofre, onVolverMapa,
}) => {
  const precision  = Math.round(((totalVersos - errores) / totalVersos) * 100);
  const esPerfecta = errores === 0;

  useEffect(() => {
    const lanzar = () => confetti({
      particleCount: 200, spread: 120, origin: { y: 0.4 },
      colors: ['#facc15', '#ffffff', '#3b82f6', '#10b981'],
    });
    lanzar();
    const t = setTimeout(lanzar, 700);
    return () => clearTimeout(t);
  }, []);

  const rango =
    precision === 100 ? { label: '¡PERFECTO!',   icono: '⭐', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' }
    : precision >= 80 ? { label: '¡EXCELENTE!',  icono: '🔥', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/30' }
    : precision >= 60 ? { label: '¡BIEN HECHO!', icono: '👍', color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/30'    }
    :                   { label: '¡COMPLETADO!', icono: '✝️', color: 'text-white/60',   bg: 'bg-white/5 border-white/10'           };

  return (
    <div className="min-h-screen bg-[#050b14] text-white font-sans flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-yellow-400/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-sm space-y-5 animate-slide-up">

        {/* Icono + título */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full bg-yellow-400/10 border-2 border-yellow-400/40
              flex items-center justify-center text-5xl mx-auto shadow-[0_0_40px_rgba(250,204,21,0.3)]">
              {oracion.icono}
            </div>
            {esPerfecta && (
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-yellow-400
                flex items-center justify-center text-base shadow-lg animate-bounce">⭐</div>
            )}
          </div>
          <div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Nivel completado</p>
            <h1 className="text-3xl font-black text-white tracking-tighter mt-1">{oracion.nombre}</h1>
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${rango.bg}`}>
            <span className="text-lg">{rango.icono}</span>
            <span className={`font-black text-sm tracking-widest ${rango.color}`}>{rango.label}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-2xl p-4 text-center border border-yellow-400/20">
            <p className="text-2xl mb-1">🪙</p>
            <p className="text-yellow-400 font-black text-xl">+{monedasGanadas}</p>
            <p className="text-white/30 text-[9px] font-black uppercase tracking-wider mt-0.5">Monedas</p>
          </div>
          <div className={`glass-card rounded-2xl p-4 text-center border ${precision === 100 ? 'border-green-400/30' : 'border-white/10'}`}>
            <p className="text-2xl mb-1">{precision === 100 ? '💯' : '🎯'}</p>
            <p className={`font-black text-xl ${precision === 100 ? 'text-green-400' : 'text-white'}`}>{precision}%</p>
            <p className="text-white/30 text-[9px] font-black uppercase tracking-wider mt-0.5">Precisión</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center border border-white/10">
            <p className="text-2xl mb-1">📖</p>
            <p className="text-white font-black text-xl">{totalVersos}</p>
            <p className="text-white/30 text-[9px] font-black uppercase tracking-wider mt-0.5">Versos</p>
          </div>
        </div>

        {/* Escudos usados */}
        {escudosUsados > 0 && (
          <div className="glass-card rounded-2xl p-4 border border-yellow-400/20 flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <p className="text-yellow-400 font-black text-sm">Escudo de San Miguel</p>
              <p className="text-white/40 text-xs">Absorbió {escudosUsados} error{escudosUsados > 1 ? 'es' : ''}</p>
            </div>
          </div>
        )}

        {/* Barra de precisión */}
        <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Precisión total</p>
            <p className={`text-sm font-black ${precision === 100 ? 'text-green-400' : precision >= 80 ? 'text-yellow-400' : 'text-white/60'}`}>
              {totalVersos - errores}/{totalVersos} correctas
            </p>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000
              ${precision === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-400'
              : precision >= 80   ? 'bg-gradient-to-r from-yellow-500 to-yellow-300'
              :                     'bg-gradient-to-r from-blue-500 to-cyan-400'}`}
              style={{ width: `${precision}%` }} />
          </div>
        </div>

        {/* Botón para volver al mapa (el cofre se maneja aparte en App.jsx) */}
        <button
          onClick={onVolverMapa}
          className="w-full py-5 rounded-2xl bg-white text-black font-black text-lg
            uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
        >
          Volver al mapa 🗺️
        </button>

        <p className="text-center text-white/30 text-xs italic px-4">
          {esPerfecta
            ? `"${oracion.nombre}" grabada en tu corazón. ¡Sin errores!`
            : precision >= 80 ? `Casi memorizas toda la oración. ¡Sigue así!`
            : `Cada práctica te acerca más a memorizar "${oracion.nombre}".`}
        </p>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// EJERCICIO 1 — SELECCIÓN
// ══════════════════════════════════════════════════════════════════════════
const EjercicioSeleccion = ({ verso, resultado, onSeleccionar, seleccionada }) => {
  const opciones = useMemo(() => mezclar(verso.opcionesSeleccion), [verso.id]);
  const partes   = verso.texto.split(verso.palabraFaltante);
  return (
    <div className="w-full">
      <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] mb-3">Elige la palabra correcta</p>
      <div className="glass-card p-6 rounded-3xl border border-white/10 mb-6 text-xl font-black leading-relaxed text-white/90">
        {partes[0]}
        <span className={`inline-block mx-1 px-3 py-0.5 rounded-xl border-b-2 transition-all duration-300
          ${!seleccionada           ? 'text-white/20 border-white/20 bg-white/5'
          : resultado === 'acierto' ? 'text-green-300 border-green-400 bg-green-500/10'
          : resultado === 'error'   ? 'text-red-300 border-red-400 bg-red-500/10'
          :                          'text-yellow-300 border-yellow-400 bg-yellow-500/10'}`}>
          {seleccionada || '___'}
        </span>
        {partes[1]}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {opciones.map((op, i) => {
          const esSelec = op === seleccionada;
          const esCorrecta = op === verso.palabraFaltante;
          return (
            <button key={i} onClick={() => !resultado && onSeleccionar(op)}
              className={`p-4 rounded-2xl border-2 font-black text-sm transition-all duration-200 active:scale-95
                ${esSelec && !resultado ? 'bg-blue-600/20 border-blue-400 text-white' : ''}
                ${resultado && esCorrecta ? 'border-green-400 bg-green-500/20 text-green-300' : ''}
                ${resultado === 'error' && esSelec && !esCorrecta ? 'border-red-400 bg-red-500/20 text-red-300' : ''}
                ${!esSelec && !resultado ? 'bg-white/5 border-white/10 text-white/70 hover:border-white/30' : ''}`}>
              {op}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// EJERCICIO 2 — ORDENAR
// ══════════════════════════════════════════════════════════════════════════
const EjercicioOrdenar = ({ verso, resultado, onRespuesta }) => {
  const palabrasDisponibles = useMemo(() => mezclar(verso.palabrasOrdenar), [verso.id]);
  const [usadas, setUsadas] = useState([]);
  const [armada, setArmada] = useState([]);

  useEffect(() => { setUsadas([]); setArmada([]); }, [verso.id]);
  useEffect(() => { onRespuesta(armada.join(' ')); }, [armada]);

  const agregar = (palabra, idx) => {
    if (resultado || usadas.includes(idx)) return;
    setUsadas(p => [...p, idx]); setArmada(p => [...p, palabra]);
  };
  const quitarUltima = () => {
    if (resultado || !armada.length) return;
    setArmada(p => p.slice(0, -1)); setUsadas(p => p.slice(0, -1));
  };

  return (
    <div className="w-full">
      <p className="text-[9px] font-black text-yellow-400 uppercase tracking-[0.3em] mb-3">Ordena las palabras</p>
      <div className={`min-h-[72px] glass-card p-4 rounded-3xl border-2 mb-4 flex flex-wrap gap-2 items-start transition-all duration-300
        ${resultado === 'acierto' ? 'border-green-400/60 bg-green-500/10'
        : resultado === 'error'   ? 'border-red-400/60 bg-red-500/10'
        : armada.length > 0       ? 'border-blue-400/40' : 'border-white/10'}`}>
        {armada.length === 0
          ? <span className="text-white/20 text-sm font-bold self-center">Toca las palabras para ordenarlas…</span>
          : armada.map((p, i) => (
            <span key={i} className={`px-3 py-1.5 rounded-xl font-black text-sm
              ${resultado === 'acierto' ? 'bg-green-500/30 text-green-200'
              : resultado === 'error'   ? 'bg-red-500/30 text-red-200'
              :                          'bg-blue-500/20 text-blue-200 border border-blue-400/30'}`}>{p}</span>
          ))}
      </div>
      {resultado === 'error' && (
        <div className="mb-4 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-[9px] text-white/40 uppercase tracking-widest font-black mb-1">Respuesta correcta</p>
          <p className="text-white/80 text-sm font-bold">{verso.palabrasOrdenar.join(' ')}</p>
        </div>
      )}
      <div className="flex flex-wrap gap-2 mb-3">
        {palabrasDisponibles.map((p, i) => (
          <button key={i} onClick={() => agregar(p, i)}
            disabled={!!resultado || usadas.includes(i)}
            className={`px-3 py-2 rounded-xl border font-black text-sm transition-all active:scale-95
              ${usadas.includes(i) ? 'opacity-20 cursor-not-allowed bg-white/5 border-white/5 text-white/30'
              : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40'}`}>{p}</button>
        ))}
      </div>
      {!resultado && armada.length > 0 && (
        <button onClick={quitarUltima}
          className="text-[10px] text-white/30 font-black uppercase tracking-widest hover:text-white/60 transition-colors">
          ← Borrar última
        </button>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// EJERCICIO 3 — ESCRITURA
// ══════════════════════════════════════════════════════════════════════════
const EjercicioEscritura = ({ verso, resultado, onEscribir, escrito }) => {
  const inputRef = useRef(null);
  useEffect(() => { if (!resultado && inputRef.current) inputRef.current.focus(); }, [verso.id]);
  const partes = verso.texto.split(verso.palabraFaltante);
  const pista  = verso.palabraFaltante[0] + '_'.repeat(Math.max(0, verso.palabraFaltante.length - 1));

  return (
    <div className="w-full">
      <p className="text-[9px] font-black text-purple-400 uppercase tracking-[0.3em] mb-3">Escribe la palabra que falta</p>
      <div className="glass-card p-6 rounded-3xl border border-white/10 mb-6 text-xl font-black leading-relaxed text-white/90">
        {partes[0]}
        <span className={`inline-block mx-1 px-3 py-0.5 rounded-xl border-b-2 min-w-[60px] text-center transition-all duration-300
          ${!escrito             ? 'text-white/20 border-white/20'
          : resultado === 'acierto' ? 'text-green-300 border-green-400 bg-green-500/10'
          : resultado === 'error'   ? 'text-red-300 border-red-400 bg-red-500/10'
          :                          'text-yellow-300 border-yellow-400'}`}>
          {escrito || pista}
        </span>
        {partes[1]}
      </div>
      <input ref={inputRef} type="text" value={escrito}
        onChange={e => !resultado && onEscribir(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && escrito && !resultado && document.getElementById('btn-comprobar')?.click()}
        placeholder={`Pista: empieza con "${verso.palabraFaltante[0]}"`}
        disabled={!!resultado}
        className={`w-full bg-white/5 border-2 rounded-2xl px-5 py-4 font-black text-lg text-white outline-none transition-all
          placeholder:text-white/20 placeholder:font-normal placeholder:text-sm
          ${resultado === 'acierto' ? 'border-green-400 bg-green-500/10'
          : resultado === 'error'   ? 'border-red-400 bg-red-500/10'
          : escrito ? 'border-blue-400 focus:border-blue-300' : 'border-white/10 focus:border-white/30'}`}
      />
      {resultado === 'error' && (
        <p className="mt-2 text-sm font-black text-white/60">
          Era: <span className="text-yellow-400">{verso.palabraFaltante}</span>
        </p>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════
const Leccion = () => {
  const {
    vidas, restarVida, sumarMonedas,
    setEnLeccion, completarNivel,
    oracionActual, inventario,
  } = useGame();

  // ── TODOS LOS HOOKS PRIMERO ────────────────────────────────────────────
  const banco = oracionActual?.versos ?? [];

  const tiposPorVerso = useMemo(() => {
    if (!banco.length) return [];
    const tipos = []; let anterior = null;
    for (let i = 0; i < banco.length; i++) {
      const nuevo = elegirTipo(anterior); tipos.push(nuevo); anterior = nuevo;
    }
    return tipos;
  }, [oracionActual?.id]);

  const [paso, setPaso]                   = useState(0);
  const [resultado, setResultado]         = useState(null);
  const [seleccionada, setSeleccionada]   = useState(null);
  const [respuestaOrden, setRespOrden]    = useState('');
  const [escrito, setEscrito]             = useState('');
  const [errores, setErrores]             = useState(0);
  const [monedasAc, setMonedasAc]         = useState(0);
  const [mostrarVictoria, setMostrarVict] = useState(false);
  const [escudoActivo, setEscudoActivo]   = useState(() => inventario.includes('escudo_miguel'));
  const [mostrarEscudo, setMostrarEscudo] = useState(false);
  const [escudosUsados, setEscudosUsados] = useState(0);

  // ── Early return DESPUÉS de hooks ─────────────────────────────────────
  if (!oracionActual?.versos?.length) {
    setEnLeccion(false);
    return null;
  }

  const verso    = banco[paso];
  const tipo     = tiposPorVerso[paso];
  const progreso = ((paso + 1) / banco.length) * 100;
  const esPerfecta = errores === 0;
  const tipoCofre  = esPerfecta ? 'oro' : 'madera';

  // ── Validar ────────────────────────────────────────────────────────────
  const validar = () => {
    let correcto = false;
    if (tipo === 'seleccion') correcto = seleccionada === verso.palabraFaltante;
    if (tipo === 'ordenar')   correcto = normalizar(respuestaOrden) === normalizar(verso.palabrasOrdenar.join(' '));
    if (tipo === 'escritura') correcto = normalizar(escrito) === normalizar(verso.palabraFaltante);

    if (correcto) {
      setResultado('acierto');
      const xp = tipo === 'escritura' ? 40 : tipo === 'ordenar' ? 35 : 25;
      sumarMonedas(xp); setMonedasAc(prev => prev + xp);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.75 }, colors: ['#facc15', '#fff', '#3b82f6'] });
    } else {
      if (escudoActivo) {
        setEscudoActivo(false); setEscudosUsados(p => p + 1);
        setMostrarEscudo(true); setResultado('escudo');
      } else {
        setResultado('error'); setErrores(prev => prev + 1); restarVida();
      }
    }
  };

  // ── Siguiente ──────────────────────────────────────────────────────────
  const siguiente = () => {
    if (paso < banco.length - 1) {
      setPaso(p => p + 1); setResultado(null);
      setSeleccionada(null); setRespOrden(''); setEscrito('');
    } else {
      // Terminó la lección → llamar a completarNivel (esto crea cofrePendiente)
      completarNivel(esPerfecta);
      setMostrarVict(true);
    }
  };

  // ── Volver al mapa desde victoria ──────────────────────────────────────
  const volverAlMapa = () => {
    setEnLeccion(false);
  };

  // ── Pantalla de victoria ───────────────────────────────────────────────
  if (mostrarVictoria) {
    return (
      <PantallaVictoria
        oracion={oracionActual}
        monedasGanadas={monedasAc}
        errores={errores}
        totalVersos={banco.length}
        escudosUsados={escudosUsados}
        tipoCofre={tipoCofre}
        onVolverMapa={volverAlMapa}
      />
    );
  }

  const puedeComprobar =
    !resultado && (
      tipo === 'seleccion' ? !!seleccionada :
      tipo === 'ordenar'   ? respuestaOrden.trim().split(' ').length === verso.palabrasOrdenar.length :
                             escrito.trim().length > 0
    );

  const tipoLabel = { seleccion: '🔤 Completar', ordenar: '🔀 Ordenar', escritura: '✍️ Escribir' }[tipo];
  const monedaXP  = { seleccion: '+25', ordenar: '+35', escritura: '+40' }[tipo];

  return (
    <div className="min-h-screen bg-[#050b14] text-white font-sans flex flex-col relative overflow-hidden">

      {mostrarEscudo && (
        <AnimacionEscudo onFin={() => { setMostrarEscudo(false); setResultado('escudo_visto'); }} />
      )}

      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="p-5 flex items-center gap-4 max-w-2xl mx-auto w-full">
        <button onClick={() => setEnLeccion(false)}
          className="text-white/30 hover:text-white/60 transition-colors text-xl font-black p-1">✕</button>
        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700"
            style={{ width: `${progreso}%` }} />
        </div>
        <div className="flex items-center gap-2">
          {escudoActivo && (
            <div className="bg-yellow-400/10 border border-yellow-400/30 px-2 py-1.5 rounded-xl flex items-center gap-1">
              <span className="text-sm">🛡️</span>
            </div>
          )}
          <div className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
            <span className="text-red-400 animate-pulse">❤️</span>
            <span className="font-black text-sm">{vidas}</span>
          </div>
        </div>
      </header>

      {/* Chips */}
      <div className="flex items-center justify-between px-5 max-w-2xl mx-auto w-full mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{oracionActual.icono}</span>
          <span className="text-[9px] font-black text-yellow-400 uppercase tracking-[0.3em]">{oracionActual.nombre}</span>
        </div>
        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border
          ${tipo === 'seleccion' ? 'text-blue-300 border-blue-500/30 bg-blue-500/10'
          : tipo === 'ordenar'   ? 'text-yellow-300 border-yellow-500/30 bg-yellow-500/10'
          :                        'text-purple-300 border-purple-500/30 bg-purple-500/10'}`}>{tipoLabel}</span>
      </div>

      {/* Ejercicio */}
      <main className="flex-1 flex flex-col justify-center px-5 max-w-2xl mx-auto w-full">
        <div className="relative">
          <div className="absolute -top-12 right-2 text-5xl pointer-events-none select-none animate-bounce">😇</div>
          {tipo === 'seleccion' && (
            <EjercicioSeleccion verso={verso}
              resultado={resultado === 'escudo' || resultado === 'escudo_visto' ? 'error' : resultado}
              seleccionada={seleccionada} onSeleccionar={setSeleccionada} />
          )}
          {tipo === 'ordenar' && (
            <EjercicioOrdenar verso={verso}
              resultado={resultado === 'escudo' || resultado === 'escudo_visto' ? 'error' : resultado}
              respuestaOrden={respuestaOrden} onRespuesta={setRespOrden} />
          )}
          {tipo === 'escritura' && (
            <EjercicioEscritura verso={verso}
              resultado={resultado === 'escudo' || resultado === 'escudo_visto' ? 'error' : resultado}
              escrito={escrito} onEscribir={setEscrito} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 pb-10 max-w-2xl mx-auto w-full">
        {!resultado || resultado === 'escudo' ? (
          resultado === 'escudo' ? null : (
            <button id="btn-comprobar" onClick={validar} disabled={!puedeComprobar}
              className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all duration-300
                ${puedeComprobar
                  ? 'bg-white text-black shadow-xl hover:scale-[1.02] active:scale-95'
                  : 'bg-white/5 text-white/10 cursor-not-allowed'}`}>
              Comprobar
            </button>
          )
        ) : (
          <div className={`w-full p-5 rounded-2xl flex items-center justify-between border backdrop-blur-xl animate-slide-up
            ${resultado === 'acierto'      ? 'bg-green-500/20 border-green-500/30'
            : resultado === 'escudo_visto' ? 'bg-yellow-500/20 border-yellow-500/30'
            :                               'bg-red-500/20 border-red-500/30'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-xl
                ${resultado === 'acierto' ? 'bg-green-500' : resultado === 'escudo_visto' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                {resultado === 'acierto' ? '⚡' : resultado === 'escudo_visto' ? '🛡️' : '🔥'}
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-50">
                  {resultado === 'acierto' ? '¡Perfecto!' : resultado === 'escudo_visto' ? '¡Protegido!' : 'Casi…'}
                </p>
                <p className="text-base font-black">
                  {resultado === 'acierto' ? `${monedaXP} Monedas ✨`
                  : resultado === 'escudo_visto' ? 'El escudo absorbió el error'
                  : `Era: "${verso.palabraFaltante}"`}
                </p>
              </div>
            </div>
            <button onClick={siguiente}
              className="bg-white text-black px-8 py-3 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-transform shadow-xl">
              CONTINUAR
            </button>
          </div>
        )}
      </footer>
    </div>
  );
};

export default Leccion;