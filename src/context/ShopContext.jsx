// src/context/ShopContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import santosData from '../data/santos.json';
import { sendLocalNotification } from '../utils/serviceWorker';

const ShopContext = createContext();

const MAX_VIDAS = 5;
const MS_REGEN_VIDA = 4 * 60 * 60 * 1000;
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
  const [dobleXpCompradosHoy, setDobleXpCompradosHoy] = useState(0);
  const [ultimaFechaDobleXp, setUltimaFechaDobleXp] = useState(null);
  const [protectorRachaCompradosHoy, setProtectorRachaCompradosHoy] = useState(0);
  const [ultimaFechaProtectorRacha, setUltimaFechaProtectorRacha] = useState(null);

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
      setDobleXpCompradosHoy(userDoc.dobleXpHoy || 0);
      setUltimaFechaDobleXp(userDoc.ultimaFechaDobleXp || null);
      setProtectorRachaCompradosHoy(userDoc.protectorRachaHoy || 0);
      setUltimaFechaProtectorRacha(userDoc.ultimaFechaProtectorRacha || null);
    }
  }, [userDoc]);

  // ── CONSUMIR ITEM ──
  const consumirItem = async (itemId) => {
    if (!usuarioId) {
      console.warn('❌ consumirItem: usuarioId no disponible');
      return false;
    }
    
    const inventarioActual = userDoc?.inventario || [];
    
    if (!inventarioActual.includes(itemId)) {
      console.warn(`❌ Item ${itemId} no encontrado en inventario`);
      return false;
    }
    
    try {
      await actualizarUserDoc({ 
        inventario: arrayRemove(itemId) 
      });
      
      const nuevoInventario = inventarioActual.filter(id => id !== itemId);
      setUserDoc(prev => {
        if (!prev) return prev;
        return { 
          ...prev, 
          inventario: nuevoInventario 
        };
      });
      
      return true;
      
    } catch (error) {
      console.error('❌ Error al consumir item:', error);
      return false;
    }
  };

  // ── ENTREGAR SANTO ──
  const entregarSanto = async (tipoCofre) => {
    if (!usuarioId) {
      console.warn('⚠️ entregarSanto: usuarioId no disponible');
      return null;
    }

    const santo = obtenerSantoPorRareza(tipoCofre);
    if (!santo) {
      console.warn('⚠️ entregarSanto: no se pudo obtener un santo');
      return null;
    }

    const yaTiene = coleccion.includes(santo.id);

    if (yaTiene) {
      let compensacion = 50;
      if (santo.rareza === 'raro') compensacion = 100;
      if (santo.rareza === 'legendario') compensacion = 200;

      await actualizarUserDoc({
        monedas: increment(compensacion),
        cofresAbiertos: increment(1),
      });

      sendLocalNotification(
        `🔄 Santo repetido: ${santo.nombre}`,
        `Has recibido ${compensacion} monedas de compensación por ${santo.nombre}.`,
        '/album'
      );

      return { tipo: 'repetido', santo, compensacion };
    } else {
      await actualizarUserDoc({
        coleccion: arrayUnion(santo.id),
        cofresAbiertos: increment(1),
      });
      setColeccion((prev) => [...prev, santo.id]);

      sendLocalNotification(
        `🕊️ ¡Nuevo santo! ${santo.nombre}`,
        `Has desbloqueado a ${santo.nombre} (${santo.rareza.toUpperCase()})`,
        '/album'
      );

      return { tipo: 'nuevo', santo };
    }
  };

  // ── AÑADIR VIDA ──
  const añadirVida = async () => {
    if (!usuarioId) return false;
    const vp = userDoc?.vidasPerdidas ?? [];
    if (!vp.length) return false;
    try {
      await actualizarUserDoc({ vidasPerdidas: [...vp].sort((a,b)=>a-b).slice(1) });
      return true;
    } catch (error) {
      console.error('Error al añadir vida:', error);
      return false;
    }
  };

  // ── COMPRAR CORAZÓN ──
  const comprarCorazon = async () => {
    if (!usuarioId) {
      console.warn('❌ comprarCorazon: usuarioId no disponible');
      return false;
    }
    
    const hoy = hoyStr();
    
    if (ultimaFechaCompraCorazon !== hoy) {
      setCorazonesCompradosHoy(0);
      setUltimaFechaCompraCorazon(hoy);
      await actualizarUserDoc({ 
        corazonComprasHoy: 0,
        ultimaCompraCorazon: hoy 
      });
    }
    
    if (corazonesCompradosHoy >= 3) {
      console.warn('❌ comprarCorazon: límite diario alcanzado (3)');
      return false;
    }
    
    const vp = userDoc?.vidasPerdidas ?? [];
    const ahora = Date.now();
    const nuevas = vp.filter((ts) => ahora - ts < MS_REGEN_VIDA);
    const vidasActuales = Math.min(MAX_VIDAS, MAX_VIDAS - nuevas.length);
    
    if (vidasActuales >= MAX_VIDAS) {
      console.warn('❌ comprarCorazon: vidas completas');
      return false;
    }
    
    const monedasActuales = userDoc?.monedas || 0;
    if (monedasActuales < 150) {
      console.warn(`❌ comprarCorazon: monedas insuficientes (${monedasActuales}/150)`);
      return false;
    }
    
    try {
      await actualizarUserDoc({ monedas: increment(-150) });
      
      if (vp.length > 0) {
        const nuevasVidasPerdidas = [...vp].sort((a, b) => a - b).slice(1);
        await actualizarUserDoc({ vidasPerdidas: nuevasVidasPerdidas });
      } else {
        await actualizarUserDoc({ monedas: increment(150) });
        return false;
      }
      
      const nuevasCompras = corazonesCompradosHoy + 1;
      setCorazonesCompradosHoy(nuevasCompras);
      
      await actualizarUserDoc({
        corazonComprasHoy: nuevasCompras,
        ultimaCompraCorazon: hoy,
      });

      sendLocalNotification(
        '❤️ Corazón Extra',
        'Has recuperado 1 vida. ¡Sigue adelante en tu camino de fe!',
        '/'
      );
      
      return true;
      
    } catch (error) {
      console.error('❌ Error comprando corazón:', error);
      try {
        await actualizarUserDoc({ monedas: increment(150) });
      } catch (e) {
        console.error('❌ Error al devolver monedas:', e);
      }
      return false;
    }
  };

  // ── COMPRAR ESCUDO (se maneja con comprarItem) ──

  // ── COMPRAR POCIÓN ──
  const comprarPocion = async () => {
    if (!usuarioId) return false;
    const hoy = hoyStr();
    
    if (ultimaFechaPocion !== hoy) {
      setPocionesCompradasHoy(0);
      setUltimaFechaPocion(hoy);
    }
    if (pocionesCompradasHoy >= 2) {
      console.warn('❌ comprarPocion: límite diario alcanzado (2)');
      return false;
    }
    
    const cantidadActual = (userDoc?.inventario || []).filter(id => id === 'pocion_sabiduria').length;
    if (cantidadActual >= 3) {
      console.warn('❌ comprarPocion: inventario lleno (3)');
      return false;
    }
    if ((userDoc?.monedas ?? 0) < 120) {
      console.warn(`❌ comprarPocion: monedas insuficientes (${userDoc?.monedas}/120)`);
      return false;
    }
    
    try {
      await actualizarUserDoc({ monedas: increment(-120) });
      await actualizarUserDoc({ inventario: arrayUnion('pocion_sabiduria') });
      
      const nuevoInventario = [...(userDoc?.inventario || []), 'pocion_sabiduria'];
      setUserDoc((prev) => ({ ...prev, inventario: nuevoInventario }));
      
      const nuevasCompras = pocionesCompradasHoy + 1;
      setPocionesCompradasHoy(nuevasCompras);
      
      await actualizarUserDoc({ 
        pocionesHoy: nuevasCompras, 
        ultimaFechaPocion: hoy 
      });

      sendLocalNotification(
        '🧪 Poción de Sabiduría',
        'Has adquirido una poción. Úsala sabiamente en las lecciones.',
        '/tienda'
      );
      
      return true;
    } catch (error) {
      console.error('Error comprando poción:', error);
      return false;
    }
  };

  // ── COMPRAR DOBLE XP ──
  const comprarDobleXp = async () => {
    if (!usuarioId) {
      console.warn('❌ comprarDobleXp: usuarioId no disponible');
      return false;
    }
    
    const hoy = hoyStr();
    
    if (ultimaFechaDobleXp !== hoy) {
      setDobleXpCompradosHoy(0);
      setUltimaFechaDobleXp(hoy);
      await actualizarUserDoc({ 
        dobleXpHoy: 0,
        ultimaFechaDobleXp: hoy 
      });
    }
    
    if (dobleXpCompradosHoy >= 3) {
      console.warn('❌ comprarDobleXp: límite diario alcanzado (3)');
      return false;
    }
    
    if ((userDoc?.monedas ?? 0) < 80) {
      console.warn(`❌ comprarDobleXp: monedas insuficientes (${userDoc?.monedas}/80)`);
      return false;
    }
    
    try {
      await actualizarUserDoc({ monedas: increment(-80) });
      await actualizarUserDoc({ inventario: arrayUnion('doble_xp') });
      
      const nuevoInventario = [...(userDoc?.inventario || []), 'doble_xp'];
      setUserDoc((prev) => ({ ...prev, inventario: nuevoInventario }));
      
      const nuevasCompras = dobleXpCompradosHoy + 1;
      setDobleXpCompradosHoy(nuevasCompras);
      
      await actualizarUserDoc({ 
        dobleXpHoy: nuevasCompras, 
        ultimaFechaDobleXp: hoy 
      });

      sendLocalNotification(
        '⚡ Doble XP',
        'Has adquirido Doble XP para tu próxima lección.',
        '/tienda'
      );
      
      return true;
      
    } catch (error) {
      console.error('❌ Error comprando Doble XP:', error);
      return false;
    }
  };

  // ── COMPRAR PROTECTOR DE RACHA ──
  const comprarProtectorRacha = async () => {
    if (!usuarioId) {
      console.warn('❌ comprarProtectorRacha: usuarioId no disponible');
      return false;
    }
    
    const hoy = hoyStr();
    
    if (ultimaFechaProtectorRacha !== hoy) {
      setProtectorRachaCompradosHoy(0);
      setUltimaFechaProtectorRacha(hoy);
      await actualizarUserDoc({ 
        protectorRachaHoy: 0,
        ultimaFechaProtectorRacha: hoy 
      });
    }
    
    if (protectorRachaCompradosHoy >= 1) {
      console.warn('❌ comprarProtectorRacha: límite diario alcanzado (1)');
      return false;
    }
    
    if ((userDoc?.monedas ?? 0) < 100) {
      console.warn(`❌ comprarProtectorRacha: monedas insuficientes (${userDoc?.monedas}/100)`);
      return false;
    }
    
    try {
      await actualizarUserDoc({ monedas: increment(-100) });
      await actualizarUserDoc({ inventario: arrayUnion('protector_racha') });
      
      const nuevoInventario = [...(userDoc?.inventario || []), 'protector_racha'];
      setUserDoc((prev) => ({ ...prev, inventario: nuevoInventario }));
      
      const nuevasCompras = protectorRachaCompradosHoy + 1;
      setProtectorRachaCompradosHoy(nuevasCompras);
      
      await actualizarUserDoc({ 
        protectorRachaHoy: nuevasCompras, 
        ultimaFechaProtectorRacha: hoy 
      });

      sendLocalNotification(
        '🔥 Protector de Racha',
        'Tu racha está protegida por 1 día. ¡No la pierdas!',
        '/tienda'
      );
      
      return true;
      
    } catch (error) {
      console.error('❌ Error comprando Protector de Racha:', error);
      return false;
    }
  };

  // ── COMPRAR ITEM (cosméticos, escudo, etc.) ──
  const comprarItem = async (item) => {
    if (!usuarioId) return false;
    const inv = userDoc?.inventario ?? [];
    if (inv.includes(item.id)) {
      console.warn(`❌ comprarItem: ${item.id} ya está en el inventario`);
      return false;
    }
    if ((userDoc?.monedas ?? 0) < item.precio) {
      console.warn(`❌ comprarItem: monedas insuficientes (${userDoc?.monedas}/${item.precio})`);
      return false;
    }
    
    try {
      await actualizarUserDoc({ monedas: increment(-item.precio) });
      await actualizarUserDoc({ inventario: arrayUnion(item.id) });
      
      const nuevoInventario = [...(userDoc?.inventario || []), item.id];
      setUserDoc((prev) => ({ ...prev, inventario: nuevoInventario }));
      
      if (item.id === 'titulo_guardian') {
        await actualizarUserDoc({ rango: 'Guardián del Credo' });
      }
      if (item.id === 'titulo_maestro') {
        await actualizarUserDoc({ rango: 'Maestro de la Fe' });
      }

      const emojis = {
        escudo_miguel: '🛡️',
        aura_santidad: '✨',
        marco_vitral_azul: '🔵',
        marco_vitral_dorado: '🟡',
        titulo_guardian: '⚜️',
        titulo_maestro: '👑',
      };

      const emoji = emojis[item.id] || '🎁';

      sendLocalNotification(
        `${emoji} ${item.nombre}`,
        `Has adquirido ${item.nombre} para tu perfil. ¡Luce con orgullo tu fe!`,
        '/perfil'
      );
      
      return true;
    } catch (error) {
      console.error(`Error comprando ${item.nombre}:`, error);
      return false;
    }
  };

  // ── COMPRAR COFRES ──
  const comprarCofreMadera = async () => {
    if (!usuarioId) return false;
    const hoy = hoyStr();
    
    if (ultimaFechaCofreMadera !== hoy) {
      setCofresMaderaCompradosHoy(0);
      setUltimaFechaCofreMadera(hoy);
    }
    if (cofresMaderaCompradosHoy >= 3) {
      console.warn('❌ comprarCofreMadera: límite diario alcanzado (3)');
      return false;
    }
    if ((userDoc?.monedas ?? 0) < 200) {
      console.warn(`❌ comprarCofreMadera: monedas insuficientes (${userDoc?.monedas}/200)`);
      return false;
    }
    
    try {
      await actualizarUserDoc({ monedas: increment(-200) });
      const santo = obtenerSantoPorRareza('madera');
      if (!santo) return false;
      
      const yaTiene = coleccion.includes(santo.id);
      let recompensa;
      
      if (yaTiene) {
        let compensacion = 50;
        if (santo.rareza === 'raro') compensacion = 100;
        else if (santo.rareza === 'legendario') compensacion = 200;
        await actualizarUserDoc({ monedas: increment(compensacion), cofresAbiertos: increment(1) });
        recompensa = { tipo: 'repetido', santo, compensacion };
      } else {
        await actualizarUserDoc({ coleccion: arrayUnion(santo.id), cofresAbiertos: increment(1) });
        setColeccion(prev => [...prev, santo.id]);
        recompensa = { tipo: 'nuevo', santo };
      }
      
      const nuevasCompras = cofresMaderaCompradosHoy + 1;
      setCofresMaderaCompradosHoy(nuevasCompras);
      setCofrePendiente({ tipo: 'madera', recompensa });
      
      await actualizarUserDoc({ 
        cofresMaderaHoy: nuevasCompras, 
        ultimaFechaCofreMadera: hoy 
      });
      
      return true;
    } catch (error) {
      console.error('Error comprando cofre de madera:', error);
      return false;
    }
  };

  const comprarCofrePlata = async () => {
    if (!usuarioId) return false;
    const hoy = hoyStr();
    
    if (ultimaFechaCofrePlata !== hoy) {
      setCofresPlataCompradosHoy(0);
      setUltimaFechaCofrePlata(hoy);
    }
    if (cofresPlataCompradosHoy >= 2) {
      console.warn('❌ comprarCofrePlata: límite diario alcanzado (2)');
      return false;
    }
    if ((userDoc?.monedas ?? 0) < 300) {
      console.warn(`❌ comprarCofrePlata: monedas insuficientes (${userDoc?.monedas}/300)`);
      return false;
    }
    
    try {
      await actualizarUserDoc({ monedas: increment(-300) });
      const santo = obtenerSantoPorRareza('plata');
      if (!santo) return false;
      
      const yaTiene = coleccion.includes(santo.id);
      let recompensa;
      
      if (yaTiene) {
        let compensacion = 100;
        if (santo.rareza === 'legendario') compensacion = 200;
        await actualizarUserDoc({ monedas: increment(compensacion), cofresAbiertos: increment(1) });
        recompensa = { tipo: 'repetido', santo, compensacion };
      } else {
        await actualizarUserDoc({ coleccion: arrayUnion(santo.id), cofresAbiertos: increment(1) });
        setColeccion(prev => [...prev, santo.id]);
        recompensa = { tipo: 'nuevo', santo };
      }
      
      const nuevasCompras = cofresPlataCompradosHoy + 1;
      setCofresPlataCompradosHoy(nuevasCompras);
      setCofrePendiente({ tipo: 'plata', recompensa });
      
      await actualizarUserDoc({ 
        cofresPlataHoy: nuevasCompras, 
        ultimaFechaCofrePlata: hoy 
      });
      
      return true;
    } catch (error) {
      console.error('Error comprando cofre de plata:', error);
      return false;
    }
  };

  const comprarCofreOro = async () => {
    if (!usuarioId) return false;
    const hoy = hoyStr();
    
    if (ultimaFechaCofreOro !== hoy) {
      setCofresOroCompradosHoy(0);
      setUltimaFechaCofreOro(hoy);
    }
    if (cofresOroCompradosHoy >= 1) {
      console.warn('❌ comprarCofreOro: límite diario alcanzado (1)');
      return false;
    }
    if ((userDoc?.monedas ?? 0) < 450) {
      console.warn(`❌ comprarCofreOro: monedas insuficientes (${userDoc?.monedas}/450)`);
      return false;
    }
    
    try {
      await actualizarUserDoc({ monedas: increment(-450) });
      const santo = obtenerSantoPorRareza('oro');
      if (!santo) return false;
      
      const yaTiene = coleccion.includes(santo.id);
      let recompensa;
      
      if (yaTiene) {
        let compensacion = 200;
        await actualizarUserDoc({ monedas: increment(compensacion), cofresAbiertos: increment(1) });
        recompensa = { tipo: 'repetido', santo, compensacion };
      } else {
        await actualizarUserDoc({ coleccion: arrayUnion(santo.id), cofresAbiertos: increment(1) });
        setColeccion(prev => [...prev, santo.id]);
        recompensa = { tipo: 'nuevo', santo };
      }
      
      const nuevasCompras = cofresOroCompradosHoy + 1;
      setCofresOroCompradosHoy(nuevasCompras);
      setCofrePendiente({ tipo: 'oro', recompensa });
      
      await actualizarUserDoc({ 
        cofresOroHoy: nuevasCompras, 
        ultimaFechaCofreOro: hoy 
      });
      
      return true;
    } catch (error) {
      console.error('Error comprando cofre de oro:', error);
      return false;
    }
  };

  // ── OFERTA DIARIA ──
  const obtenerOfertaDiaria = () => {
    const hoy = new Date().toISOString().split('T')[0];
    const seed = hoy.split('-').join('');
    const items = [
      { id: 'corazon_extra', nombre: 'Corazón Extra', icono: '❤️', precioOriginal: 150, descuento: 30, precioOferta: 105 },
      { id: 'doble_xp', nombre: 'Doble XP', icono: '⚡', precioOriginal: 80, descuento: 25, precioOferta: 60 },
      { id: 'protector_racha', nombre: 'Protector de Racha', icono: '🔥', precioOriginal: 100, descuento: 20, precioOferta: 80 },
      { id: 'pocion_sabiduria', nombre: 'Poción de Sabiduría', icono: '🧪', precioOriginal: 120, descuento: 20, precioOferta: 96 },
    ];
    const idx = parseInt(seed.slice(-2)) % items.length;
    return items[idx];
  };

  const cerrarCofre = () => setCofrePendiente(null);

  // ── VALORES EXPUESTOS ──
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
    dobleXpCompradosHoy,
    protectorRachaCompradosHoy,
    obtenerOfertaDiaria,
    consumirItem,
    entregarSanto,
    comprarCorazon,
    comprarCofreMadera,
    comprarCofrePlata,
    comprarCofreOro,
    comprarPocion,
    comprarDobleXp,
    comprarProtectorRacha,
    comprarItem,
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