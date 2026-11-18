// src/hooks/useLeccion.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { mezclar, elegirTipoEjercicio, normalizar } from '../utils/leccionHelpers';
const BANCO_VACIO = [];

// ── SONIDOS (SOLO UI/UX, NO AFECTA LÓGICA) ────────────────────────────
const playSound = type => {
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    const contexto = new Audio();
    const notas = { correct: [523, 659, 784], wrong: [330, 294], shield: [523, 659, 784], coin: [880, 1047] }[type] ?? [659];
    notas.forEach((frecuencia, i) => {
      const oscilador = contexto.createOscillator();
      const volumen = contexto.createGain();
      oscilador.connect(volumen); volumen.connect(contexto.destination);
      oscilador.type = 'sine'; oscilador.frequency.value = frecuencia;
      const inicio = contexto.currentTime + i * 0.08;
      volumen.gain.setValueAtTime(0.06, inicio);
      volumen.gain.exponentialRampToValueAtTime(0.001, inicio + 0.16);
      if (i === notas.length - 1) oscilador.onended = () => { void contexto.close().catch(() => {}); };
      oscilador.start(inicio); oscilador.stop(inicio + 0.18);
    });
    void contexto.resume().catch(() => {});
  } catch { /* El ejercicio sigue funcionando si el dispositivo no permite audio. */ }
};

// ── VIBRACIÓN (SOLO UI/UX) ─────────────────────────────────────────────
const vibrate = (pattern) => {
  try {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.navigator?.vibrate) {
      window.navigator.vibrate(pattern);
    }
  } catch { /* Vibración opcional. */ }
};

export const useLeccion = ({
  oracionActual,
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
  const [ultimaGanancia, setUltimaGanancia] = useState(0);
  
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
  const ultimoPasoAvanzadoRef = useRef(null);

  const banco = oracionActual?.versos || BANCO_VACIO;
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
  const [tiposPorVerso] = useState(() => {
    if (!banco.length) return [];
    const tipos = [];
    let anterior = null;
    for (let i = 0; i < banco.length; i++) {
      const nuevo = elegirTipoEjercicio(anterior);
      tipos.push(nuevo);
      anterior = nuevo;
    }
    return tipos;
  });

  // ── HANDLER PRINCIPAL (SOLO AÑADIDOS SONIDOS Y VIBRACIONES) ──────────
  const handleValidar = useCallback(async () => {
    if (procesandoRef.current || resultado || vidas <= 0) {
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
        
        const baseXp = tipo === 'escritura' ? 40 : tipo === 'ordenar' ? 35 : 25;
        const xp = await sumarMonedas(Math.floor(baseXp * factorMonedas), 'verso:' + paso);
        playSound('correct');
        vibrate([20, 30, 20]);
        setResultado('acierto');
        setUltimaGanancia(xp);
        setMonedasAc(prev => prev + xp);
        setMensajeFlotante({ message: `+${xp} 🪙`, icon: '✨' });

        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) import('canvas-confetti').then(({ default: confetti }) => {
          confetti({ 
            particleCount: 30,
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
            await restarVida();
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
            await restarVida();
            vidaRestadaRef.current = true;
            setResultado('error');
            setErrores(prev => prev + 1);
            setMensajeFlotante({ message: '❤️ -1 vida', icon: '❤️' });
          } else {
            setResultado('error');
            setMensajeFlotante({ message: '⚠️ Error', icon: '⚠️' });
          }
        }
      }
    } catch (error) {
      console.error('❌ Error en handleValidar:', error);
      setMensajeFlotante({ message: 'No se guardó la respuesta. Revisa tu conexión y vuelve a comprobar.', icon: '⚠️' });
    } finally {
      procesandoRef.current = false;
      setProcesando(false);
    }
  }, [paso, banco, tiposPorVerso, seleccionada, respuestaOrden, escrito, consumirItem, restarVida, sumarMonedas, factorMonedas, resultado, vidas]);

  const handleSiguiente = useCallback(async () => {
    if (procesandoRef.current || !resultado) return;
    if (paso < banco.length - 1) {
      if (ultimoPasoAvanzadoRef.current === paso) return;
      ultimoPasoAvanzadoRef.current = paso;
      // ✅ Sonido de avance (SOLO UI/UX)
      playSound('coin');
      vibrate([10]);
      setResultado(null); setSeleccionada(null); setRespOrden(''); setEscrito('');
      setUsandoPocion(false); setOpcionesFiltradas(null); vidaRestadaRef.current = false;
      setPaso(p => p + 1);
    } else {
      procesandoRef.current = true;
      setProcesando(true);
      try {
        await completarNivel(errores === 0);
        setPaso(banco.length);
      } catch (error) {
        console.error('Error guardando la lección:', error);
        setMensajeFlotante({ message: 'No pudimos guardar. Revisa tu conexión e intenta continuar de nuevo.', icon: '⚠️' });
      } finally {
        procesandoRef.current = false;
        setProcesando(false);
      }
    }
  }, [paso, banco.length, errores, completarNivel, resultado]);

  const handleUsarPocion = useCallback(async () => {
    const tipo = tiposPorVerso[paso];
    if (!tienePocion || tipo !== 'seleccion' || usandoPocion || procesandoRef.current) return;
    procesandoRef.current = true;
    setProcesando(true);
    try {
      if (!await consumirItem('pocion_sabiduria')) throw new Error('No quedan pociones.');
      const verso = banco[paso];
      const opcionesOrig = [...verso.opcionesSeleccion];
      const correcta = verso.palabraFaltante;
      const incorrectas = opcionesOrig.filter(op => op !== correcta);
      let nuevasIncorrectas = [...incorrectas];
      if (nuevasIncorrectas.length >= 2) nuevasIncorrectas = nuevasIncorrectas.slice(0, -2);
      else nuevasIncorrectas = nuevasIncorrectas.slice(0, -1);
      const nuevasOpciones = [correcta, ...nuevasIncorrectas];
      setOpcionesFiltradas(mezclar(nuevasOpciones));
      setSeleccionada(null);
      setUsandoPocion(true);

      // ✅ Sonido al usar poción (SOLO UI/UX)
      playSound('coin');
      vibrate([20, 20]);
    } catch (error) {
      setMensajeFlotante({ message: error.message || 'No se pudo usar la poción.', icon: '⚠️' });
    } finally {
      procesandoRef.current = false;
      setProcesando(false);
    }
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
    ultimaGanancia,
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
