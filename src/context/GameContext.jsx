import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { useShop } from './ShopContext';
import { useTitles } from './TitlesContext';
import { advanceMissions } from '../utils/missionHelper';
import { db } from '../firebase';
import { doc, increment, arrayUnion, collection, query, where, getDocs, addDoc, orderBy, getDoc } from 'firebase/firestore';
import santosData from '../data/santos.json';
import titulosData from '../data/titulos.json'

const GameContext = createContext();

const hoyStr = () => new Date().toISOString().split('T')[0];

// ── Mapa nivel → título ────────────────────────────────────────────────────
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

export const GameProvider = ({ children }) => {
  // ── HOOKS: SIEMPRE se ejecutan ────────────────────────────────────────
  const authContext = useAuth();
  const shopContext = useShop();
  const titlesContext = useTitles();

  // ── EXTRAER VALORES ────────────────────────────────────────────────────
  const {
    usuarioId,
    userDoc,
    setUserDoc,
    actualizarUserDoc,
    registrarPrimeraLeccionDelDia,
    restarVida,
    vidas,
    actualizarAvatar,
    cerrarSesion,
    minutosHastaVida,
  } = authContext;

  const {
    entregarSanto,
    setCofrePendiente,
    coleccion,
    cofrePendiente,
    cerrarCofre,
  } = shopContext;

  const {
    agregarLogroPendiente,
    logrosPendientes,
  } = titlesContext;

  // ── ESTADO LOCAL ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('mapa');
  const [enLeccion, setEnLeccion] = useState(false);
  const [oracionActual, setOracionActual] = useState(null);
  const [mostrarModalRacha, setMostrarModalRacha] = useState(false);
  const [recompensaRacha, setRecompensaRacha] = useState(null);

  // ── FUNCIONES DE EVALUACIONES ─────────────────────────────────────────

  /**
   * Guardar una evaluación de oraciones (presencial)
   * @param {Object} datos - Datos de la evaluación
   * @param {string} datos.estudianteId - UID del niño
   * @param {string} datos.estudianteNombre - Nombre del niño
   * @param {string} datos.catequistaId - UID del catequista
   * @param {string} datos.catequistaNombre - Nombre del catequista
   * @param {string} datos.grupo - Grupo del niño
   * @param {number} datos.rangoInicio - Rango de oraciones inicio
   * @param {number} datos.rangoFin - Rango de oraciones fin
   * @param {Array} datos.oraciones - Array de objetos { id, nombre, resultado }
   * @param {string} datos.observaciones - Observaciones (opcional)
   * @returns {Promise<{success: boolean, id: string}>}
   */
  const guardarEvaluacion = async (datos) => {
    try {
      if (!datos.estudianteId || !datos.catequistaId) {
        throw new Error('Faltan datos obligatorios');
      }

      // Calcular totales
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
      
      // Actualizar el campo ultimaEvaluacion en el usuario
      await actualizarUserDoc({ ultimaEvaluacion: new Date() });

      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error guardando evaluación:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Obtener todas las evaluaciones de un niño
   * @param {string} estudianteId - UID del niño
   * @returns {Promise<Array>}
   */
  // src/context/GameContext.jsx
  // Busca la función obtenerEvaluaciones y reemplázala con esto:

  const obtenerEvaluaciones = async (estudianteId) => {
    try {
      const q = query(
        collection(db, 'evaluaciones'),
        where('estudianteId', '==', estudianteId)
      );
      const snapshot = await getDocs(q);
      const datos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Ordenar manualmente por fecha (más reciente primero)
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
   * @param {string} grupo - Nombre del grupo
   * @returns {Promise<Array>}
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
   * @param {string} estudianteId - UID del niño
   * @returns {Promise<Object|null>}
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
   * @param {string} estudianteId - UID del niño
   * @returns {Promise<{total: number, promedioSabe: number, ultima: Object|null}>}
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
  const iniciarLeccion = (oracion) => {
    if (!usuarioId) return;
    setOracionActual(oracion);
    setEnLeccion(true);
  };

  const cerrarLeccion = () => {
    setEnLeccion(false);
    setOracionActual(null);
  };

  const sumarMonedas = async (cantidad) => {
    if (!usuarioId) return;
    await actualizarUserDoc({ monedas: increment(Number(cantidad)) });
    if (cantidad > 0) {
      await advanceMissions('monedas', Number(cantidad));
    }
  };

  const completarNivel = async (fueConPerfecta = false, esPrimeraVez = true) => {
    if (!usuarioId) return;
    const nivelId = oracionActual?.id;
    if (!nivelId) return;

    await advanceMissions('lecciones', 1);
    await advanceMissions('niveles', 1);
    if (fueConPerfecta) await advanceMissions('perfectas', 1);

    const hoy = hoyStr();
    const jugóHoy = userDoc?.jugóHoy ?? null;
    const rachaAct = userDoc?.racha ?? 0;
    let nuevaRacha = rachaAct;

    if (jugóHoy !== hoy) {
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      const ayerStr = ayer.toISOString().split('T')[0];

      if (jugóHoy === ayerStr || jugóHoy === null) nuevaRacha = rachaAct + 1;
      else nuevaRacha = 1;

      await actualizarUserDoc({
        nivelActual: increment(1),
        racha: nuevaRacha,
        jugóHoy: hoy,
        nivelesCompletados: arrayUnion(nivelId),
      });

      await advanceMissions('racha', 1);
      await advanceMissions('racha_semanal', 1);

      const resultado = await registrarPrimeraLeccionDelDia();
      if (resultado) {
        setRecompensaRacha(resultado);
        setMostrarModalRacha(true);
      }
    } else {
      await actualizarUserDoc({
        nivelActual: increment(1),
        nivelesCompletados: arrayUnion(nivelId),
      });
    }

    if (!esPrimeraVez) return;

    const tipoCofre = fueConPerfecta ? 'oro' : 'madera';
    const recompensa = await entregarSanto(tipoCofre);
    if (recompensa) {
      setCofrePendiente({ tipo: tipoCofre, recompensa });
    }

    const tituloId = mapaNivelATitulo[nivelId];
    if (tituloId) {
      await agregarLogroPendiente(tituloId);
    }
  };

  const aprobarExamen = async (claveUnidad) => {
    if (!usuarioId) return;
    await actualizarUserDoc({
      examenesAprobados: arrayUnion(claveUnidad),
      monedas: increment(200),
    });
    const recompensa = await entregarSanto('plata');
    if (recompensa) {
      setCofrePendiente({ tipo: 'plata', recompensa });
    }
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
    nivelActual: userDoc?.nivelActual ?? 1,
    rango: userDoc?.rango ?? 'Iniciado',
    racha: userDoc?.racha ?? 0,
    inventario: userDoc?.inventario ?? [],
    examenesAprobados: userDoc?.examenesAprobados ?? [],
    cofresAbiertos: userDoc?.cofresAbiertos ?? 0,
    nivelesCompletados: userDoc?.nivelesCompletados ?? [],
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

    // Logros (desde TitlesContext)
    logrosPendientes: logrosPendientes ?? [],

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

  // ✅ SIEMPRE renderizar el Provider, NUNCA retornar null
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame debe usarse dentro de GameProvider');
  return context;
};