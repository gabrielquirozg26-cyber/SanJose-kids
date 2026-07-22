// src/components/catequista/PerfilCatequista.jsx
import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useToast } from '../../components/ui/Toast';
import AvatarSelector from '../../components/AvatarSelector';

const PerfilCatequista = () => {
  const { showToast } = useToast();
  const { nombre, grupo, rol, userDoc, usuarioId } = useGame();
  const { actualizarAvatar } = useAuth();
  const [selectorAbierto, setSelectorAbierto] = useState(false);
  const [biografia, setBiografia] = useState(userDoc?.biografia || '');
  const [editando, setEditando] = useState(false);

  const avatar = userDoc?.avatar || '👨‍🏫';
  const esImagen = avatar?.startsWith('data:image') || avatar?.startsWith('http') || avatar?.startsWith('/images/');

  const guardarBiografia = async () => {
    if (usuarioId) {
      await updateDoc(doc(db, 'usuarios', usuarioId), { biografia });
      showToast('📝 Biografía guardada', 'success');
    }
    setEditando(false);
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 border border-white/10 text-center">
        {/* Avatar */}
        <div className="relative inline-block cursor-pointer" onClick={() => setSelectorAbierto(true)}>
          <div className="w-24 h-24 rounded-full border-4 border-yellow-400/60 bg-white/10 flex items-center justify-center text-5xl overflow-hidden hover:scale-105 transition-all">
            {esImagen ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{avatar}</span>
            )}
          </div>
          <div className="absolute bottom-0 right-0 bg-yellow-400 text-black rounded-full px-2 py-0.5 text-[8px] font-black">✏️</div>
        </div>

        <h2 className="text-2xl font-black text-white mt-3">{nombre}</h2>
        <p className="text-yellow-400 text-sm font-black">{rol === 'coordinador' ? 'Coordinador' : 'Catequista'}</p>
        <p className="text-white/40 text-sm">Grupo: {grupo}</p>
      </div>

      {/* Biografía */}
      <div className="glass-card rounded-2xl p-5 border border-white/10">
        <div className="flex justify-between items-center">
          <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest">📝 Biografía</p>
          {!editando ? (
            <button onClick={() => setEditando(true)} className="text-white/40 hover:text-white text-xs">✏️ Editar</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={guardarBiografia} className="text-green-400 text-xs hover:text-green-300">✓ Guardar</button>
              <button onClick={() => { setEditando(false); setBiografia(userDoc?.biografia || ''); }} className="text-red-400 text-xs hover:text-red-300">✗ Cancelar</button>
            </div>
          )}
        </div>
        {editando ? (
          <textarea
            value={biografia}
            onChange={e => setBiografia(e.target.value.slice(0, 120))}
            maxLength="120"
            className="w-full bg-white/10 rounded-xl p-3 text-sm text-white mt-2 outline-none focus:border-yellow-400 border border-transparent focus:border-yellow-400 transition-all"
            rows="3"
            placeholder="Escribe algo sobre ti..."
          />
        ) : (
          <p className="text-white/80 text-sm mt-2 leading-relaxed">{biografia || '✨ Catequista comprometido con la formación de los niños.'}</p>
        )}
      </div>

      <AvatarSelector isOpen={selectorAbierto} onClose={() => setSelectorAbierto(false)} onSelectAvatar={actualizarAvatar} />
    </div>
  );
};

export default PerfilCatequista;