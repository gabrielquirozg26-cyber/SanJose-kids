// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { operarUsuario, protegerRacha, registrarActividadDiaria, modificarVidas, vidasActivas } from '../utils/economia';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  runTransaction
} from 'firebase/firestore';

const AuthContext = createContext();

const MAX_VIDAS = 5;
const MS_REGEN_VIDA = 4 * 60 * 60 * 1000;

const hoyStr = () => new Date().toISOString().split('T')[0];

// ── Base para nuevos usuarios ──
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
  dobleXpHoy: 0,                    // ✅ NUEVO
  ultimaFechaDobleXp: null,          // ✅ NUEVO
  protectorRachaHoy: 0,              // ✅ NUEVO
  ultimaFechaProtectorRacha: null,   // ✅ NUEVO
  ultimoTiqueteOroUsado: null,
  ultimaPrimeraLeccion: null,
  titulosDesbloqueados: [],
  tituloEquipado: null,
  marcosDesbloqueados: [],
  marcoEquipado: null,
  nivelesCompletados: [],
  logrosPendientes: [],
  historialNiveles: [],
  biografia: '',
  santoFavorito: '',
  contrasenaCambiada: false,
  esPrimeraVez: true,
  ultimaEvaluacion: null,
  ...extra,
});

export const AuthProvider = ({ children }) => {
  const [usuarioId, setUsuarioId] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [vidasMostradas, setVidasM] = useState(MAX_VIDAS);

  // ════════════════════════════════════════════════════════════════════════
  // 🔒 REGENERACIÓN DE VIDAS - NO TOCAR
  // ════════════════════════════════════════════════════════════════════════
  const _aplicarRegenVidas = async uid => {
    try {
      const vidasActuales = await runTransaction(db, tx => operarUsuario(tx, doc(db, 'usuarios', uid),
        actual => modificarVidas(actual, 'regenerar')));
      setVidasM(vidasActuales);
    } catch (error) {
      console.error('No se pudo regenerar vidas:', error);
    }
  };

  // ════════════════════════════════════════════════════════════════════════
  // 🔥 VERIFICAR RACHA - MODIFICADO PARA USAR protector_racha
  // ════════════════════════════════════════════════════════════════════════
  const _verificarRacha = async (uid, data) => {
    const hoy = hoyStr();
    if (!protegerRacha(data, hoy).cambios) return;
    try {
      await runTransaction(db, tx => operarUsuario(tx, doc(db, 'usuarios', uid),
        actual => protegerRacha(actual, hoy)));
    } catch (error) {
      console.error('No se pudo verificar la protección de racha:', error);
    }
  };

  // ════════════════════════════════════════════════════════════════════════
  // 🔄 INICIALIZAR AUTH - NO TOCAR (solo añadimos _verificarRacha)
  // ════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuarioId(user.uid);
        
        const unsubDoc = onSnapshot(doc(db, 'usuarios', user.uid), (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            if (!data.avatar) data.avatar = '😇';
            setUserDoc(data);
            
            // Calcular vidas desde Firestore
            const vp = data.vidasPerdidas ?? [];
            const ahora = Date.now();
            const nuevas = vp.filter(ts => ahora - ts < MS_REGEN_VIDA);
            const vidasCalculadas = Math.min(MAX_VIDAS, MAX_VIDAS - nuevas.length);
            
            setVidasM(vidasCalculadas);
            
            // ✅ Verificar racha al cargar los datos
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
        setVidasM(MAX_VIDAS);
        setLoading(false);
      }
    });
    
    return () => unsubAuth();
  }, []);

  // ════════════════════════════════════════════════════════════════════════
  // ⏰ REGENERACIÓN DE VIDAS EN SEGUNDO PLANO - NO TOCAR
  // ════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!usuarioId || !userDoc || !(userDoc.vidasPerdidas?.length)) return;
    const t = setInterval(() => {
      _aplicarRegenVidas(usuarioId, userDoc);
    }, 60000);
    return () => clearInterval(t);
  }, [usuarioId, userDoc?.vidasPerdidas?.length]);

  // ════════════════════════════════════════════════════════════════════════
  // 🔐 AUTENTICACIÓN - NO TOCAR
  // ════════════════════════════════════════════════════════════════════════
  const registrarNiño = async (email, password, nombre, grupo) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'usuarios', user.uid), {
        ..._base(),
        nombre: nombre.toUpperCase(),
        grupo,
        uid: user.uid,
        email,
      });
      return user;
    } catch (e) {
      setAuthError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const registrarCatequista = async (email, password, nombre, grupo) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'usuarios', user.uid), {
        ..._base({ 
          vidas: 99, 
          monedas: 0, 
          nivelActual: 0, 
          rango: 'Catequista', 
          rol: 'catequista' 
        }),
        nombre: nombre.toUpperCase(),
        grupo,
        uid: user.uid,
        email,
      });
      return user;
    } catch (e) {
      setAuthError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const iniciarSesion = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setAuthError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
    }
  };

  const cambiarContrasena = async (nuevaContrasena) => {
    if (!auth.currentUser) throw new Error('No hay usuario autenticado');
    await updatePassword(auth.currentUser, nuevaContrasena);
    await actualizarUserDoc({ contrasenaCambiada: true });
  };

  // ════════════════════════════════════════════════════════════════════════
  // 💾 ACTUALIZAR DOCUMENTO - NO TOCAR
  // ════════════════════════════════════════════════════════════════════════
  const actualizarUserDoc = async (data) => {
    if (!usuarioId) return false;
    try {
      await updateDoc(doc(db, 'usuarios', usuarioId), data);
      return true;
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      return false;
    }
  };

  // ════════════════════════════════════════════════════════════════════════
  // ❤️ VIDAS - NO TOCAR NADA DE ESTO
  // ════════════════════════════════════════════════════════════════════════
  const restarVida = async () => {
    if (!usuarioId) throw new Error('Inicia sesión para continuar.');
    return runTransaction(db, tx => operarUsuario(tx, doc(db, 'usuarios', usuarioId),
      actual => modificarVidas(actual, 'restar')));
  };

  const añadirVida = async () => {
    if (!usuarioId) return false;
    return runTransaction(db, tx => operarUsuario(tx, doc(db, 'usuarios', usuarioId),
      actual => modificarVidas(actual, 'añadir')));
  };

  const minutosHastaVida = () => {
    const perdidas = vidasActivas(userDoc ?? {});
    if (!perdidas.length) return 0;
    return Math.max(0, Math.ceil((MS_REGEN_VIDA - (Date.now() - perdidas[0])) / 60000));
  };

  // ════════════════════════════════════════════════════════════════════════
  // 👤 ACTUALIZAR AVATAR - NO TOCAR
  // ════════════════════════════════════════════════════════════════════════
  const actualizarAvatar = async (nuevoAvatar) => {
    if (!usuarioId) return false;
    try {
      await actualizarUserDoc({ avatar: nuevoAvatar });
      setUserDoc(prev => ({ ...prev, avatar: nuevoAvatar }));
      return true;
    } catch (error) {
      console.error('Error al actualizar avatar:', error);
      return false;
    }
  };

  // ════════════════════════════════════════════════════════════════════════
  // 📅 REGISTRAR PRIMERA LECCIÓN DEL DÍA - NO TOCAR
  // ════════════════════════════════════════════════════════════════════════
  const registrarPrimeraLeccionDelDia = async () => {
    if (!usuarioId) return false;
    return runTransaction(db, tx => operarUsuario(tx, doc(db, 'usuarios', usuarioId),
      actual => registrarActividadDiaria(actual)));
  };

  // ════════════════════════════════════════════════════════════════════════
  // 📦 VALORES EXPUESTOS - NO TOCAR (solo añadir nuevos campos si es necesario)
  // ════════════════════════════════════════════════════════════════════════
  const value = {
    usuarioId,
    userDoc,
    setUserDoc,
    loading,
    authError,
    vidas: vidasMostradas,
    
    registrarNiño,
    registrarCatequista,
    iniciarSesion,
    cerrarSesion,
    cambiarContrasena,
    
    actualizarUserDoc,
    actualizarAvatar,
    
    // ⚠️ ESTAS FUNCIONES QUEDAN IGUALES - NO TOCAR
    restarVida,
    añadirVida,
    minutosHastaVida,
    
    registrarPrimeraLeccionDelDia,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};