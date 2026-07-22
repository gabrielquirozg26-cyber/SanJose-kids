// src/components/catequista/CatequistasGrupo.jsx
import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';

const CatequistasGrupo = () => {
  const { grupo } = useGame();
  const [catequistas, setCatequistas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const q = query(
          collection(db, 'usuarios'),
          where('grupo', '==', grupo),
          where('rol', 'in', ['catequista', 'coordinador'])
        );
        const snapshot = await getDocs(q);
        setCatequistas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error cargando catequistas:', error);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [grupo]);

  if (cargando) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (catequistas.length === 0) {
    return (
      <div className="glass-card p-8 text-center border border-white/10">
        <p className="text-4xl mb-3">👨‍🏫</p>
        <p className="text-white font-black">No hay catequistas en este grupo</p>
        <p className="text-white/40 text-sm">Solo aparecerán los catequistas asignados a tu grupo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-black text-white tracking-tighter">👨‍🏫 Catequistas del Grupo</h2>
        <span className="bg-yellow-400/20 text-yellow-400 text-xs font-black px-2 py-0.5 rounded-full">{catequistas.length}</span>
      </div>
      <p className="text-white/40 text-sm">Catequistas que dirigen el grupo {grupo}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {catequistas.map((catequista, index) => {
          const avatar = catequista.avatar || '👨‍🏫';
          const esImagen = avatar?.startsWith('data:image') || avatar?.startsWith('http') || avatar?.startsWith('/images/');

          return (
            <motion.div
              key={catequista.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-2xl p-4 border border-white/10 hover:border-yellow-400/30 hover:scale-[1.02] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-3xl overflow-hidden border-2 border-yellow-400/30">
                  {esImagen ? (
                    <img src={avatar} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <span>{avatar}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-white text-lg truncate">{catequista.nombre}</p>
                  <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest">
                    {catequista.rol === 'coordinador' ? 'Coordinador' : 'Catequista'}
                  </p>
                  <p className="text-white/30 text-[8px]">📧 {catequista.email}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CatequistasGrupo;