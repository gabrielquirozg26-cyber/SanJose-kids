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

  // ── Sincronización con Firebase ──
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuarioId(user.uid);
        const unsubDoc = onSnapshot(doc(db, 'usuarios', user.uid), (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            // Asegurar que avatar siempre tenga valor (si no existe, '😇')
            if (!data.avatar) {
              data.avatar = '😇';
            }
            setUserDoc(data);
            setColeccion(data.coleccion ?? []);
            _sincronizarMisiones(user.uid, data);
            _aplicarRegenVidas(user.uid, data);
            _verificarRacha(user.uid, data);
          } else {
            // Si no existe documento, crearlo (esto no debería pasar porque se crea al registrar)
            console.warn('Documento de usuario no encontrado');
          }
          setLoading(false);
        });
        return () => unsubDoc();
      } else {
        setUsuarioId(null); setUserDoc(null);
        setMisionesState(null); setLoading(false);
        setColeccion([]);
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
    vidas: MAX_VIDAS, monedas: 100, nivelActual: 1,
    rango: 'Iniciado', racha: 0, rol: 'estudiante',
    fechaRegistro: new Date().toISOString(),
    misiones: {}, inventario: [], vidasPerdidas: [],
    jugóHoy: null, examenesAprobados: [], cofresAbiertos: 0,
    coleccion: [],
    avatar: '😇',  // Avatar por defecto emoji
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

  // ── SISTEMA DE SANTOS ──
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
      return {
        tipo: 'repetido',
        santo: santo,
        compensacion: compensacion,
      };
    } else {
      await updateDoc(doc(db, 'usuarios', usuarioId), {
        coleccion: arrayUnion(santo.id),
        cofresAbiertos: increment(1),
      });
      setColeccion(prev => [...prev, santo.id]);
      return {
        tipo: 'nuevo',
        santo: santo,
      };
    }
  };

  // ── Completar nivel (cofre) ──
  const completarNivel = async (fueConPerfecta = false) => {
    if (!usuarioId) return;
    const hoy      = hoyStr();
    const jugóHoy  = userDoc?.jugóHoy ?? null;
    const rachaAct = userDoc?.racha   ?? 0;
    let nuevaRacha = rachaAct;

    if (jugóHoy !== hoy) {
      const ayer = new Date(); ayer.setDate(ayer.getDate() - 1);
      const ayerStr = ayer.toISOString().split('T')[0];
      if (jugóHoy === ayerStr || jugóHoy === null) nuevaRacha = rachaAct + 1;
      else nuevaRacha = 1;
      await updateDoc(doc(db, 'usuarios', usuarioId), { nivelActual: increment(1), racha: nuevaRacha, jugóHoy: hoy });
    } else {
      await updateDoc(doc(db, 'usuarios', usuarioId), { nivelActual: increment(1) });
    }

    await _avanzarMision('lecciones', 1);
    await _avanzarMision('niveles', 1);
    await _avanzarMision('racha', 1);
    if (fueConPerfecta) await _avanzarMision('perfectas', 1);

    const tipoCofre = fueConPerfecta ? 'oro' : 'madera';
    const recompensa = await entregarSanto(tipoCofre);
    setCofrePendiente({ tipo: tipoCofre, recompensa });
  };

  // ── Aprobar examen (cofre de plata) ──
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

  // ── Inventario y tienda ──
  const comprarItem = async (item) => {
    if (!usuarioId) return false;
    const inv = userDoc?.inventario ?? [];
    if (item.id === 'corazon_extra') {
      if ((userDoc?.monedas ?? 0) < item.precio) return false;
      await sumarMonedas(-item.precio); await añadirVida(); return true;
    }
    if (inv.includes(item.id) || (userDoc?.monedas ?? 0) < item.precio) return false;
    await sumarMonedas(-item.precio);
    await updateDoc(doc(db, 'usuarios', usuarioId), { inventario: arrayUnion(item.id) });
    if (item.id === 'titulo_guardian') await updateDoc(doc(db, 'usuarios', usuarioId), { rango: 'Guardián del Credo' });
    if (item.id === 'titulo_maestro')  await updateDoc(doc(db, 'usuarios', usuarioId), { rango: 'Maestro de la Fe' });
    return true;
  };

  // ── Ranking y estudiantes ──
  const obtenerRanking = async (grupo) => {
    const q = query(collection(db, 'usuarios'), where('grupo', '==', grupo), orderBy('monedas', 'desc'));
    const snap = await getDocs(q); return snap.docs.map((d, i) => ({ ...d.data(), posicion: i + 1 }));
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
      if (!gruposMap.has(grupo)) {
        gruposMap.set(grupo, {
          nombre: grupo,
          monedasTotal: 0,
          estudiantes: []
        });
      }
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
      });
    });

    const grupos = Array.from(gruposMap.values())
      .map(g => {
        const estudiantesOrdenados = [...g.estudiantes].sort((a,b) => b.monedas - a.monedas);
        return {
          ...g,
          estudiantes: estudiantesOrdenados,
          top3: estudiantesOrdenados.slice(0,3)
        };
      })
      .sort((a,b) => b.monedasTotal - a.monedasTotal)
      .map((g, idx) => ({ ...g, posicion: idx + 1 }));

    return grupos;
  };

  const obtenerEstudiantesGrupo = async (grupo) => {
    const q = query(collection(db, 'usuarios'), where('grupo', '==', grupo), where('rol', '==', 'estudiante'));
    const snap = await getDocs(q); return snap.docs.map(d => d.data());
  };

  const iniciarLeccion = (oracion) => { setOracionActual(oracion); setEnLeccion(true); };

  const minutosHastaVida = () => {
    const vp = userDoc?.vidasPerdidas ?? []; if (!vp.length) return 0;
    return Math.max(0, Math.ceil((MS_REGEN_VIDA - (Date.now() - Math.min(...vp))) / 60000));
  };

  // ── Función para actualizar avatar (con mejora de persistencia) ──
  const actualizarAvatar = async (nuevoAvatar) => {
    if (!usuarioId) return false;
    try {
      await updateDoc(doc(db, 'usuarios', usuarioId), { avatar: nuevoAvatar });
      // Actualizar estado local inmediatamente para reflejar el cambio visual
      setUserDoc(prev => ({ ...prev, avatar: nuevoAvatar }));
      console.log('Avatar actualizado en Firestore y estado local:', nuevoAvatar);
      return true;
    } catch (error) {
      console.error('Error al actualizar avatar:', error);
      return false;
    }
  };

  // ── Valores expuestos ──
  const value = {
    usuarioId,
    userDoc,  // exponemos userDoc completo para acceder a avatar directamente
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

    loading, activeTab, setActiveTab,
    enLeccion, setEnLeccion,
    oracionActual, misionesState,

    registrarNiño, registrarCatequista,
    iniciarSesion, cerrarSesion,
    restarVida, añadirVida,
    sumarMonedas, completarNivel,
    comprarItem, iniciarLeccion,
    obtenerRanking, obtenerEstudiantesGrupo,
    obtenerRankingGlobal,
    obtenerRankingGrupos,
    reclamarMision, aprobarExamen,
    cerrarCofre, minutosHastaVida,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => useContext(GameContext);