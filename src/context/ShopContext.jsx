import { createContext, useContext, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, runTransaction } from 'firebase/firestore';
import santosData from '../data/santos.json';
import { MISIONES_DIARIAS, MISIONES_SEMANALES } from '../data/misiones';
import { useFechaJuego } from '../hooks/useFechaJuego';
import { sendLocalNotification } from '../utils/serviceWorker';
import {
  PRODUCTOS, ofertaDelDia, comprasDelDia, prepararCompra,
  operarUsuario, consumirUnidad, entregarColeccionable, seleccionarSanto,
} from '../utils/economia';

const ShopContext = createContext();
const definiciones = { diarias: MISIONES_DIARIAS, semanales: MISIONES_SEMANALES };

export const ShopProvider = ({ children }) => {
  const { usuarioId, userDoc } = useAuth();
  const [cofreGuardado, setCofreGuardado] = useState(null);
  const cofrePendiente = cofreGuardado?.usuarioId === usuarioId ? cofreGuardado : null;
  const setCofrePendiente = cofre => setCofreGuardado(cofre ? { ...cofre, usuarioId } : null);
  const compraEnCurso = useRef(false);
  const hoy = useFechaJuego();

  const ejecutar = (operacion) => {
    if (!usuarioId) throw new Error('Inicia sesión para continuar.');
    return runTransaction(db, tx => operarUsuario(tx, doc(db, 'usuarios', usuarioId), operacion));
  };

  const comprar = async (id, opciones = {}) => {
    if (compraEnCurso.current) throw new Error('Espera a que termine la compra anterior.');
    compraEnCurso.current = true;
    try {
      const tipo = PRODUCTOS[id]?.cofre;
      // La selección no se repite cuando Firestore reintenta la transacción.
      const santo = tipo ? seleccionarSanto(santosData.santos, tipo) : undefined;
      const resultado = await ejecutar(data => prepararCompra(data, id, { ...opciones, santo, definiciones }));
      if (resultado.recompensa) setCofrePendiente({ tipo, recompensa: resultado.recompensa });
      void sendLocalNotification('Compra completada', 'Tu compra se guardó correctamente.', '/');
      return true;
    } finally {
      compraEnCurso.current = false;
    }
  };

  const consumirItem = (id) => ejecutar(data => consumirUnidad(data, id));
  const entregarSanto = (tipo) => {
    const santo = seleccionarSanto(santosData.santos, tipo);
    return ejecutar(data => entregarColeccionable(data, santo));
  };

  const value = {
    cofrePendiente,
    setCofrePendiente,
    coleccion: userDoc?.coleccion ?? [],
    corazonesCompradosHoy: comprasDelDia(userDoc, 'corazon_extra', hoy),
    cofresMaderaCompradosHoy: comprasDelDia(userDoc, 'cofre_madera', hoy),
    cofresPlataCompradosHoy: comprasDelDia(userDoc, 'cofre_plata', hoy),
    cofresOroCompradosHoy: comprasDelDia(userDoc, 'cofre_oro', hoy),
    pocionesCompradasHoy: comprasDelDia(userDoc, 'pocion_sabiduria', hoy),
    dobleXpCompradosHoy: comprasDelDia(userDoc, 'doble_xp', hoy),
    protectorRachaCompradosHoy: comprasDelDia(userDoc, 'protector_racha', hoy),
    obtenerOfertaDiaria: () => ofertaDelDia(hoy),
    comprarOferta: id => comprar(id, { oferta: true }),
    consumirItem,
    entregarSanto,
    comprarCorazon: () => comprar('corazon_extra'),
    comprarPocion: () => comprar('pocion_sabiduria'),
    comprarDobleXp: () => comprar('doble_xp'),
    comprarProtectorRacha: () => comprar('protector_racha'),
    comprarItem: item => comprar(item.id),
    comprarCofreMadera: () => comprar('cofre_madera'),
    comprarCofrePlata: () => comprar('cofre_plata'),
    comprarCofreOro: () => comprar('cofre_oro'),
    cerrarCofre: () => setCofrePendiente(null),
  };
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop debe usarse dentro de ShopProvider');
  return context;
};
