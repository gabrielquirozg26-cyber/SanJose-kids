import { mapaNivelATitulo, examenDisponible } from '../utils/aprendizaje';
// src/context/GameContext.jsx
import React, { createContext, useContext, useState, useMemo, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useShop } from './ShopContext';
import { useTitles } from './TitlesContext';
import { obtenerProgreso } from '../utils/progreso';
import nivelesData from '../data/niveles.json';
import { MISIONES_DIARIAS, MISIONES_SEMANALES } from '../data/misiones';
import { operarUsuario, iniciarSesionLeccion, premiarEjercicio, finalizarSesionLeccion, seleccionarSanto, premiarExamen, premiarRespuestaExamen } from '../utils/economia';
import { sendLocalNotification } from '../utils/serviceWorker';
import { db } from '../firebase';
import { doc, collection, query, where, getDocs, addDoc, orderBy, runTransaction } from 'firebase/firestore';
import santosData from '../data/santos.json';
import titulosData from '../data/titulos.json'

const GameContext = createContext();

const definiciones = { diarias: MISIONES_DIARIAS, semanales: MISIONES_SEMANALES };

export const GameProvider = ({ children }) => {
  // ── HOOKS: SIEMPRE se ejecutan ────────────────────────────────────────
  const authContext = useAuth();
  const shopContext = useShop();
  const titlesContext = useTitles();

  // ── EXTRAER VALORES ────────────────────────────────────────────────────
  const {
    usuarioId,
    userDoc,
    actualizarUserDoc,
    restarVida,
    vidas,
    actualizarAvatar,
    cerrarSesion,
    minutosHastaVida,
  } = authContext;

  const {
    setCofrePendiente,
    coleccion,
    cofrePendiente,
    cerrarCofre,
    comprarDobleXp,
    comprarProtectorRacha,
    comprarItem,
    comprarCorazon,
    comprarPocion,
    consumirItem,
  } = shopContext;

  const {
    logrosPendientes, comprarTituloLegendario, tituloDesbloqueadoReciente, setTituloDesbloqueadoReciente,
  } = titlesContext;

  // ── ESTADO LOCAL ──────────────────────────────────────────────────────
  const sesionActualRef = useRef(null);
  const iniciandoRef = useRef(false);
  const [activeTab, setActiveTab] = useState('mapa');
  const [enLeccion, setEnLeccion] = useState(false);
  const [oracionActual, setOracionActual] = useState(null);
  const [mostrarModalRacha, setMostrarModalRacha] = useState(false);
  const [recompensaRacha, setRecompensaRacha] = useState(null);

  // ── FUNCIONES DE EVALUACIONES ─────────────────────────────────────────

  /**
   * Guardar una evaluación de oraciones (presencial)
   */
  const guardarEvaluacion = async (datos) => {
    try {
      if (!datos.estudianteId || !datos.catequistaId) {
        throw new Error('Faltan datos obligatorios');
      }

      const totalSabe = datos.oraciones.filter(o => o.resultado === 'sabe').length;
      const totalNoSabe = datos.oraciones.filter(o => o.resultado === 'no_sabe').length;

      const evaluacionData = {
        estudianteId: datos.estudianteId,
        estudianteNombre: datos.estudianteNombre || '',
        catequistaId: datos.catequistaId,
        catequistaNombre: datos.catequistaNombre || '',
        grupo: datos.grupo || '',
        fecha: new Date(),
        rangoInicio: datos.rangoInicio || 1,
        rangoFin: datos.rangoFin || datos.oraciones.length,
        oraciones: datos.oraciones,
        totalSabe: totalSabe,
        totalNoSabe: totalNoSabe,
        observaciones: datos.observaciones || '',
      };

      const docRef = await addDoc(collection(db, 'evaluaciones'), evaluacionData);
      await actualizarUserDoc({ ultimaEvaluacion: new Date() });

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error guardando evaluación:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Obtener todas las evaluaciones de un niño
   */
  const obtenerEvaluaciones = async (estudianteId) => {
    try {
      const q = query(
        collection(db, 'evaluaciones'),
        where('estudianteId', '==', estudianteId)
      );
      const snapshot = await getDocs(q);
      const datos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return datos.sort((a, b) => {
        const fechaA = a.fecha?.toDate?.() || new Date(0);
        const fechaB = b.fecha?.toDate?.() || new Date(0);
        return fechaB - fechaA;
      });
    } catch (error) {
      console.error('Error obteniendo evaluaciones:', error);
      return [];
    }
  };

  /**
   * Obtener evaluaciones de un grupo específico
   */
  const obtenerEvaluacionesGrupo = async (grupo) => {
    try {
      const q = query(
        collection(db, 'evaluaciones'),
        where('grupo', '==', grupo),
        orderBy('fecha', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error obteniendo evaluaciones del grupo:', error);
      return [];
    }
  };

  /**
   * Obtener la última evaluación de un niño
   */
  const obtenerUltimaEvaluacion = async (estudianteId) => {
    try {
      const q = query(
        collection(db, 'evaluaciones'),
        where('estudianteId', '==', estudianteId),
        orderBy('fecha', 'desc'),
        orderBy('__name__', 'desc')
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error obteniendo última evaluación:', error);
      return null;
    }
  };

  /**
   * Obtener estadísticas de evaluaciones de un niño
   */
  const obtenerEstadisticasEvaluaciones = async (estudianteId) => {
    try {
      const evaluaciones = await obtenerEvaluaciones(estudianteId);
      
      if (evaluaciones.length === 0) {
        return { total: 0, promedioSabe: 0, ultima: null };
      }

      const total = evaluaciones.length;
      const totalSabe = evaluaciones.reduce((sum, e) => sum + (e.totalSabe || 0), 0);
      const totalOraciones = evaluaciones.reduce((sum, e) => sum + e.oraciones.length, 0);
      const promedioSabe = totalOraciones > 0 ? Math.round((totalSabe / totalOraciones) * 100) : 0;

      return {
        total,
        promedioSabe,
        ultima: evaluaciones[0] || null,
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return { total: 0, promedioSabe: 0, ultima: null };
    }
  };

  // ── FUNCIONES ORIGINALES ──────────────────────────────────────────────
  const ejecutarEconomia = operacion => {
    if (!usuarioId) throw new Error('Inicia sesión para continuar.');
    return runTransaction(db, tx => operarUsuario(tx, doc(db, 'usuarios', usuarioId), operacion));
  };

  const iniciarLeccion = async oracion => {
    if (iniciandoRef.current) return false;
    if (!nivelesData.unidades.some(u => u.lecciones.some(l => l.id === oracion?.id))) return false;
    iniciandoRef.current = true;
    try {
      const sesionId = crypto.randomUUID();
      const sesion = await ejecutarEconomia(data => iniciarSesionLeccion(data, oracion.id, sesionId));
      sesionActualRef.current = sesion;
      setOracionActual({ ...oracion, multiplicadorMonedas: sesion.multiplicador });
      setEnLeccion(true);
      return true;
    } finally {
      iniciandoRef.current = false;
    }
  };

  const cerrarLeccion = () => {
    setEnLeccion(false);
    setOracionActual(null);
    sesionActualRef.current = null;
  };

  // Devuelve lo realmente abonado para que el mensaje y la pantalla final coincidan.
  const sumarMonedas = (cantidad, clave) => {
    if (clave?.startsWith('examen:')) {
      return ejecutarEconomia(data => {
        if (!examenDisponible(nivelesData.unidades, clave.split(':')[1], data.nivelesCompletados)) throw new Error('Este examen todavía está bloqueado.');
        return premiarRespuestaExamen(data, clave, cantidad, definiciones);
      });
    }
    const sesion = sesionActualRef.current;
    if (!sesion) throw new Error('No hay una lección activa.');
    return ejecutarEconomia(data => premiarEjercicio(data, sesion.id, clave, cantidad, definiciones));
  };

  const completarNivel = async (fueConPerfecta = false) => {
    const sesion = sesionActualRef.current;
    if (!sesion || !oracionActual) throw new Error('No hay una lección activa.');
    const tipo = fueConPerfecta ? 'oro' : 'madera';
    const santo = seleccionarSanto(santosData.santos, tipo);
    const resultado = await ejecutarEconomia(data => finalizarSesionLeccion(data, {
      sesionId: sesion.id, leccion: oracionActual, unidades: nivelesData.unidades,
      santo, tituloId: mapaNivelATitulo[oracionActual.id], perfecta: fueConPerfecta, definiciones,
    }));
    if (resultado.recompensa) setCofrePendiente({ tipo, recompensa: resultado.recompensa });
    if (resultado.racha) {
      setRecompensaRacha(resultado.racha);
      setMostrarModalRacha(true);
      void sendLocalNotification('Racha de ' + resultado.racha.racha + ' días',
        'Has ganado ' + resultado.racha.monedas + ' monedas por tu constancia.', '/');
    }
    return resultado;
  };

  const aprobarExamen = async claveUnidad => {
    const santo = seleccionarSanto(santosData.santos, 'plata');
    const resultado = await ejecutarEconomia(data => {
      if (!examenDisponible(nivelesData.unidades, claveUnidad, data.nivelesCompletados)) throw new Error('Completa las lecciones de este reino y los anteriores antes del examen.');
      return premiarExamen(data, claveUnidad, santo, definiciones);
    });
    if (resultado.recompensa) setCofrePendiente({ tipo: 'plata', recompensa: resultado.recompensa });
    return resultado.monedas;
  };

  const obtenerRanking = async (grupo) => {
    try {
      const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
      const q = query(collection(db, 'usuarios'), where('grupo', '==', grupo), orderBy('monedas', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d, i) => ({ ...d.data(), posicion: i + 1 }));
    } catch (e) {
      console.error('Error obteniendo ranking:', e);
      return [];
    }
  };

  const obtenerRankingGlobal = async () => {
    try {
      const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
      const q = query(collection(db, 'usuarios'), where('rol', '==', 'estudiante'), orderBy('monedas', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map((d, i) => ({ ...d.data(), posicionGlobal: i + 1 }));
    } catch (e) {
      console.error('Error obteniendo ranking global:', e);
      return [];
    }
  };

  const obtenerRankingGrupos = async () => {
    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const q = query(collection(db, 'usuarios'), where('rol', '==', 'estudiante'));
      const snap = await getDocs(q);
      const estudiantes = snap.docs.map(d => d.data());
      const gruposMap = new Map();

      estudiantes.forEach(est => {
        const grupo = est.grupo || 'Sin Grupo';
        if (!gruposMap.has(grupo)) gruposMap.set(grupo, { nombre: grupo, monedasTotal: 0, estudiantes: [] });
        const g = gruposMap.get(grupo);
        g.monedasTotal += (est.monedas || 0);
        g.estudiantes.push({
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

      return Array.from(gruposMap.values())
        .map(g => ({
          ...g,
          estudiantes: [...g.estudiantes].sort((a, b) => b.monedas - a.monedas),
          top3: [...g.estudiantes].sort((a, b) => b.monedas - a.monedas).slice(0, 3),
        }))
        .sort((a, b) => b.monedasTotal - a.monedasTotal)
        .map((g, idx) => ({ ...g, posicion: idx + 1 }));
    } catch (e) {
      console.error('Error obteniendo ranking de grupos:', e);
      return [];
    }
  };

  const obtenerEstudiantesGrupo = async (grupo) => {
    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const q = query(collection(db, 'usuarios'), where('grupo', '==', grupo), where('rol', '==', 'estudiante'));
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    } catch (e) {
      console.error('Error obteniendo estudiantes:', e);
      return [];
    }
  };

  // ── VALORES EXPUESTOS ──────────────────────────────────────────────────
  const progreso = useMemo(
    () => obtenerProgreso(userDoc?.nivelesCompletados ?? [], nivelesData.unidades),
    [userDoc?.nivelesCompletados]
  );
  const value = {
    // Navegación
    activeTab,
    setActiveTab,
    enLeccion,
    setEnLeccion,
    oracionActual,
    mostrarModalRacha,
    setMostrarModalRacha,
    recompensaRacha,

    // Usuario (desde AuthContext)
    usuarioId,
    userDoc,
    nombre: userDoc?.nombre ?? 'Guardián',
    grupo: userDoc?.grupo ?? 'Sin Grupo',
    rol: userDoc?.rol ?? 'estudiante',
    vidas: vidas ?? 5,
    monedas: userDoc?.monedas ?? 0,
    nivelActual: progreso.nivelActual,
    rango: userDoc?.rango ?? 'Iniciado',
    racha: userDoc?.racha ?? 0,
    inventario: userDoc?.inventario ?? [],
    examenesAprobados: userDoc?.examenesAprobados ?? [],
    cofresAbiertos: userDoc?.cofresAbiertos ?? 0,
    nivelesCompletados: progreso.leccionesCompletadas,
    titulosDesbloqueados: userDoc?.titulosDesbloqueados ?? [],
    tituloEquipado: userDoc?.tituloEquipado,
    titulosLegendarios: titulosData.legendarios || [],
    marcosDesbloqueados: userDoc?.marcosDesbloqueados ?? [],
    marcoEquipado: userDoc?.marcoEquipado,
    minutosHastaVida,

    // ✅ Funciones de AuthContext
    actualizarAvatar,
    cerrarSesion,

    // Álbum (desde ShopContext)
    coleccion: coleccion ?? [],
    catalogoSantos: santosData.santos,
    cofrePendiente: cofrePendiente ?? null,
    cerrarCofre: cerrarCofre ?? (() => {}),

    comprarTituloLegendario, tituloDesbloqueadoReciente, setTituloDesbloqueadoReciente,

    // Logros (desde TitlesContext)
    logrosPendientes: logrosPendientes ?? [],

    // ✅ Funciones de ShopContext
    consumirItem,
    comprarItem,
    comprarCorazon,
    comprarPocion,
    comprarDobleXp,
    comprarProtectorRacha,

    // Acciones
    iniciarLeccion: iniciarLeccion ?? (() => {}),
    cerrarLeccion: cerrarLeccion ?? (() => {}),
    completarNivel: completarNivel ?? (() => {}),
    sumarMonedas: sumarMonedas ?? (() => {}),
    aprobarExamen: aprobarExamen ?? (() => {}),
    restarVida: restarVida ?? (() => {}),

    // Ranking
    obtenerRanking: obtenerRanking ?? (() => []),
    obtenerRankingGlobal: obtenerRankingGlobal ?? (() => []),
    obtenerRankingGrupos: obtenerRankingGrupos ?? (() => []),
    obtenerEstudiantesGrupo: obtenerEstudiantesGrupo ?? (() => []),

    // ✅ NUEVAS FUNCIONES DE EVALUACIONES
    guardarEvaluacion,
    obtenerEvaluaciones,
    obtenerEvaluacionesGrupo,
    obtenerUltimaEvaluacion,
    obtenerEstadisticasEvaluaciones,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame debe usarse dentro de GameProvider');
  return context;
};
