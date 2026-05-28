import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  doc, onSnapshot, updateDoc, increment,
  setDoc, collection, query, where, getDocs, orderBy,
  arrayUnion,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged,
} from 'firebase/auth';
import santosData from '../data/santos.json';
import titulosData from '../data/titulos.json';

const GameContext = createContext();

const MAX_VIDAS     = 5;
const MS_REGEN_VIDA = 4 * 60 * 60 * 1000;

// ── Misiones diarias y semanales ──
export const MISIONES_DIARIAS = [
  { id: 'd1', icono: '📖', titulo: 'Estudiante Fiel',   descripcion: 'Completa 3 lecciones hoy',       tipo: 'lecciones', meta: 3,   recompensa: 50  },
  { id: 'd2', icono: '🪙', titulo: 'Coleccionista',     descripcion: 'Gana 100 monedas en un día',      tipo: 'monedas',   meta: 100, recompensa: 30  },
  { id: 'd3', icono: '⚡', titulo: 'Relámpago de Fe',   descripcion: 'Completa 1 lección sin errores',  tipo: 'perfectas', meta: 1,   recompensa: 40  },
  { id: 'd4', icono: '🔥', titulo: 'Guardián de Racha', descripcion: 'Mantén tu racha activa hoy',      tipo: 'racha',     meta: 1,   recompensa: 25  },
];

export const MISIONES_SEMANALES = [
  { id: 's1', icono: '🏆', titulo: 'Campeón Semanal',    descripcion: 'Completa 15 lecciones esta semana', tipo: 'lecciones', meta: 15,  recompensa: 200 },
  { id: 's2', icono: '📿', titulo: 'Devoto del Rosario', descripcion: 'Completa 5 niveles distintos',      tipo: 'niveles',   meta: 5,   recompensa: 150 },
  { id: 's3', icono: '💰', titulo: 'Tesorero',            descripcion: 'Acumula 500 monedas esta semana',  tipo: 'monedas',   meta: 500, recompensa: 100 },
  { id: 's4', icono: '🌟', titulo: 'Luz de la Semana',   descripcion: 'Juega 5 días seguidos',             tipo: 'racha',     meta: 5,   recompensa: 300 },
];

const hoyStr    = () => new Date().toISOString().split('T')[0];
const semanaStr = () => {
  const d = new Date(); const dia = d.getDay() || 7;
  d.setDate(d.getDate() - dia + 1); return d.toISOString().split('T')[0];
};
const initProgreso = (m) => Object.fromEntries(m.map(x => [x.id, { progreso: 0, reclamada: false }]));

// ── Helper para sortear santo según rareza del cofre ──
const obtenerSantoPorRareza = (tipoCofre) => {
  let prob = { comun: 0, raro: 0, legendario: 0 };
  switch (tipoCofre) {
    case 'madera':
      prob = { comun: 0.85, raro: 0.15, legendario: 0 };
      break;
    case 'plata':
      prob = { comun: 0.4, raro: 0.5, legendario: 0.1 };
      break;
    case 'oro':
      prob = { comun: 0.2, raro: 0.5, legendario: 0.3 };
      break;
    default:
      prob = { comun: 0.7, raro: 0.3, legendario: 0 };
  }
  const rand = Math.random();
  let rarezaElegida = 'comun';
  if (rand < prob.legendario) rarezaElegida = 'legendario';
  else if (rand < prob.legendario + prob.raro) rarezaElegida = 'raro';
  
  const posibles = santosData.santos.filter(s => s.rareza === rarezaElegida);
  if (posibles.length === 0) return null;
  const idx = Math.floor(Math.random() * posibles.length);
  return posibles[idx];
};

export const GameProvider = ({ children }) => {
  const [userDoc, setUserDoc]       = useState(null);
  const [usuarioId, setUsuarioId]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [vidasMostradas, setVidasM] = useState(MAX_VIDAS);

  const [activeTab, setActiveTab]         = useState('mapa');
  const [enLeccion, setEnLeccion]         = useState(false);
  const [oracionActual, setOracionActual] = useState(null);
  const [misionesState, setMisionesState] = useState(null);
  const [cofrePendiente, setCofrePendiente] = useState(null);
  const [coleccion, setColeccion]         = useState([]);
  const [logrosPendientes, setLogrosPendientes] = useState([]); // <-- ESTADO FALTANTE

  // Estados para límites diarios
  const [corazonesCompradosHoy, setCorazonesCompradosHoy] = useState(0);
  const [ultimaFechaCompraCorazon, setUltimaFechaCompraCorazon] = useState(null);
  const [mostrarModalRacha, setMostrarModalRacha] = useState(false);
  const [recompensaRacha, setRecompensaRacha] = useState(null);
  const [cofresMaderaCompradosHoy, setCofresMaderaCompradosHoy] = useState(0);
  const [cofresPlataCompradosHoy, setCofresPlataCompradosHoy] = useState(0);
  const [cofresOroCompradosHoy, setCofresOroCompradosHoy] = useState(0);
  const [ultimaFechaCofreMadera, setUltimaFechaCofreMadera] = useState(null);
  const [ultimaFechaCofrePlata, setUltimaFechaCofrePlata] = useState(null);
  const [ultimaFechaCofreOro, setUltimaFechaCofreOro] = useState(null);
  const [pocionesCompradasHoy, setPocionesCompradasHoy] = useState(0);
  const [ultimaFechaPocion, setUltimaFechaPocion] = useState(null);
  const [ultimoTiqueteOroUsado, setUltimoTiqueteOroUsado] = useState(null);
  const [tituloDesbloqueadoReciente, setTituloDesbloqueadoReciente] = useState({ mostrar: false, titulo: null });

  // ── Sincronización con Firebase ──
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuarioId(user.uid);
        const unsubDoc = onSnapshot(doc(db, 'usuarios', user.uid), (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (!data.avatar) data.avatar = '😇';
            setUserDoc(data);
            setColeccion(data.coleccion ?? []);
            setLogrosPendientes(data.logrosPendientes ?? []);
            // Límites diarios
            setCorazonesCompradosHoy(data.corazonComprasHoy ?? 0);
            setUltimaFechaCompraCorazon(data.ultimaCompraCorazon ?? null);
            setCofresMaderaCompradosHoy(data.cofresMaderaHoy ?? 0);
            setCofresPlataCompradosHoy(data.cofresPlataHoy ?? 0);
            setCofresOroCompradosHoy(data.cofresOroHoy ?? 0);
            setUltimaFechaCofreMadera(data.ultimaFechaCofreMadera ?? null);
            setUltimaFechaCofrePlata(data.ultimaFechaCofrePlata ?? null);
            setUltimaFechaCofreOro(data.ultimaFechaCofreOro ?? null);
            setPocionesCompradasHoy(data.pocionesHoy ?? 0);
            setUltimaFechaPocion(data.ultimaFechaPocion ?? null);
            setUltimoTiqueteOroUsado(data.ultimoTiqueteOroUsado ?? null);
            _sincronizarMisiones(user.uid, data);
            _aplicarRegenVidas(user.uid, data);
            _verificarRacha(user.uid, data);
          } else {
            console.warn('Documento de usuario no encontrado');
          }
          setLoading(false);
        });
        return () => unsubDoc();
      } else {
        setUsuarioId(null);
        setUserDoc(null);
        setMisionesState(null);
        setLoading(false);
        setColeccion([]);
        setLogrosPendientes([]);
        setCorazonesCompradosHoy(0);
        setUltimaFechaCompraCorazon(null);
        setMostrarModalRacha(false);
        setRecompensaRacha(null);
        setCofresMaderaCompradosHoy(0);
        setCofresPlataCompradosHoy(0);
        setCofresOroCompradosHoy(0);
        setUltimaFechaCofreMadera(null);
        setUltimaFechaCofrePlata(null);
        setUltimaFechaCofreOro(null);
        setPocionesCompradasHoy(0);
        setUltimaFechaPocion(null);
        setUltimoTiqueteOroUsado(null);
      }
    });
    return () => unsubAuth();
  }, []);

  // ── Regen de vidas ──
  const _aplicarRegenVidas = async (uid, data) => {
    const vp = data.vidasPerdidas ?? [];
    if (!vp.length) { setVidasM(MAX_VIDAS); return; }
    const ahora  = Date.now();
    const nuevas = vp.filter(ts => ahora - ts < MS_REGEN_VIDA);
    if (nuevas.length !== vp.length) await updateDoc(doc(db, 'usuarios', uid), { vidasPerdidas: nuevas });
    setVidasM(Math.min(MAX_VIDAS, MAX_VIDAS - nuevas.length));
  };

  useEffect(() => {
    if (!usuarioId || !userDoc || !(userDoc.vidasPerdidas?.length)) return;
    const t = setInterval(() => _aplicarRegenVidas(usuarioId, userDoc), 60000);
    return () => clearInterval(t);
  }, [usuarioId, userDoc?.vidasPerdidas?.length]);

  // ── Racha ──
  const _verificarRacha = async (uid, data) => {
    const hoy = hoyStr(); if (data.jugóHoy === hoy) return;
    const ayer = new Date(); ayer.setDate(ayer.getDate() - 1);
    const ayerStr = ayer.toISOString().split('T')[0];
    const seguro  = (data.inventario ?? []).includes('seguro_racha');
    if (data.jugóHoy !== ayerStr && data.jugóHoy !== null) {
      if (!seguro) await updateDoc(doc(db, 'usuarios', uid), { racha: 0 });
      else await updateDoc(doc(db, 'usuarios', uid), { inventario: (data.inventario ?? []).filter(i => i !== 'seguro_racha') });
    }
  };

  // ── Misiones ──
  const _sincronizarMisiones = async (uid, data) => {
    const hoy = hoyStr(); const semana = semanaStr();
    const mis = data.misiones ?? {}; let ok = false; const nuevo = { ...mis };
    if (!mis.diaActual) {
      nuevo.diaActual = hoy; nuevo.semanaActual = semana;
      nuevo.diarias = initProgreso(MISIONES_DIARIAS); nuevo.semanales = initProgreso(MISIONES_SEMANALES); ok = true;
    } else {
      if (mis.diaActual !== hoy)       { nuevo.diaActual = hoy;       nuevo.diarias   = initProgreso(MISIONES_DIARIAS);   ok = true; }
      if (mis.semanaActual !== semana) { nuevo.semanaActual = semana; nuevo.semanales = initProgreso(MISIONES_SEMANALES); ok = true; }
    }
    if (ok) await updateDoc(doc(db, 'usuarios', uid), { misiones: nuevo });
    setMisionesState(ok ? nuevo : mis);
  };

  const _avanzarMision = async (tipo, cantidad = 1) => {
    if (!usuarioId || !misionesState) return;
    const nuevo = JSON.parse(JSON.stringify(misionesState)); let bonus = 0;
    const act = (g, defs) => defs.forEach(def => {
      const p = nuevo[g]?.[def.id];
      if (!p || p.reclamada || def.tipo !== tipo) return;
      p.progreso = Math.min(p.progreso + cantidad, def.meta);
      if (p.progreso >= def.meta && !p.reclamada) { p.reclamada = true; bonus += def.recompensa; }
    });
    act('diarias', MISIONES_DIARIAS); act('semanales', MISIONES_SEMANALES);
    setMisionesState(nuevo);
    await updateDoc(doc(db, 'usuarios', usuarioId), { misiones: nuevo });
    if (bonus > 0) await updateDoc(doc(db, 'usuarios', usuarioId), { monedas: increment(bonus) });
  };

  const reclamarMision = async (g, id, recompensa) => {
    if (!usuarioId || !misionesState) return false;
    const prog = misionesState[g]?.[id]; if (!prog || prog.reclamada) return false;
    const nuevo = JSON.parse(JSON.stringify(misionesState)); nuevo[g][id].reclamada = true;
    setMisionesState(nuevo);
    await updateDoc(doc(db, 'usuarios', usuarioId), { misiones: nuevo });
    await updateDoc(doc(db, 'usuarios', usuarioId), { monedas: increment(recompensa) });
    return true;
  };

  // ── Autenticación y registro ──
  const _base = (extra = {}) => ({
    vidas: MAX_VIDAS,
    monedas: 100,
    nivelActual: 1,
    rango: 'Iniciado',
    racha: 0,
    rol: 'estudiante',
    fechaRegistro: new Date().toISOString(),
    misiones: {},
    inventario: [],
    vidasPerdidas: [],
    jugóHoy: null,
    examenesAprobados: [],
    cofresAbiertos: 0,
    coleccion: [],
    avatar: '😇',
    corazonComprasHoy: 0,
    ultimaCompraCorazon: null,
    cofresMaderaHoy: 0,
    cofresPlataHoy: 0,
    cofresOroHoy: 0,
    ultimaFechaCofreMadera: null,
    ultimaFechaCofrePlata: null,
    ultimaFechaCofreOro: null,
    pocionesHoy: 0,
    ultimaFechaPocion: null,
    ultimoTiqueteOroUsado: null,
    ultimaPrimeraLeccion: null,
    titulosDesbloqueados: [],
    tituloEquipado: null,
    marcosDesbloqueados: [],
    marcoEquipado: null,
    nivelesCompletados: [],
    logrosPendientes: [],
    ...extra,
  });

  const registrarNiño = async (email, password, nombre, grupo) => {
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'usuarios', user.uid), { ..._base(), nombre: nombre.toUpperCase(), grupo, uid: user.uid });
    } catch (e) { throw e; } finally { setLoading(false); }
  };

  const registrarCatequista = async (email, password, nombre, grupo) => {
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'usuarios', user.uid), {
        ..._base({ vidas: 99, monedas: 0, nivelActual: 0, rango: 'Catequista', rol: 'catequista' }),
        nombre: nombre.toUpperCase(), grupo, uid: user.uid,
      });
    } catch (e) { throw e; } finally { setLoading(false); }
  };

  const iniciarSesion = async (email, password) => {
    setLoading(true);
    try { await signInWithEmailAndPassword(auth, email, password); }
    catch (e) { throw e; } finally { setLoading(false); }
  };

  const cerrarSesion = async () => { try { await signOut(auth); } catch (e) { console.error(e); } };

  // ── Funciones de consumición de items ──
  const consumirItem = async (itemId) => {
    if (!usuarioId) return false;
    const nuevoInventario = (userDoc?.inventario || []).filter(id => id !== itemId);
    await updateDoc(doc(db, 'usuarios', usuarioId), { inventario: nuevoInventario });
    setUserDoc(prev => ({ ...prev, inventario: nuevoInventario }));
    return true;
  };

  // ── Juego: vidas, monedas ──
  const restarVida = async () => {
    if (!usuarioId || vidasMostradas <= 0) return;
    await updateDoc(doc(db, 'usuarios', usuarioId), { vidasPerdidas: [...(userDoc?.vidasPerdidas ?? []), Date.now()] });
    setVidasM(p => Math.max(0, p - 1));
  };

  const añadirVida = async () => {
    if (!usuarioId) return;
    const vp = userDoc?.vidasPerdidas ?? []; if (!vp.length) return;
    await updateDoc(doc(db, 'usuarios', usuarioId), { vidasPerdidas: [...vp].sort((a,b)=>a-b).slice(1) });
    setVidasM(p => Math.min(MAX_VIDAS, p + 1));
  };

  const sumarMonedas = async (cantidad) => {
    if (!usuarioId) return;
    await updateDoc(doc(db, 'usuarios', usuarioId), { monedas: increment(Number(cantidad)) });
    if (cantidad > 0) await _avanzarMision('monedas', Number(cantidad));
  };

  // ── Compra de corazón ──
  const comprarCorazon = async () => {
    if (!usuarioId) return false;
    const hoy = hoyStr();
    if (ultimaFechaCompraCorazon !== hoy) {
      setCorazonesCompradosHoy(0);
      setUltimaFechaCompraCorazon(hoy);
    }
    if (corazonesCompradosHoy >= 3) return false;
    if (vidasMostradas >= MAX_VIDAS) return false;
    if ((userDoc?.monedas ?? 0) < 200) return false;
    await sumarMonedas(-200);
    await añadirVida();
    setCorazonesCompradosHoy(prev => prev + 1);
    await updateDoc(doc(db, 'usuarios', usuarioId), {
      corazonComprasHoy: increment(1),
      ultimaCompraCorazon: hoy,
    });
    return true;
  };

  // ── Compra de cofres ──
  const comprarCofreMadera = async () => {
    if (!usuarioId) return false;
    const hoy = hoyStr();
    if (ultimaFechaCofreMadera !== hoy) {
      setCofresMaderaCompradosHoy(0);
      setUltimaFechaCofreMadera(hoy);
    }
    if (cofresMaderaCompradosHoy >= 3) return false;
    if ((userDoc?.monedas ?? 0) < 250) return false;
    await sumarMonedas(-250);
    const santo = obtenerSantoPorRareza('madera');
    if (!santo) return false;
    const yaTiene = coleccion.includes(santo.id);
    if (yaTiene) {
      let compensacion = 50;
      if (santo.rareza === 'raro') compensacion = 100;
      else if (santo.rareza === 'legendario') compensacion = 200;
      await updateDoc(doc(db, 'usuarios', usuarioId), { monedas: increment(compensacion), cofresAbiertos: increment(1) });
      setCofrePendiente({ tipo: 'madera', recompensa: { tipo: 'repetido', santo, compensacion } });
    } else {
      await updateDoc(doc(db, 'usuarios', usuarioId), { coleccion: arrayUnion(santo.id), cofresAbiertos: increment(1) });
      setColeccion(prev => [...prev, santo.id]);
      setCofrePendiente({ tipo: 'madera', recompensa: { tipo: 'nuevo', santo } });
    }
    setCofresMaderaCompradosHoy(prev => prev + 1);
    await updateDoc(doc(db, 'usuarios', usuarioId), { cofresMaderaHoy: increment(1), ultimaFechaCofreMadera: hoy });
    return true;
  };

  const comprarCofrePlata = async () => {
    if (!usuarioId) return false;
    const hoy = hoyStr();
    if (ultimaFechaCofrePlata !== hoy) {
      setCofresPlataCompradosHoy(0);
      setUltimaFechaCofrePlata(hoy);
    }
    if (cofresPlataCompradosHoy >= 2) return false;
    if ((userDoc?.monedas ?? 0) < 350) return false;
    await sumarMonedas(-350);
    const santo = obtenerSantoPorRareza('plata');
    if (!santo) return false;
    const yaTiene = coleccion.includes(santo.id);
    if (yaTiene) {
      let compensacion = 100;
      if (santo.rareza === 'legendario') compensacion = 200;
      await updateDoc(doc(db, 'usuarios', usuarioId), { monedas: increment(compensacion), cofresAbiertos: increment(1) });
      setCofrePendiente({ tipo: 'plata', recompensa: { tipo: 'repetido', santo, compensacion } });
    } else {
      await updateDoc(doc(db, 'usuarios', usuarioId), { coleccion: arrayUnion(santo.id), cofresAbiertos: increment(1) });
      setColeccion(prev => [...prev, santo.id]);
      setCofrePendiente({ tipo: 'plata', recompensa: { tipo: 'nuevo', santo } });
    }
    setCofresPlataCompradosHoy(prev => prev + 1);
    await updateDoc(doc(db, 'usuarios', usuarioId), { cofresPlataHoy: increment(1), ultimaFechaCofrePlata: hoy });
    return true;
  };

  const comprarCofreOro = async () => {
    if (!usuarioId) return false;
    const hoy = hoyStr();
    if (ultimaFechaCofreOro !== hoy) {
      setCofresOroCompradosHoy(0);
      setUltimaFechaCofreOro(hoy);
    }
    if (cofresOroCompradosHoy >= 1) return false;
    if ((userDoc?.monedas ?? 0) < 500) return false;
    await sumarMonedas(-500);
    const santo = obtenerSantoPorRareza('oro');
    if (!santo) return false;
    const yaTiene = coleccion.includes(santo.id);
    if (yaTiene) {
      let compensacion = 200;
      await updateDoc(doc(db, 'usuarios', usuarioId), { monedas: increment(compensacion), cofresAbiertos: increment(1) });
      setCofrePendiente({ tipo: 'oro', recompensa: { tipo: 'repetido', santo, compensacion } });
    } else {
      await updateDoc(doc(db, 'usuarios', usuarioId), { coleccion: arrayUnion(santo.id), cofresAbiertos: increment(1) });
      setColeccion(prev => [...prev, santo.id]);
      setCofrePendiente({ tipo: 'oro', recompensa: { tipo: 'nuevo', santo } });
    }
    setCofresOroCompradosHoy(prev => prev + 1);
    await updateDoc(doc(db, 'usuarios', usuarioId), { cofresOroHoy: increment(1), ultimaFechaCofreOro: hoy });
    return true;
  };

  // ── Compra de poción ──
  const comprarPocion = async () => {
    if (!usuarioId) return false;
    const hoy = hoyStr();
    if (ultimaFechaPocion !== hoy) {
      setPocionesCompradasHoy(0);
      setUltimaFechaPocion(hoy);
    }
    if (pocionesCompradasHoy >= 2) return false;
    const cantidadActual = (userDoc?.inventario || []).filter(id => id === 'pocion_sabiduria').length;
    if (cantidadActual >= 3) return false;
    if ((userDoc?.monedas ?? 0) < 150) return false;
    await sumarMonedas(-150);
    await updateDoc(doc(db, 'usuarios', usuarioId), { inventario: arrayUnion('pocion_sabiduria') });
    setUserDoc(prev => ({ ...prev, inventario: [...(prev?.inventario || []), 'pocion_sabiduria'] }));
    setPocionesCompradasHoy(prev => prev + 1);
    await updateDoc(doc(db, 'usuarios', usuarioId), { pocionesHoy: increment(1), ultimaFechaPocion: hoy });
    return true;
  };

  // ── Tiquete de oro ──
  const usarTiqueteOro = async () => {
    if (!usuarioId) return false;
    const tieneTiquete = (userDoc?.inventario || []).includes('tiquete_oro');
    if (!tieneTiquete) return false;
    const hoy = hoyStr();
    if (ultimoTiqueteOroUsado === hoy) return false;
    const nuevoInventario = (userDoc?.inventario || []).filter(id => id !== 'tiquete_oro');
    await updateDoc(doc(db, 'usuarios', usuarioId), { inventario: nuevoInventario });
    setUserDoc(prev => ({ ...prev, inventario: nuevoInventario }));
    const santo = obtenerSantoPorRareza('oro');
    if (!santo) return false;
    const yaTiene = coleccion.includes(santo.id);
    if (yaTiene) {
      let compensacion = 200;
      await updateDoc(doc(db, 'usuarios', usuarioId), { monedas: increment(compensacion), cofresAbiertos: increment(1) });
      setCofrePendiente({ tipo: 'oro', recompensa: { tipo: 'repetido', santo, compensacion } });
    } else {
      await updateDoc(doc(db, 'usuarios', usuarioId), { coleccion: arrayUnion(santo.id), cofresAbiertos: increment(1) });
      setColeccion(prev => [...prev, santo.id]);
      setCofrePendiente({ tipo: 'oro', recompensa: { tipo: 'nuevo', santo } });
    }
    setUltimoTiqueteOroUsado(hoy);
    await updateDoc(doc(db, 'usuarios', usuarioId), { ultimoTiqueteOroUsado: hoy });
    return true;
  };

  const comprarTiqueteOro = async () => {
    if (!usuarioId) return false;
    if ((userDoc?.monedas ?? 0) < 350) return false;
    await sumarMonedas(-350);
    await updateDoc(doc(db, 'usuarios', usuarioId), { inventario: arrayUnion('tiquete_oro') });
    setUserDoc(prev => ({ ...prev, inventario: [...(prev?.inventario || []), 'tiquete_oro'] }));
    return true;
  };

  // ── Primera lección del día ──
  const registrarPrimeraLeccionDelDia = async () => {
    if (!usuarioId) return false;
    const hoy = hoyStr();
    if (userDoc?.ultimaPrimeraLeccion === hoy) return false;
    const rachaActual = userDoc?.racha || 0;
    let recompensa = 50;
    if (rachaActual >= 7) recompensa = 200;
    else if (rachaActual >= 3) recompensa = 100;
    await sumarMonedas(recompensa);
    await updateDoc(doc(db, 'usuarios', usuarioId), { ultimaPrimeraLeccion: hoy });
    setRecompensaRacha({ monedas: recompensa, racha: rachaActual });
    setMostrarModalRacha(true);
    return true;
  };

  // Oferta diaria
  const obtenerOfertaDiaria = () => {
    const hoy = new Date().toISOString().split('T')[0];
    const seed = hoy.split('-').join('');
    const items = [
      { id: 'corazon_extra', nombre: 'Corazón Extra', icono: '❤️', precioOriginal: 200, descuento: 40, precioOferta: 120 },
      { id: 'tiquete_oro', nombre: 'Tiquete de Oro', icono: '🎫', precioOriginal: 350, descuento: 30, precioOferta: 245 },
      { id: 'doble_xp', nombre: 'Doble XP', icono: '⚡', precioOriginal: 150, descuento: 50, precioOferta: 75 },
      { id: 'pocion_sabiduria', nombre: 'Poción de Sabiduría', icono: '🧪', precioOriginal: 150, descuento: 20, precioOferta: 120 },
    ];
    const idx = parseInt(seed.slice(-2)) % items.length;
    return items[idx];
  };

  // ── Sistema de santos y cofres ──
  const entregarSanto = async (tipoCofre) => {
    const santo = obtenerSantoPorRareza(tipoCofre);
    if (!santo) return null;
    const yaTiene = coleccion.includes(santo.id);
    if (yaTiene) {
      let compensacion = 50;
      if (santo.rareza === 'raro') compensacion = 100;
      if (santo.rareza === 'legendario') compensacion = 200;
      await updateDoc(doc(db, 'usuarios', usuarioId), {
        monedas: increment(compensacion),
        cofresAbiertos: increment(1),
      });
      return { tipo: 'repetido', santo, compensacion };
    } else {
      await updateDoc(doc(db, 'usuarios', usuarioId), {
        coleccion: arrayUnion(santo.id),
        cofresAbiertos: increment(1),
      });
      setColeccion(prev => [...prev, santo.id]);
      return { tipo: 'nuevo', santo };
    }
  };

  // ── Funciones de títulos (movidas antes de donde se usan) ──
  const equiparTitulo = async (tituloId) => {
    if (!usuarioId) return false;
    await updateDoc(doc(db, 'usuarios', usuarioId), { tituloEquipado: tituloId });
    setUserDoc(prev => ({ ...prev, tituloEquipado: tituloId }));
    return true;
  };

  const equiparMarco = async (marcoId) => {
    if (!usuarioId) return false;
    await updateDoc(doc(db, 'usuarios', usuarioId), { marcoEquipado: marcoId });
    setUserDoc(prev => ({ ...prev, marcoEquipado: marcoId }));
    return true;
  };

  const desbloquearTitulo = async (tituloId, nombreTitulo, rareza) => {
    if (!usuarioId) return false;
    const titulosActuales = userDoc?.titulosDesbloqueados || [];
    if (titulosActuales.some(t => t.id === tituloId)) return false;
    const nuevoTitulo = { id: tituloId, nombre: nombreTitulo, rareza, fecha: new Date().toISOString() };
    const nuevosTitulos = [...titulosActuales, nuevoTitulo];
    await updateDoc(doc(db, 'usuarios', usuarioId), {
      titulosDesbloqueados: nuevosTitulos,
    });
    setUserDoc(prev => ({ ...prev, titulosDesbloqueados: nuevosTitulos }));
    if (!userDoc?.tituloEquipado) {
      await equiparTitulo(tituloId);
    }
    setTituloDesbloqueadoReciente({ titulo: nuevoTitulo, mostrar: true });
    return true;
  };

  const canjearLogro = async (logroId) => {
    if (!usuarioId) return false;
    const logrosActuales = userDoc?.logrosPendientes || [];
    const logro = logrosActuales.find(l => l.id === logroId);
    if (!logro) return false;
    const tituloInfo = titulosData.porNivel.find(t => t.id === logroId);
    if (!tituloInfo) return false;
    await desbloquearTitulo(tituloInfo.id, tituloInfo.nombre, tituloInfo.rareza);
    const nuevosLogros = logrosActuales.filter(l => l.id !== logroId);
    await updateDoc(doc(db, 'usuarios', usuarioId), { logrosPendientes: nuevosLogros });
    setLogrosPendientes(nuevosLogros);
    setUserDoc(prev => ({ ...prev, logrosPendientes: nuevosLogros }));
    return true;
  };

  const comprarTituloLegendario = async (tituloId, nombreTitulo, rareza, precio) => {
    if (!usuarioId) return false;
    if ((userDoc?.monedas ?? 0) < precio) return false;
    await sumarMonedas(-precio);
    const titulosActuales = userDoc?.titulosDesbloqueados || [];
    if (titulosActuales.some(t => t.id === tituloId)) return false;
    const nuevoTitulo = { id: tituloId, nombre: nombreTitulo, rareza, fecha: new Date().toISOString() };
    const nuevosTitulos = [...titulosActuales, nuevoTitulo];
    await updateDoc(doc(db, 'usuarios', usuarioId), {
      titulosDesbloqueados: nuevosTitulos,
    });
    setUserDoc(prev => ({ ...prev, titulosDesbloqueados: nuevosTitulos, monedas: (prev?.monedas || 0) - precio }));
    setTituloDesbloqueadoReciente({ titulo: nuevoTitulo, mostrar: true });
    return true;
  };

  // ── Mapeo de niveles a títulos ──
  const titulosPorNivel = {};
  titulosData.porNivel.forEach(t => { titulosPorNivel[t.nivel] = { id: t.id, nombre: t.nombre, rareza: t.rareza }; });

  // ── Completar nivel ──
  const completarNivel = async (fueConPerfecta = false, esPrimeraVez = true) => {
    if (!usuarioId) return;
    if (!esPrimeraVez) return;

    const nivelId = oracionActual?.id;
    if (!nivelId) return;

    const hoy = hoyStr();
    const jugóHoy = userDoc?.jugóHoy ?? null;
    const rachaAct = userDoc?.racha ?? 0;
    let nuevaRacha = rachaAct;

    if (jugóHoy !== hoy) {
      const ayer = new Date(); ayer.setDate(ayer.getDate() - 1);
      const ayerStr = ayer.toISOString().split('T')[0];
      if (jugóHoy === ayerStr || jugóHoy === null) nuevaRacha = rachaAct + 1;
      else nuevaRacha = 1;
      await updateDoc(doc(db, 'usuarios', usuarioId), {
        nivelActual: increment(1),
        racha: nuevaRacha,
        jugóHoy: hoy,
        nivelesCompletados: arrayUnion(nivelId),
      });
    } else {
      await updateDoc(doc(db, 'usuarios', usuarioId), {
        nivelActual: increment(1),
        nivelesCompletados: arrayUnion(nivelId),
      });
    }

    await _avanzarMision('lecciones', 1);
    await _avanzarMision('niveles', 1);
    await _avanzarMision('racha', 1);
    if (fueConPerfecta) await _avanzarMision('perfectas', 1);

    const tipoCofre = fueConPerfecta ? 'oro' : 'madera';
    const recompensa = await entregarSanto(tipoCofre);
    setCofrePendiente(recompensa ? { tipo: tipoCofre, recompensa } : null);

    const mapaNivelATitulo = {
      'u1_padre_nuestro': 'protector_reino',
      'u1_ave_maria': 'caballero_mariano',
      'u1_gloria': 'luz_eterna',
      'u1_angel_guarda': 'custodio_divino',
      'u2_yo_confieso': 'corazon_purificado',
      'u2_acto_contricion': 'espiritu_renovado',
      'u2_dulce_madre': 'hijo_maria',
      'u3_credo_apostolico': 'pilar_iglesia',
      'u3_salve': 'reina_misericordia',
      'u4_mandamientos': 'guardian_supremo',
      'u4_bienaventuranzas': 'heredero_reino',
      'u5_sacramentos': 'elegido_gracia',
      'u5_obras_misericordia': 'manos_esperanza',
      'u6_misterios_gozosos': 'luz_nazaret',
      'u6_misterios_dolorosos': 'guerrero_calvario',
      'u6_misterios_gloriosos': 'campeon_celestial',
      'u6_misterios_luminosos': 'portador_luz_divina',
    };
    const tituloId = mapaNivelATitulo[nivelId];
    if (tituloId) {
      const yaTieneTitulo = userDoc?.titulosDesbloqueados?.some(t => t.id === tituloId) || false;
      const yaHayLogro = userDoc?.logrosPendientes?.some(l => l.id === tituloId) || false;
      if (!yaTieneTitulo && !yaHayLogro) {
        const nuevoLogro = { id: tituloId, fecha: new Date().toISOString() };
        await updateDoc(doc(db, 'usuarios', usuarioId), {
          logrosPendientes: arrayUnion(nuevoLogro),
        });
        setLogrosPendientes(prev => [...prev, nuevoLogro]);
        setUserDoc(prev => ({ ...prev, logrosPendientes: [...(prev?.logrosPendientes || []), nuevoLogro] }));
      }
    }
  };

  const aprobarExamen = async (claveUnidad) => {
    if (!usuarioId) return;
    await updateDoc(doc(db, 'usuarios', usuarioId), {
      examenesAprobados: arrayUnion(claveUnidad),
      monedas: increment(200),
    });
    const recompensa = await entregarSanto('plata');
    setCofrePendiente({ tipo: 'plata', recompensa });
  };


  const cerrarCofre = () => setCofrePendiente(null);

  // ── Compra de objetos (solo una versión) ──
  const comprarItem = async (item) => {
    if (!usuarioId) return false;
    const inv = userDoc?.inventario ?? [];
    if (inv.includes(item.id)) return false;
    if ((userDoc?.monedas ?? 0) < item.precio) return false;
    await sumarMonedas(-item.precio);
    await updateDoc(doc(db, 'usuarios', usuarioId), { inventario: arrayUnion(item.id) });
    setUserDoc(prev => ({ ...prev, inventario: [...(prev?.inventario || []), item.id] }));
    if (item.id === 'titulo_guardian') await updateDoc(doc(db, 'usuarios', usuarioId), { rango: 'Guardián del Credo' });
    if (item.id === 'titulo_maestro') await updateDoc(doc(db, 'usuarios', usuarioId), { rango: 'Maestro de la Fe' });
    return true;
  };

  // ── Ranking y estudiantes ──
  const obtenerRanking = async (grupo) => {
    const q = query(collection(db, 'usuarios'), where('grupo', '==', grupo), orderBy('monedas', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d, i) => ({ ...d.data(), posicion: i + 1 }));
  };

  const obtenerRankingGlobal = async () => {
    const q = query(collection(db, 'usuarios'), where('rol', '==', 'estudiante'), orderBy('monedas', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d, i) => ({ ...d.data(), posicionGlobal: i + 1 }));
  };

  const obtenerRankingGrupos = async () => {
    const q = query(collection(db, 'usuarios'), where('rol', '==', 'estudiante'));
    const snap = await getDocs(q);
    const estudiantes = snap.docs.map(d => d.data());
    const gruposMap = new Map();
    estudiantes.forEach(est => {
      const grupo = est.grupo || 'Sin Grupo';
      if (!gruposMap.has(grupo)) gruposMap.set(grupo, { nombre: grupo, monedasTotal: 0, estudiantes: [] });
      const grupoObj = gruposMap.get(grupo);
      grupoObj.monedasTotal += (est.monedas || 0);
      grupoObj.estudiantes.push({
        uid: est.uid,
        nombre: est.nombre,
        monedas: est.monedas || 0,
        nivelActual: est.nivelActual || 1,
        racha: est.racha || 0,
        rango: est.rango || 'Iniciado',
        inventario: est.inventario || [],
        avatar: est.avatar || '😇',
      });
    });
    const grupos = Array.from(gruposMap.values())
      .map(g => ({ ...g, estudiantes: [...g.estudiantes].sort((a,b) => b.monedas - a.monedas), top3: [...g.estudiantes].sort((a,b) => b.monedas - a.monedas).slice(0,3) }))
      .sort((a,b) => b.monedasTotal - a.monedasTotal)
      .map((g, idx) => ({ ...g, posicion: idx + 1 }));
    return grupos;
  };

  const obtenerEstudiantesGrupo = async (grupo) => {
    const q = query(collection(db, 'usuarios'), where('grupo', '==', grupo), where('rol', '==', 'estudiante'));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  };

  const iniciarLeccion = (oracion) => {
    setOracionActual(oracion);
    setEnLeccion(true);
  };

  const minutosHastaVida = () => {
    const vp = userDoc?.vidasPerdidas ?? [];
    if (!vp.length) return 0;
    return Math.max(0, Math.ceil((MS_REGEN_VIDA - (Date.now() - Math.min(...vp))) / 60000));
  };

  const actualizarAvatar = async (nuevoAvatar) => {
    if (!usuarioId) return false;
    try {
      await updateDoc(doc(db, 'usuarios', usuarioId), { avatar: nuevoAvatar });
      setUserDoc(prev => ({ ...prev, avatar: nuevoAvatar }));
      return true;
    } catch (error) {
      console.error('Error al actualizar avatar:', error);
      return false;
    }
  };

  // ── Valores expuestos ──
  const value = {
    usuarioId,
    userDoc,
    nombre:            userDoc?.nombre            ?? 'Guardián',
    grupo:             userDoc?.grupo             ?? 'Sin Grupo',
    rol:               userDoc?.rol               ?? 'estudiante',
    vidas:             vidasMostradas,
    monedas:           userDoc?.monedas           ?? 0,
    nivelActual:       userDoc?.nivelActual       ?? 1,
    rango:             userDoc?.rango             ?? 'Iniciado',
    racha:             userDoc?.racha             ?? 0,
    inventario:        userDoc?.inventario        ?? [],
    examenesAprobados: userDoc?.examenesAprobados ?? [],
    cofresAbiertos:    userDoc?.cofresAbiertos    ?? 0,
    cofrePendiente,
    coleccion,
    catalogoSantos:    santosData.santos,
    actualizarAvatar,
    consumirItem,
    loading,
    activeTab,
    setActiveTab,
    enLeccion,
    setEnLeccion,
    oracionActual,
    misionesState,
    registrarNiño,
    registrarCatequista,
    iniciarSesion,
    cerrarSesion,
    restarVida,
    añadirVida,
    sumarMonedas,
    completarNivel,
    comprarItem,
    iniciarLeccion,
    obtenerRanking,
    obtenerEstudiantesGrupo,
    obtenerRankingGlobal,
    obtenerRankingGrupos,
    reclamarMision,
    aprobarExamen,
    cerrarCofre,
    minutosHastaVida,
    comprarCorazon,
    comprarCofreMadera,
    comprarCofrePlata,
    comprarCofreOro,
    comprarPocion,
    comprarTiqueteOro,
    usarTiqueteOro,
    registrarPrimeraLeccionDelDia,
    obtenerOfertaDiaria,
    mostrarModalRacha,
    setMostrarModalRacha,
    recompensaRacha,
    corazonesCompradosHoy,
    cofresMaderaCompradosHoy,
    cofresPlataCompradosHoy,
    cofresOroCompradosHoy,
    pocionesCompradasHoy,
    ultimoTiqueteOroUsado,
    titulosDesbloqueados: userDoc?.titulosDesbloqueados || [],
    tituloEquipado: userDoc?.tituloEquipado,
    marcosDesbloqueados: userDoc?.marcosDesbloqueados || [],
    marcoEquipado: userDoc?.marcoEquipado,
    desbloquearTitulo,
    equiparTitulo,
    equiparMarco,
    tituloDesbloqueadoReciente,
    setTituloDesbloqueadoReciente,
    titulosLegendarios: titulosData.legendarios,
    titulosPorNivel: titulosData.porNivel,
    comprarTituloLegendario,
    logrosPendientes,
    canjearLogro,
    MISIONES_DIARIAS,
    MISIONES_SEMANALES,
    nivelesCompletados: userDoc?.nivelesCompletados || [],
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => useContext(GameContext);