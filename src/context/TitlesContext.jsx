import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import titulosData from '../data/titulos.json';

const TitlesContext = createContext();

export const TitlesProvider = ({ children }) => {
  const { usuarioId, userDoc, setUserDoc, actualizarUserDoc } = useAuth();
  
  // Estados locales
  const [titulosDesbloqueados, setTitulosDesbloqueados] = useState([]);
  const [tituloEquipado, setTituloEquipado] = useState(null);
  const [marcosDesbloqueados, setMarcosDesbloqueados] = useState([]);
  const [marcoEquipado, setMarcoEquipado] = useState(null);
  const [logrosPendientes, setLogrosPendientes] = useState([]);
  const [tituloDesbloqueadoReciente, setTituloDesbloqueadoReciente] = useState({ mostrar: false, titulo: null });

  // Cargar datos desde userDoc
  useEffect(() => {
    if (userDoc) {
      setTitulosDesbloqueados(userDoc.titulosDesbloqueados || []);
      setTituloEquipado(userDoc.tituloEquipado || null);
      setMarcosDesbloqueados(userDoc.marcosDesbloqueados || []);
      setMarcoEquipado(userDoc.marcoEquipado || null);
      setLogrosPendientes(userDoc.logrosPendientes || []);
    }
  }, [userDoc]);

  // ── TÍTULOS ──
  const equiparTitulo = async (tituloId) => {
    if (!usuarioId) return false;
    try {
      await actualizarUserDoc({ tituloEquipado: tituloId });
      setTituloEquipado(tituloId);
      return true;
    } catch (error) {
      console.error('Error equipando título:', error);
      return false;
    }
  };

  const desbloquearTitulo = async (tituloId, nombreTitulo, rareza) => {
    if (!usuarioId) return false;
    
    // Verificar si ya lo tiene
    const yaTiene = titulosDesbloqueados.some(t => t.id === tituloId);
    if (yaTiene) return false;
    
    const nuevoTitulo = {
      id: tituloId,
      nombre: nombreTitulo,
      rareza: rareza || 'comun',
      fecha: new Date().toISOString()
    };
    
    const nuevosTitulos = [...titulosDesbloqueados, nuevoTitulo];
    
    try {
      await actualizarUserDoc({ titulosDesbloqueados: nuevosTitulos });
      setTitulosDesbloqueados(nuevosTitulos);
      
      // Si no tiene título equipado, equipar automáticamente
      if (!tituloEquipado) {
        await equiparTitulo(tituloId);
      }
      
      // Mostrar modal de desbloqueo
      setTituloDesbloqueadoReciente({ titulo: nuevoTitulo, mostrar: true });
      
      return true;
    } catch (error) {
      console.error('Error desbloqueando título:', error);
      return false;
    }
  };

  const comprarTituloLegendario = async (tituloId, nombreTitulo, rareza, precio) => {
    if (!usuarioId) return false;
    
    // Verificar si tiene suficientes monedas
    if ((userDoc?.monedas ?? 0) < precio) return false;
    
    // Verificar si ya lo tiene
    const yaTiene = titulosDesbloqueados.some(t => t.id === tituloId);
    if (yaTiene) return false;
    
    const nuevoTitulo = {
      id: tituloId,
      nombre: nombreTitulo,
      rareza: rareza || 'legendario',
      fecha: new Date().toISOString()
    };
    
    const nuevosTitulos = [...titulosDesbloqueados, nuevoTitulo];
    
    try {
      // Restar monedas y agregar título
      await actualizarUserDoc({
        monedas: increment(-precio),
        titulosDesbloqueados: nuevosTitulos
      });
      
      setTitulosDesbloqueados(nuevosTitulos);
      setUserDoc(prev => ({ 
        ...prev, 
        titulosDesbloqueados: nuevosTitulos,
        monedas: (prev?.monedas || 0) - precio 
      }));
      
      setTituloDesbloqueadoReciente({ titulo: nuevoTitulo, mostrar: true });
      
      return true;
    } catch (error) {
      console.error('Error comprando título legendario:', error);
      return false;
    }
  };

  // ── MARCOS ──
  const equiparMarco = async (marcoId) => {
    if (!usuarioId) return false;
    try {
      await actualizarUserDoc({ marcoEquipado: marcoId });
      setMarcoEquipado(marcoId);
      return true;
    } catch (error) {
      console.error('Error equipando marco:', error);
      return false;
    }
  };

  const desbloquearMarco = async (marcoId) => {
    if (!usuarioId) return false;
    
    const yaTiene = marcosDesbloqueados.includes(marcoId);
    if (yaTiene) return false;
    
    const nuevosMarcos = [...marcosDesbloqueados, marcoId];
    
    try {
      await actualizarUserDoc({ marcosDesbloqueados: nuevosMarcos });
      setMarcosDesbloqueados(nuevosMarcos);
      
      // Si no tiene marco equipado, equipar automáticamente
      if (!marcoEquipado) {
        await equiparMarco(marcoId);
      }
      
      return true;
    } catch (error) {
      console.error('Error desbloqueando marco:', error);
      return false;
    }
  };

  // ── LOGROS ──
  const canjearLogro = async (logroId) => {
    if (!usuarioId) return false;
    
    // Buscar el logro en la lista de pendientes
    const logro = logrosPendientes.find(l => l.id === logroId);
    if (!logro) return false;
    
    // Buscar el título correspondiente
    const tituloInfo = titulosData.porNivel.find(t => t.id === logroId);
    if (!tituloInfo) return false;
    
    // Desbloquear el título
    const desbloqueado = await desbloquearTitulo(
      tituloInfo.id,
      tituloInfo.nombre,
      tituloInfo.rareza
    );
    
    if (!desbloqueado) return false;
    
    // Eliminar el logro de pendientes
    const nuevosLogros = logrosPendientes.filter(l => l.id !== logroId);
    
    try {
      await actualizarUserDoc({ logrosPendientes: nuevosLogros });
      setLogrosPendientes(nuevosLogros);
      setUserDoc(prev => ({ ...prev, logrosPendientes: nuevosLogros }));
      return true;
    } catch (error) {
      console.error('Error canjeando logro:', error);
      return false;
    }
  };

  // ── AGREGAR LOGRO (desde completarNivel) ──
  const agregarLogroPendiente = async (tituloId) => {
    if (!usuarioId) return false;
    
    // Verificar si ya tiene el título o ya está pendiente
    const yaTieneTitulo = titulosDesbloqueados.some(t => t.id === tituloId);
    const yaHayLogro = logrosPendientes.some(l => l.id === tituloId);
    
    if (yaTieneTitulo || yaHayLogro) return false;
    
    const nuevoLogro = { 
      id: tituloId, 
      fecha: new Date().toISOString() 
    };
    
    const nuevosLogros = [...logrosPendientes, nuevoLogro];
    
    try {
      await actualizarUserDoc({ logrosPendientes: arrayUnion(nuevoLogro) });
      setLogrosPendientes(nuevosLogros);
      setUserDoc(prev => ({ 
        ...prev, 
        logrosPendientes: [...(prev?.logrosPendientes || []), nuevoLogro] 
      }));
      return true;
    } catch (error) {
      console.error('Error agregando logro pendiente:', error);
      return false;
    }
  };

  // ── MARCOS DESDE INVENTARIO ──
  const obtenerMarcosDesdeInventario = () => {
    const inventario = userDoc?.inventario || [];
    return inventario.filter(item => item.startsWith('marco_'));
  };

  // ── TÍTULOS POR NIVEL ──
  const obtenerTituloPorNivel = (nivel) => {
    return titulosData.porNivel.find(t => t.nivel === nivel);
  };

  // ── LISTA DE TÍTULOS LEGENDARIOS ──
  const titulosLegendarios = titulosData.legendarios || [];

  // ── LISTA DE TÍTULOS POR NIVEL ──
  const titulosPorNivel = titulosData.porNivel || [];

  const value = {
    // Estado
    titulosDesbloqueados,
    tituloEquipado,
    marcosDesbloqueados,
    marcoEquipado,
    logrosPendientes,
    tituloDesbloqueadoReciente,
    setTituloDesbloqueadoReciente,
    
    // Funciones de títulos
    equiparTitulo,
    desbloquearTitulo,
    comprarTituloLegendario,
    obtenerTituloPorNivel,
    
    // Funciones de marcos
    equiparMarco,
    desbloquearMarco,
    obtenerMarcosDesdeInventario,
    
    // Funciones de logros
    canjearLogro,
    agregarLogroPendiente,
    
    // Datos estáticos
    titulosLegendarios,
    titulosPorNivel,
    titulosData,
  };

  return <TitlesContext.Provider value={value}>{children}</TitlesContext.Provider>;
};

export const useTitles = () => {
  const context = useContext(TitlesContext);
  if (!context) {
    throw new Error('useTitles debe usarse dentro de TitlesProvider');
  }
  return context;
};