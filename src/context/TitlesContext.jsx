import { logrosDisponibles } from '../utils/aprendizaje';
import { createContext, useContext, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, runTransaction } from 'firebase/firestore';
import titulosData from '../data/titulos.json';
import { operarUsuario, comprarTitulo, canjearTitulo } from '../utils/economia';

const TitlesContext = createContext();

export const TitlesProvider = ({ children }) => {
  const { usuarioId, userDoc } = useAuth();
  const [eventoTitulo, setEventoTitulo] = useState(null);
  const tituloDesbloqueadoReciente = eventoTitulo?.usuarioId === usuarioId ? eventoTitulo : { mostrar: false, titulo: null };
  const setTituloDesbloqueadoReciente = evento => setEventoTitulo({ ...evento, usuarioId });
  const marcosDesbloqueados = useMemo(() => [...new Set([
    ...(userDoc?.marcosDesbloqueados ?? []),
    ...(userDoc?.inventario ?? []).filter(id => id.startsWith('marco_')),
  ])], [userDoc]);

  const ejecutar = operacion => {
    if (!usuarioId) throw new Error('Inicia sesión para continuar.');
    return runTransaction(db, tx => operarUsuario(tx, doc(db, 'usuarios', usuarioId), operacion));
  };
  const intentar = async operacion => {
    try { return await ejecutar(operacion); }
    catch (error) { console.error('No se pudo guardar el título o marco:', error); return false; }
  };

  const comprarTituloLegendario = async id => {
    const titulo = titulosData.legendarios.find(t => t.id === id);
    const nuevo = await ejecutar(data => comprarTitulo(data, titulo));
    setTituloDesbloqueadoReciente({ mostrar: true, titulo: nuevo });
    return true;
  };

  const canjearLogro = async id => {
    const titulo = titulosData.porNivel.find(t => t.id === id);
    const nuevo = await intentar(data => canjearTitulo({ ...data, logrosPendientes: logrosDisponibles(data) }, titulo));
    if (!nuevo) return false;
    setTituloDesbloqueadoReciente({ mostrar: true, titulo: nuevo });
    return true;
  };

  const equiparTitulo = id => intentar(data => {
    if (!(data.titulosDesbloqueados ?? []).some(t => t.id === id)) return { resultado: false };
    return { cambios: { tituloEquipado: id }, resultado: true };
  });
  const equiparMarco = id => intentar(data => {
    if (!(data.marcosDesbloqueados ?? []).includes(id) && !(data.inventario ?? []).includes(id)) return { resultado: false };
    return { cambios: { marcoEquipado: id }, resultado: true };
  });
  const agregarLogroPendiente = id => intentar(data => {
    if (!titulosData.porNivel.some(t => t.id === id) ||
        (data.titulosDesbloqueados ?? []).some(t => t.id === id) ||
        (data.logrosPendientes ?? []).some(t => t.id === id)) return { resultado: false };
    return { cambios: { logrosPendientes: [...(data.logrosPendientes ?? []), { id, fecha: new Date().toISOString() }] }, resultado: true };
  });

  return <TitlesContext.Provider value={{
    titulosDesbloqueados: userDoc?.titulosDesbloqueados ?? [],
    tituloEquipado: userDoc?.tituloEquipado ?? null,
    marcosDesbloqueados, marcoEquipado: userDoc?.marcoEquipado ?? null,
    logrosPendientes: logrosDisponibles(userDoc ?? {}),
    tituloDesbloqueadoReciente, setTituloDesbloqueadoReciente,
    equiparTitulo, equiparMarco, comprarTituloLegendario, canjearLogro,
    desbloquearTitulo: canjearLogro,
    agregarLogroPendiente,
    obtenerMarcosDesdeInventario: () => (userDoc?.inventario ?? []).filter(id => id.startsWith('marco_')),
    obtenerTituloPorNivel: nivel => titulosData.porNivel.find(t => t.nivel === nivel),
    titulosLegendarios: titulosData.legendarios,
    titulosPorNivel: titulosData.porNivel,
    titulosData,
  }}>{children}</TitlesContext.Provider>;
};

export const useTitles = () => {
  const context = useContext(TitlesContext);
  if (!context) throw new Error('useTitles debe usarse dentro de TitlesProvider');
  return context;
};
