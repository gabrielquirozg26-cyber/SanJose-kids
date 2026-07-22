import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import santosData from '../data/santos.json';

const ShopContext = createContext();

const MAX_VIDAS = 5;
const hoyStr = () => new Date().toISOString().split('T')[0];

const obtenerSantoPorRareza = (tipoCofre) => {
  let prob = { comun: 0, raro: 0, legendario: 0 };
  switch (tipoCofre) {
    case 'madera': prob = { comun: 0.85, raro: 0.15, legendario: 0 }; break;
    case 'plata': prob = { comun: 0.4, raro: 0.5, legendario: 0.1 }; break;
    case 'oro': prob = { comun: 0.2, raro: 0.5, legendario: 0.3 }; break;
    default: prob = { comun: 0.7, raro: 0.3, legendario: 0 };
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

export const ShopProvider = ({ children }) => {
  const { usuarioId, userDoc, setUserDoc, actualizarUserDoc } = useAuth();
  const [cofrePendiente, setCofrePendiente] = useState(null);
  const [coleccion, setColeccion] = useState([]);

  // ── Límites diarios ──
  const [corazonesCompradosHoy, setCorazonesCompradosHoy] = useState(0);
  const [ultimaFechaCompraCorazon, setUltimaFechaCompraCorazon] = useState(null);
  const [cofresMaderaCompradosHoy, setCofresMaderaCompradosHoy] = useState(0);
  const [cofresPlataCompradosHoy, setCofresPlataCompradosHoy] = useState(0);
  const [cofresOroCompradosHoy, setCofresOroCompradosHoy] = useState(0);
  const [ultimaFechaCofreMadera, setUltimaFechaCofreMadera] = useState(null);
  const [ultimaFechaCofrePlata, setUltimaFechaCofrePlata] = useState(null);
  const [ultimaFechaCofreOro, setUltimaFechaCofreOro] = useState(null);
  const [pocionesCompradasHoy, setPocionesCompradasHoy] = useState(0);
  const [ultimaFechaPocion, setUltimaFechaPocion] = useState(null);
  const [ultimoTiqueteOroUsado, setUltimoTiqueteOroUsado] = useState(null);

  // ── Cargar datos desde userDoc ──
  useEffect(() => {
    if (userDoc?.coleccion) setColeccion(userDoc.coleccion);
    if (userDoc) {
      setCorazonesCompradosHoy(userDoc.corazonComprasHoy || 0);
      setUltimaFechaCompraCorazon(userDoc.ultimaCompraCorazon || null);
      setCofresMaderaCompradosHoy(userDoc.cofresMaderaHoy || 0);
      setCofresPlataCompradosHoy(userDoc.cofresPlataHoy || 0);
      setCofresOroCompradosHoy(userDoc.cofresOroHoy || 0);
      setUltimaFechaCofreMadera(userDoc.ultimaFechaCofreMadera || null);
      setUltimaFechaCofrePlata(userDoc.ultimaFechaCofrePlata || null);
      setUltimaFechaCofreOro(userDoc.ultimaFechaCofreOro || null);
      setPocionesCompradasHoy(userDoc.pocionesHoy || 0);
      setUltimaFechaPocion(userDoc.ultimaFechaPocion || null);
      setUltimoTiqueteOroUsado(userDoc.ultimoTiqueteOroUsado || null);
    }
  }, [userDoc]);

  // ── Consumir item ──
  const consumirItem = async (itemId) => {
    if (!usuarioId) return false;
    const nuevoInventario = (userDoc?.inventario || []).filter(id => id !== itemId);
    await actualizarUserDoc({ inventario: nuevoInventario });
    setUserDoc(prev => ({ ...prev, inventario: nuevoInventario }));
    return true;
  };

  // ── Entregar santo ──
  const entregarSanto = async (tipoCofre) => {
    const santo = obtenerSantoPorRareza(tipoCofre);
    if (!santo) return null;
    const yaTiene = coleccion.includes(santo.id);
    if (yaTiene) {
      let compensacion = 50;
      if (santo.rareza === 'raro') compensacion = 100;
      if (santo.rareza === 'legendario') compensacion = 200;
      await actualizarUserDoc({ monedas: increment(compensacion), cofresAbiertos: increment(1) });
      return { tipo: 'repetido', santo, compensacion };
    } else {
      await actualizarUserDoc({ coleccion: arrayUnion(santo.id), cofresAbiertos: increment(1) });
      setColeccion(prev => [...prev, santo.id]);
      return { tipo: 'nuevo', santo };
    }
  };

  // ── Añadir vida ──
  const añadirVida = async () => {
    if (!usuarioId) return;
    const vp = userDoc?.vidasPerdidas ?? [];
    if (!vp.length) return;
    await actualizarUserDoc({ vidasPerdidas: [...vp].sort((a,b)=>a-b).slice(1) });
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
    if ((userDoc?.vidas || 5) >= MAX_VIDAS) return false;
    if ((userDoc?.monedas ?? 0) < 200) return false;
    
    await actualizarUserDoc({ monedas: increment(-200) });
    await añadirVida();
    setCorazonesCompradosHoy(prev => prev + 1);
    await actualizarUserDoc({
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
    
    await actualizarUserDoc({ monedas: increment(-250) });
    const santo = obtenerSantoPorRareza('madera');
    if (!santo) return false;
    
    const yaTiene = coleccion.includes(santo.id);
    if (yaTiene) {
      let compensacion = 50;
      if (santo.rareza === 'raro') compensacion = 100;
      else if (santo.rareza === 'legendario') compensacion = 200;
      await actualizarUserDoc({ monedas: increment(compensacion), cofresAbiertos: increment(1) });
      setCofrePendiente({ tipo: 'madera', recompensa: { tipo: 'repetido', santo, compensacion } });
    } else {
      await actualizarUserDoc({ coleccion: arrayUnion(santo.id), cofresAbiertos: increment(1) });
      setColeccion(prev => [...prev, santo.id]);
      setCofrePendiente({ tipo: 'madera', recompensa: { tipo: 'nuevo', santo } });
    }
    setCofresMaderaCompradosHoy(prev => prev + 1);
    await actualizarUserDoc({ cofresMaderaHoy: increment(1), ultimaFechaCofreMadera: hoy });
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
    
    await actualizarUserDoc({ monedas: increment(-350) });
    const santo = obtenerSantoPorRareza('plata');
    if (!santo) return false;
    
    const yaTiene = coleccion.includes(santo.id);
    if (yaTiene) {
      let compensacion = 100;
      if (santo.rareza === 'legendario') compensacion = 200;
      await actualizarUserDoc({ monedas: increment(compensacion), cofresAbiertos: increment(1) });
      setCofrePendiente({ tipo: 'plata', recompensa: { tipo: 'repetido', santo, compensacion } });
    } else {
      await actualizarUserDoc({ coleccion: arrayUnion(santo.id), cofresAbiertos: increment(1) });
      setColeccion(prev => [...prev, santo.id]);
      setCofrePendiente({ tipo: 'plata', recompensa: { tipo: 'nuevo', santo } });
    }
    setCofresPlataCompradosHoy(prev => prev + 1);
    await actualizarUserDoc({ cofresPlataHoy: increment(1), ultimaFechaCofrePlata: hoy });
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
    
    await actualizarUserDoc({ monedas: increment(-500) });
    const santo = obtenerSantoPorRareza('oro');
    if (!santo) return false;
    
    const yaTiene = coleccion.includes(santo.id);
    if (yaTiene) {
      let compensacion = 200;
      await actualizarUserDoc({ monedas: increment(compensacion), cofresAbiertos: increment(1) });
      setCofrePendiente({ tipo: 'oro', recompensa: { tipo: 'repetido', santo, compensacion } });
    } else {
      await actualizarUserDoc({ coleccion: arrayUnion(santo.id), cofresAbiertos: increment(1) });
      setColeccion(prev => [...prev, santo.id]);
      setCofrePendiente({ tipo: 'oro', recompensa: { tipo: 'nuevo', santo } });
    }
    setCofresOroCompradosHoy(prev => prev + 1);
    await actualizarUserDoc({ cofresOroHoy: increment(1), ultimaFechaCofreOro: hoy });
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
    
    await actualizarUserDoc({ monedas: increment(-150) });
    await actualizarUserDoc({ inventario: arrayUnion('pocion_sabiduria') });
    setUserDoc(prev => ({ ...prev, inventario: [...(prev?.inventario || []), 'pocion_sabiduria'] }));
    setPocionesCompradasHoy(prev => prev + 1);
    await actualizarUserDoc({ pocionesHoy: increment(1), ultimaFechaPocion: hoy });
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
    await actualizarUserDoc({ inventario: nuevoInventario });
    setUserDoc(prev => ({ ...prev, inventario: nuevoInventario }));
    
    const santo = obtenerSantoPorRareza('oro');
    if (!santo) return false;
    
    const yaTiene = coleccion.includes(santo.id);
    if (yaTiene) {
      let compensacion = 200;
      await actualizarUserDoc({ monedas: increment(compensacion), cofresAbiertos: increment(1) });
      setCofrePendiente({ tipo: 'oro', recompensa: { tipo: 'repetido', santo, compensacion } });
    } else {
      await actualizarUserDoc({ coleccion: arrayUnion(santo.id), cofresAbiertos: increment(1) });
      setColeccion(prev => [...prev, santo.id]);
      setCofrePendiente({ tipo: 'oro', recompensa: { tipo: 'nuevo', santo } });
    }
    setUltimoTiqueteOroUsado(hoy);
    await actualizarUserDoc({ ultimoTiqueteOroUsado: hoy });
    return true;
  };

  const comprarTiqueteOro = async () => {
    if (!usuarioId) return false;
    if ((userDoc?.monedas ?? 0) < 350) return false;
    await actualizarUserDoc({ monedas: increment(-350) });
    await actualizarUserDoc({ inventario: arrayUnion('tiquete_oro') });
    setUserDoc(prev => ({ ...prev, inventario: [...(prev?.inventario || []), 'tiquete_oro'] }));
    return true;
  };

  // ── Compra de objetos (cosméticos) ──
  const comprarItem = async (item) => {
    if (!usuarioId) return false;
    const inv = userDoc?.inventario ?? [];
    if (inv.includes(item.id)) return false;
    if ((userDoc?.monedas ?? 0) < item.precio) return false;
    
    await actualizarUserDoc({ monedas: increment(-item.precio) });
    await actualizarUserDoc({ inventario: arrayUnion(item.id) });
    setUserDoc(prev => ({ ...prev, inventario: [...(prev?.inventario || []), item.id] }));
    
    if (item.id === 'titulo_guardian') await actualizarUserDoc({ rango: 'Guardián del Credo' });
    if (item.id === 'titulo_maestro') await actualizarUserDoc({ rango: 'Maestro de la Fe' });
    return true;
  };

  // ── Oferta diaria ──
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

  const cerrarCofre = () => setCofrePendiente(null);

  const value = {
    cofrePendiente,
    setCofrePendiente,
    coleccion,
    setColeccion,
    
    corazonesCompradosHoy,
    cofresMaderaCompradosHoy,
    cofresPlataCompradosHoy,
    cofresOroCompradosHoy,
    pocionesCompradasHoy,
    ultimoTiqueteOroUsado,
    obtenerOfertaDiaria,
    consumirItem,
    entregarSanto,
    comprarCorazon,
    comprarCofreMadera,
    comprarCofrePlata,
    comprarCofreOro,
    comprarPocion,
    comprarTiqueteOro,
    usarTiqueteOro,
    comprarItem,
     // ✅ EXPUESTO
    cerrarCofre,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop debe usarse dentro de ShopProvider');
  }
  return context;
};