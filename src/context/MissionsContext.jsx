import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGame } from './GameContext';
import { db } from '../firebase';
import { doc, updateDoc, getDoc, increment } from 'firebase/firestore';

const MissionsContext = createContext();

export const MISIONES_DIARIAS = [
  { id: 'd1', icono: '📖', titulo: 'Estudiante Fiel', descripcion: 'Completa 3 lecciones hoy', tipo: 'lecciones', meta: 3, recompensa: 50 },
  { id: 'd2', icono: '🪙', titulo: 'Coleccionista', descripcion: 'Gana 100 monedas en un día', tipo: 'monedas', meta: 100, recompensa: 30 },
  { id: 'd3', icono: '⚡', titulo: 'Relámpago de Fe', descripcion: 'Completa 1 lección sin errores', tipo: 'perfectas', meta: 1, recompensa: 40 },
  { id: 'd4', icono: '🔥', titulo: 'Guardián de Racha', descripcion: 'Mantén tu racha activa hoy', tipo: 'racha', meta: 1, recompensa: 25 },
];

export const MISIONES_SEMANALES = [
  { id: 's1', icono: '🏆', titulo: 'Campeón Semanal', descripcion: 'Completa 15 lecciones esta semana', tipo: 'lecciones', meta: 15, recompensa: 200 },
  { id: 's2', icono: '📿', titulo: 'Devoto del Rosario', descripcion: 'Completa 5 niveles distintos', tipo: 'niveles', meta: 5, recompensa: 150 },
  { id: 's3', icono: '💰', titulo: 'Tesorero', descripcion: 'Acumula 500 monedas esta semana', tipo: 'monedas', meta: 500, recompensa: 100 },
  { id: 's4', icono: '🌟', titulo: 'Luz de la Semana', descripcion: 'Juega 5 días seguidos', tipo: 'racha_semanal', meta: 5, recompensa: 300 },
];

const hoyStr = () => new Date().toISOString().split('T')[0];
const semanaStr = () => {
  const d = new Date();
  const dia = d.getDay() || 7;
  d.setDate(d.getDate() - dia + 1);
  return d.toISOString().split('T')[0];
};

const initProgreso = (misiones) => {
  return Object.fromEntries(misiones.map(m => [m.id, { progreso: 0, reclamada: false }]));
};

export const MissionsProvider = ({ children }) => {
  const { usuarioId } = useGame();
  const [misionesState, setMisionesState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para inicializar misiones
  const inicializarMisiones = () => {
    return {
      diaActual: hoyStr(),
      semanaActual: semanaStr(),
      diarias: initProgreso(MISIONES_DIARIAS),
      semanales: initProgreso(MISIONES_SEMANALES),
    };
  };

  // Cargar misiones desde Firestore
  useEffect(() => {
    if (!usuarioId) {
      setMisionesState(null);
      setLoading(false);
      return;
    }

    const cargarMisiones = async () => {
      try {
        console.log('🔄 Cargando misiones para usuario:', usuarioId);
        const docRef = doc(db, 'usuarios', usuarioId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('📄 Datos del usuario:', data);
          
          let misiones = data.misiones || {};
          console.log('📋 Misiones en Firestore:', misiones);
          
          // Si misiones está vacío o no tiene la estructura correcta, inicializar
          if (!misiones.diaActual || !misiones.diarias || Object.keys(misiones.diarias).length === 0) {
            console.log('🔄 Inicializando misiones para usuario (vacías)');
            misiones = inicializarMisiones();
            await updateDoc(docRef, { misiones });
          }
          
          // Verificar si hay que resetear diarias
          const hoy = hoyStr();
          const semana = semanaStr();
          let necesitaActualizacion = false;
          const nuevo = { ...misiones };

          if (misiones.diaActual !== hoy) {
            console.log('🔄 Resetear misiones diarias (nuevo día)');
            nuevo.diaActual = hoy;
            nuevo.diarias = initProgreso(MISIONES_DIARIAS);
            necesitaActualizacion = true;
          }
          if (misiones.semanaActual !== semana) {
            console.log('🔄 Resetear misiones semanales (nueva semana)');
            nuevo.semanaActual = semana;
            nuevo.semanales = initProgreso(MISIONES_SEMANALES);
            necesitaActualizacion = true;
          }

          if (necesitaActualizacion) {
            console.log('💾 Guardando misiones actualizadas');
            await updateDoc(docRef, { misiones: nuevo });
            setMisionesState(nuevo);
          } else {
            console.log('✅ Misiones cargadas correctamente:', misiones);
            setMisionesState(misiones);
          }
        } else {
          // Usuario no tiene documento - crear uno
          console.log('🔄 Creando documento de usuario con misiones');
          const inicial = inicializarMisiones();
          await updateDoc(doc(db, 'usuarios', usuarioId), { misiones: inicial });
          setMisionesState(inicial);
        }
      } catch (error) {
        console.error('❌ Error cargando misiones:', error);
        // Si hay error, inicializar misiones localmente
        const inicial = inicializarMisiones();
        setMisionesState(inicial);
      } finally {
        setLoading(false);
      }
    };

    cargarMisiones();
  }, [usuarioId]);

  // Avanzar una misión específica
  const avanzarMision = async (tipo, cantidad = 1) => {
    if (!usuarioId || !misionesState) {
      console.warn('⚠️ No se puede avanzar misión: usuario o misionesState null');
      return;
    }

    try {
      console.log(`📈 Avanzando misión: ${tipo} +${cantidad}`);
      const nuevo = JSON.parse(JSON.stringify(misionesState));
      let hayCambios = false;

      const actualizar = (grupo, misionesDef) => {
        misionesDef.forEach(def => {
          const mision = nuevo[grupo]?.[def.id];
          if (!mision || mision.reclamada || def.tipo !== tipo) return;
          const nuevoProgreso = Math.min(mision.progreso + cantidad, def.meta);
          if (nuevoProgreso !== mision.progreso) {
            mision.progreso = nuevoProgreso;
            hayCambios = true;
            console.log(`   📊 ${def.id}: ${mision.progreso} → ${nuevoProgreso}`);
          }
        });
      };

      actualizar('diarias', MISIONES_DIARIAS);
      actualizar('semanales', MISIONES_SEMANALES);

      if (hayCambios) {
        console.log('💾 Guardando progreso de misiones');
        setMisionesState(nuevo);
        await updateDoc(doc(db, 'usuarios', usuarioId), { misiones: nuevo });
      }
    } catch (error) {
      console.error('❌ Error avanzando misión:', error);
    }
  };

  // Reclamar una misión completada
  const reclamarMision = async (grupo, id, recompensa) => {
    if (!usuarioId || !misionesState) return false;

    try {
      const mision = misionesState[grupo]?.[id];
      if (!mision || mision.reclamada) return false;
      
      const meta = grupo === 'diarias' 
        ? MISIONES_DIARIAS.find(d => d.id === id)?.meta 
        : MISIONES_SEMANALES.find(s => s.id === id)?.meta;
      
      if (mision.progreso < meta) return false;

      const nuevo = JSON.parse(JSON.stringify(misionesState));
      nuevo[grupo][id].reclamada = true;
      
      setMisionesState(nuevo);
      await updateDoc(doc(db, 'usuarios', usuarioId), { misiones: nuevo });
      
      // Sumar recompensa
      const userRef = doc(db, 'usuarios', usuarioId);
      await updateDoc(userRef, { monedas: increment(recompensa) });
      
      console.log(`💰 Misión reclamada: ${id} +${recompensa} monedas`);
      return true;
    } catch (error) {
      console.error('❌ Error reclamando misión:', error);
      return false;
    }
  };

  const value = {
    misionesState,
    loading,
    avanzarMision,
    reclamarMision,
    MISIONES_DIARIAS,
    MISIONES_SEMANALES,
  };

  return (
    <MissionsContext.Provider value={value}>
      {children}
    </MissionsContext.Provider>
  );
};

export const useMissions = () => {
  const context = useContext(MissionsContext);
  if (!context) {
    throw new Error('useMissions debe usarse dentro de MissionsProvider');
  }
  return context;
};
