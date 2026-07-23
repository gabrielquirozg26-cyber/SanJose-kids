// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
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
  getDoc, 
  updateDoc, 
  onSnapshot,
  increment,
  arrayUnion
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
  const _aplicarRegenVidas = async (uid, data) => {
    const vp = data.vidasPerdidas ?? [];
    if (!vp.length) {
      setVidasM(MAX_VIDAS);
      return;
    }
    
    const ahora = Date.now();
    const nuevas = vp.filter(ts => ahora - ts < MS_REGEN_VIDA);
    const vidasCalculadas = Math.min(MAX_VIDAS, MAX_VIDAS - nuevas.length);
    
    if (nuevas.length !== vp.length) {
      await updateDoc(doc(db, 'usuarios', uid), { vidasPerdidas: nuevas });
    }
    
    setVidasM(vidasCalculadas);
  };

  // ════════════════════════════════════════════════════════════════════════
  // 🔥 VERIFICAR RACHA - MODIFICADO PARA USAR protector_racha
  // ════════════════════════════════════════════════════════════════════════
  const _verificarRacha = async (uid, data) => {
    const hoy = hoyStr();
    
    // ✅ Si ya jugó hoy, no hacer nada
    if (data.jugóHoy === hoy) return;
    
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const ayerStr = ayer.toISOString().split('T')[0];
    
    // ✅ Verificar si tiene protector de racha
    const tieneProtector = (data.inventario ?? []).includes('protector_racha');
    
    // Si no jugó ayer y no jugó hoy (es decir, se saltó un día)
    if (data.jugóHoy !== ayerStr && data.jugóHoy !== null) {
      if (tieneProtector) {
        // ✅ Tiene protector → Consumirlo y NO reiniciar racha
        console.log('🛡️ Protector de Racha activado para:', uid);
        await updateDoc(doc(db, 'usuarios', uid), { 
          inventario: (data.inventario ?? []).filter(i => i !== 'protector_racha')
        });
      } else {
        // ❌ Sin protector → Reiniciar racha
        console.log('❌ Racha reiniciada para:', uid);
        await updateDoc(doc(db, 'usuarios', uid), { racha: 0 });
      }
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
  let restandoVida = false;

  const restarVida = async () => {
    if (restandoVida) {
      console.warn('⚠️ restarVida ya está en proceso');
      return;
    }
    
    if (!usuarioId) {
      console.warn('⚠️ restarVida: usuarioId no disponible');
      return;
    }
    
    if (vidasMostradas <= 0) {
      console.warn('⚠️ restarVida: sin vidas disponibles');
      return;
    }
    
    restandoVida = true;
    
    try {
      const vp = userDoc?.vidasPerdidas ?? [];
      const nuevasVidasPerdidas = [...vp, Date.now()];
      
      await actualizarUserDoc({
        vidasPerdidas: nuevasVidasPerdidas
      });
      
    } catch (error) {
      console.error('❌ Error al restar vida:', error);
    } finally {
      restandoVida = false;
    }
  };

  const añadirVida = async () => {
    if (!usuarioId) return;
    
    const vp = userDoc?.vidasPerdidas ?? [];
    if (!vp.length) return;
    
    try {
      const nuevasVidasPerdidas = [...vp].sort((a, b) => a - b).slice(1);
      
      await actualizarUserDoc({
        vidasPerdidas: nuevasVidasPerdidas
      });
      
    } catch (error) {
      console.error('❌ Error al añadir vida:', error);
    }
  };

  const minutosHastaVida = () => {
    const vp = userDoc?.vidasPerdidas ?? [];
    if (!vp.length) return 0;
    
    const masReciente = Math.max(...vp);
    const tiempoRestante = MS_REGEN_VIDA - (Date.now() - masReciente);
    
    if (tiempoRestante <= 0) return 0;
    return Math.ceil(tiempoRestante / 60000);
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
    const hoy = hoyStr();
    if (userDoc?.ultimaPrimeraLeccion === hoy) return false;
    
    const rachaActual = userDoc?.racha || 0;
    let recompensa = 50;
    if (rachaActual >= 7) recompensa = 200;
    else if (rachaActual >= 3) recompensa = 100;
    
    await actualizarUserDoc({ monedas: increment(recompensa) });
    await actualizarUserDoc({ ultimaPrimeraLeccion: hoy });
    
    return { monedas: recompensa, racha: rachaActual };
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