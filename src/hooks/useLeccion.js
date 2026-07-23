// src/hooks/useLeccion.js
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { mezclar, elegirTipoEjercicio, normalizar } from '../utils/leccionHelpers';

// ── SONIDOS (SOLO UI/UX, NO AFECTA LÓGICA) ────────────────────────────
const playSound = (type) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    switch (type) {
      case 'correct':
        oscillator.frequency.setValueAtTime(523, audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(659, audioCtx.currentTime + 0.1);
        oscillator.frequency.linearRampToValueAtTime(784, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        oscillator.type = 'sine';
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
        break;
        
      case 'wrong':
        oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(300, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        oscillator.type = 'square';
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
        break;
        
      case 'shield':
        const notes = [523, 659, 784];
        notes.forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.1, audioCtx.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.1 + 0.2);
          osc.type = 'sine';
          osc.start(audioCtx.currentTime + i * 0.1);
          osc.stop(audioCtx.currentTime + i * 0.1 + 0.2);
        });
        break;
        
      case 'coin':
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        oscillator.type = 'sine';
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
        break;
        
      default:
        break;
    }
    audioCtx.resume();
  } catch (e) {}
};

// ── VIBRACIÓN (SOLO UI/UX) ─────────────────────────────────────────────
const vibrate = (pattern) => {
  try {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(pattern);
    }
  } catch (e) {}
};

export const useLeccion = ({
  oracionActual,
  setEnLeccion,
  completarNivel,
  sumarMonedas,
  restarVida,
  consumirItem,
  inventario,
  nivelesCompletados,
  vidas,
}) => {
  // ── ESTADOS (SIN CAMBIOS) ──────────────────────────────────────────────
  const [paso, setPaso] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [seleccionada, setSeleccionada] = useState(null);
  const [respuestaOrden, setRespOrden] = useState('');
  const [escrito, setEscrito] = useState('');
  const [errores, setErrores] = useState(0);
  const [monedasAc, setMonedasAc] = useState(0);
  
  const escudoActivoRef = useRef(inventario.includes('escudo_miguel'));
  const [escudoActivo, setEscudoActivo] = useState(inventario.includes('escudo_miguel'));
  
  const [mostrarEscudo, setMostrarEscudo] = useState(false);
  const [escudosUsados, setEscudosUsados] = useState(0);
  const [usandoPocion, setUsandoPocion] = useState(false);
  const [opcionesFiltradas, setOpcionesFiltradas] = useState(null);
  const [mensajeFlotante, setMensajeFlotante] = useState(null);
  
  const procesandoRef = useRef(false);
  const [procesando, setProcesando] = useState(false);
  const vidaRestadaRef = useRef(false);

  const banco = oracionActual?.versos || [];
  const nivelId = oracionActual?.id;
  const yaCompletadoAntes = nivelesCompletados?.includes(nivelId) || false;
  const factorMonedas = yaCompletadoAntes ? 0.1 : 1;
  const tienePocion = inventario.includes('pocion_sabiduria');

  // ✅ Sincronizar escudo (SIN CAMBIOS)
  useEffect(() => {
    const tieneEscudo = inventario.includes('escudo_miguel');
    if (escudoActivoRef.current !== tieneEscudo) {
      escudoActivoRef.current = tieneEscudo;
      setEscudoActivo(tieneEscudo);
    }
  }, [inventario]);

  // ── TIPOS DE EJERCICIO (SIN CAMBIOS) ──────────────────────────────────
  const tiposPorVerso = useMemo(() => {
    if (!banco.length) return [];
    const tipos = [];
    let anterior = null;
    for (let i = 0; i < banco.length; i++) {
      const nuevo = elegirTipoEjercicio(anterior);
      tipos.push(nuevo);
      anterior = nuevo;
    }
    return tipos;
  }, [oracionActual?.id]);

  // ── RESETEO AL CAMBIAR VERSO (SIN CAMBIOS) ──────────────────────────
  useEffect(() => {
    setResultado(null);
    setSeleccionada(null);
    setRespOrden('');
    setEscrito('');
    setUsandoPocion(false);
    setOpcionesFiltradas(null);
    vidaRestadaRef.current = false;
  }, [paso]);

  // ── HANDLER PRINCIPAL (SOLO AÑADIDOS SONIDOS Y VIBRACIONES) ──────────
  const handleValidar = useCallback(async () => {
    if (procesandoRef.current) {
      console.warn('⚠️ handleValidar: ya está en proceso');
      return;
    }
    
    procesandoRef.current = true;
    setProcesando(true);
    
    try {
      const verso = banco[paso];
      const tipo = tiposPorVerso[paso];
      let correcto = false;

      if (tipo === 'seleccion') correcto = seleccionada === verso.palabraFaltante;
      if (tipo === 'ordenar') correcto = normalizar(respuestaOrden) === normalizar(verso.palabrasOrdenar.join(' '));
      if (tipo === 'escritura') correcto = normalizar(escrito) === normalizar(verso.palabraFaltante);

      if (correcto) {
        // ✅ ACIERTO - Sonido y vibración (SOLO UI/UX)
        playSound('correct');
        vibrate([20, 30, 20]);
        
        setResultado('acierto');
        const baseXp = tipo === 'escritura' ? 40 : tipo === 'ordenar' ? 35 : 25;
        const xp = Math.floor(baseXp * factorMonedas);
        await sumarMonedas(xp);
        setMonedasAc(prev => prev + xp);
        setMensajeFlotante({ message: `+${xp} 🪙`, icon: '✨' });

        import('canvas-confetti').then(({ default: confetti }) => {
          confetti({ 
            particleCount: 80, 
            spread: 60, 
            origin: { y: 0.7 }, 
            colors: ['#facc15', '#fff', '#3b82f6', '#10b981'] 
          });
        });

      } else {
        // ❌ ERROR
        const tieneEscudo = escudoActivoRef.current;
        
        if (tieneEscudo) {
          // ✅ Escudo activo - Sonido de protección (SOLO UI/UX)
          playSound('shield');
          vibrate([30, 50, 30]);
          
          let consumido = false;
          if (consumirItem) {
            consumido = await consumirItem('escudo_miguel');
          }
          
          if (consumido) {
            escudoActivoRef.current = false;
            setEscudoActivo(false);
            setEscudosUsados(prev => prev + 1);
            setMostrarEscudo(true);
            setResultado('escudo');
            setMensajeFlotante({ message: '🛡️ Escudo te protegió', icon: '🛡️' });
          } else {
            escudoActivoRef.current = false;
            setEscudoActivo(false);
            setResultado('error');
            setErrores(prev => prev + 1);
            setMensajeFlotante({ message: '⚠️ Error con el escudo', icon: '⚠️' });
          }
          
        } else {
          // ❌ Sin escudo - Sonido de error y vibración (SOLO UI/UX)
          playSound('wrong');
          vibrate([50, 30, 50]);
          
          if (!vidaRestadaRef.current) {
            vidaRestadaRef.current = true;
            setResultado('error');
            setErrores(prev => prev + 1);
            await restarVida();
            setMensajeFlotante({ message: '❤️ -1 vida', icon: '❤️' });
          } else {
            setResultado('error');
            setMensajeFlotante({ message: '⚠️ Error', icon: '⚠️' });
          }
        }
      }
    } catch (error) {
      console.error('❌ Error en handleValidar:', error);
    } finally {
      procesandoRef.current = false;
      setProcesando(false);
    }
  }, [paso, banco, tiposPorVerso, seleccionada, respuestaOrden, escrito, consumirItem, restarVida, sumarMonedas, factorMonedas]);

  const handleSiguiente = useCallback(() => {
    if (paso < banco.length - 1) {
      // ✅ Sonido de avance (SOLO UI/UX)
      playSound('coin');
      vibrate([10]);
      setPaso(p => p + 1);
    } else {
      const esPerfecta = errores === 0;
      const esPrimeraVez = !yaCompletadoAntes;
      completarNivel(esPerfecta, esPrimeraVez);
      setPaso(banco.length);
    }
  }, [paso, banco.length, errores, yaCompletadoAntes, completarNivel]);

  const handleUsarPocion = useCallback(async () => {
    const tipo = tiposPorVerso[paso];
    if (!tienePocion || tipo !== 'seleccion' || usandoPocion) return;
    const verso = banco[paso];
    const opcionesOrig = [...verso.opcionesSeleccion];
    const correcta = verso.palabraFaltante;
    const incorrectas = opcionesOrig.filter(op => op !== correcta);
    let nuevasIncorrectas = [...incorrectas];
    if (nuevasIncorrectas.length >= 2) nuevasIncorrectas = nuevasIncorrectas.slice(0, -2);
    else nuevasIncorrectas = nuevasIncorrectas.slice(0, -1);
    const nuevasOpciones = [correcta, ...nuevasIncorrectas];
    setOpcionesFiltradas(mezclar(nuevasOpciones));
    setUsandoPocion(true);
    if (consumirItem) await consumirItem('pocion_sabiduria');
    
    // ✅ Sonido al usar poción (SOLO UI/UX)
    playSound('coin');
    vibrate([20, 20]);
  }, [paso, banco, tiposPorVerso, usandoPocion, tienePocion, consumirItem]);

  const handleCerrarMensajeFlotante = useCallback(() => {
    setMensajeFlotante(null);
  }, []);

  // ── DATOS DEL VERSO ACTUAL (SIN CAMBIOS) ──────────────────────────────
  const verso = banco[paso] || null;
  const tipo = tiposPorVerso[paso] || null;
  const progreso = banco.length > 0 ? ((paso + 1) / banco.length) * 100 : 0;
  const isComplete = paso >= banco.length;

  return {
    paso,
    resultado,
    seleccionada,
    setSeleccionada,
    respuestaOrden,
    setRespOrden,
    escrito,
    setEscrito,
    errores,
    monedasAc,
    escudoActivo,
    mostrarEscudo,
    setMostrarEscudo,
    escudosUsados,
    usandoPocion,
    opcionesFiltradas,
    mensajeFlotante,
    handleCerrarMensajeFlotante,
    verso,
    tipo,
    progreso,
    isComplete,
    tienePocion,
    yaCompletadoAntes,
    factorMonedas,
    banco,
    procesando,
    handleValidar,
    handleSiguiente,
    handleUsarPocion,
  };
};

export default useLeccion;