import { createContext, useContext, useMemo } from 'react';
import { useGame } from './GameContext';
import { db } from '../firebase';
import { doc, runTransaction } from 'firebase/firestore';
import { MISIONES_DIARIAS, MISIONES_SEMANALES } from '../data/misiones';
import { useFechaJuego } from '../hooks/useFechaJuego';
import { operarUsuario, normalizarMisiones, avanzarMisiones, reclamarPremioMision } from '../utils/economia';

export { MISIONES_DIARIAS, MISIONES_SEMANALES } from '../data/misiones';
const definiciones = { diarias: MISIONES_DIARIAS, semanales: MISIONES_SEMANALES };
const MissionsContext = createContext();

export const MissionsProvider = ({ children }) => {
  const { usuarioId, userDoc } = useGame();
  const hoy = useFechaJuego();
  const misionesState = useMemo(() => userDoc ? normalizarMisiones(userDoc.misiones, definiciones, hoy) : null, [userDoc, hoy]);

  const ejecutar = operacion => {
    if (!usuarioId) throw new Error('Inicia sesión para continuar.');
    return runTransaction(db, tx => operarUsuario(tx, doc(db, 'usuarios', usuarioId), operacion));
  };

  const avanzarMision = (tipo, cantidad = 1, leccionId) =>
    ejecutar(data => avanzarMisiones(data, definiciones, tipo, cantidad, undefined, leccionId));

  const reclamarMision = async (grupo, id) => {
    try {
      return await ejecutar(data => reclamarPremioMision(data, definiciones, grupo, id));
    } catch (error) {
      console.error('No se pudo reclamar la misión:', error);
      return false;
    }
  };

  return (
    <MissionsContext.Provider value={{
      misionesState, loading: !userDoc && !!usuarioId, avanzarMision, reclamarMision,
      MISIONES_DIARIAS, MISIONES_SEMANALES,
    }}>{children}</MissionsContext.Provider>
  );
};

export const useMissions = () => {
  const context = useContext(MissionsContext);
  if (!context) throw new Error('useMissions debe usarse dentro de MissionsProvider');
  return context;
};
