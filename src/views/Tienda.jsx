import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import confetti from 'canvas-confetti';

const RAREZA_CLASES = {
  comun: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  raro: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  epico: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
  legendario: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
};

const Toast = ({ mensaje, tipo }) => (
  <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl font-black text-sm shadow-2xl animate-slide-up bg-black/80 backdrop-blur border border-white/20">
    {mensaje}
  </div>
);

const Tienda = () => {
  const {
    monedas,
    vidas,
    inventario,
    comprarItem,
    comprarCorazon,
    usarTiqueteOro,
    obtenerOfertaDiaria,
    corazonesCompradosHoy,
    actualizarAvatar,
    userDoc,
    abrirCofreOro,   // ← Agrega esta línea
    sumarMonedas,    // ← Agrega esta línea
  } = useGame();

  const [toast, setToast] = useState(null);
  const [comprando, setComprando] = useState(null);

  const mostrarToast = (mensaje) => {
    setToast(mensaje);
    setTimeout(() => setToast(null), 2500);
  };

  // Catálogo de objetos consumibles
  const consumibles = [
    {
      id: 'corazon_extra',
      nombre: 'Corazón Extra',
      icono: '❤️',
      descripcion: 'Recupera 1 vida. Máx 3 por día.',
      precio: 200,
      rareza: 'comun',
      tipo: 'consumible',
      action: async () => {
        if (vidas >= 5) {
          mostrarToast('Ya tienes todas las vidas ❤️');
          return false;
        }
        const ok = await comprarCorazon();
        if (ok) mostrarToast('❤️ +1 Vida recuperada');
        else mostrarToast('No se pudo comprar (límite o monedas)');
        return ok;
      },
    },
    {
      id: 'tiquete_oro',
      nombre: 'Tiquete de Oro',
      icono: '🎫',
      descripcion: 'Ábrelo y recibe un cofre de oro con un santo legendario.',
      precio: 350,
      rareza: 'epico',
      tipo: 'consumible',
      action: async () => {
        const ok = await abrirCofreOro();
        if (ok) mostrarToast('🎫 ¡Cofre de Oro abierto!');
        else mostrarToast('Error al abrir el cofre');
        return ok;
      },
    },
    {
      id: 'pocion_sabiduria',
      nombre: 'Poción de Sabiduría',
      icono: '🧪',
      descripcion: 'Elimina opciones incorrectas en una pregunta.',
      precio: 150,
      rareza: 'comun',
      tipo: 'consumible',
      action: async () => {
        // La compra normal la maneja comprarItem (añade al inventario)
        return true;
      },
    },
    {
      id: 'doble_xp',
      nombre: 'Doble XP',
      icono: '⚡',
      descripcion: 'Duplica monedas en lecciones por 10 min (próximamente)',
      precio: 150,
      rareza: 'raro',
      tipo: 'consumible',
      action: async () => {
        mostrarToast('⚡ Próximamente: Doble XP activo');
        return false;
      },
    },
  ];

  // Catálogo de objetos cosméticos (personalización)
  const cosmeticos = [
    {
      id: 'titulo_guardian',
      nombre: 'Título: Guardián del Credo',
      icono: '⚜️',
      descripcion: 'Cambia tu rango a "Guardián del Credo".',
      precio: 500,
      rareza: 'epico',
      tipo: 'cosmetico',
    },
    {
      id: 'titulo_maestro',
      nombre: 'Título: Maestro de la Fe',
      icono: '👑',
      descripcion: 'El rango más alto. Cambia tu título.',
      precio: 800,
      rareza: 'legendario',
      tipo: 'cosmetico',
    },
    {
      id: 'aura_santidad',
      nombre: 'Aura de Santidad',
      icono: '✨',
      descripcion: 'Efecto visual brillante en tu perfil y ranking.',
      precio: 300,
      rareza: 'raro',
      tipo: 'cosmetico',
    },
    {
      id: 'marco_vitral_azul',
      nombre: 'Marco Vitral Azul',
      icono: '🔵',
      descripcion: 'Borde artístico azul para tu avatar.',
      precio: 250,
      rareza: 'raro',
      tipo: 'cosmetico',
    },
    {
      id: 'marco_vitral_dorado',
      nombre: 'Marco Vitral Dorado',
      icono: '🟡',
      descripcion: 'Borde artístico dorado para tu avatar.',
      precio: 400,
      rareza: 'epico',
      tipo: 'cosmetico',
    },
  ];

  const ofertaDiaria = obtenerOfertaDiaria();

 const handleCompra = async (item) => {
    if (comprando) return;
    setComprando(item.id);

    let ok = false;
    if (item.action) {
      ok = await item.action();
    } else {
      if (monedas < item.precio) {
        mostrarToast(`🪙 Necesitas ${item.precio - monedas} monedas más`);
        setComprando(null);
        return;
      }
      await sumarMonedas(-item.precio);
      ok = await comprarItem(item);
    }

    setComprando(null);
    if (ok) {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 }, colors: ['#facc15', '#fff'] });
      mostrarToast(`✅ ${item.nombre} obtenido`);
    } else {
      mostrarToast('No se pudo completar la compra');
    }
  };

  const yaTiene = (id) => inventario.includes(id);

  return (
    <div className="py-6 space-y-6 animate-slide-up">
      {toast && <Toast mensaje={toast} />}

      {/* Header con monedas */}
      <div className="glass-card rounded-3xl p-5 text-center border border-white/10">
        <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Tu balance</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-3xl">🪙</span>
          <span className="text-4xl font-black text-yellow-400">{monedas}</span>
        </div>
        <p className="text-white/30 text-[10px] mt-1">Compra objetos para personalizar tu experiencia</p>
      </div>

      {/* Oferta diaria */}
      {ofertaDiaria && (
        <div className="glass-card rounded-3xl p-5 border-2 border-yellow-400/50 bg-gradient-to-r from-yellow-400/10 to-amber-400/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl animate-pulse">🔥</span>
            <p className="text-yellow-400 font-black text-xs uppercase tracking-widest">Oferta del día</p>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{ofertaDiaria.icono}</span>
              <div>
                <h3 className="font-black text-white text-sm">{ofertaDiaria.nombre}</h3>
                <p className="text-white/40 text-[10px]">{ofertaDiaria.descripcion}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs line-through">{ofertaDiaria.precioOriginal} 🪙</p>
              <button
                onClick={() => handleCompra({ ...ofertaDiaria, precio: ofertaDiaria.precioOferta, action: async () => await comprarItem({ ...ofertaDiaria, precio: ofertaDiaria.precioOferta }) })}
                className="bg-yellow-400 text-blue-900 px-5 py-2 rounded-xl font-black text-sm hover:scale-105 transition-all shadow-lg"
              >
                {ofertaDiaria.precioOferta} 🪙
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Consumibles */}
      <div>
        <h3 className="text-white/70 font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>⚡</span> Consumibles
        </h3>
        <div className="space-y-3">
          {consumibles.map((item) => {
            const yaCompradoConsumible = item.id === 'corazon_extra' ? false : yaTiene(item.id);
            return (
              <div key={item.id} className={`glass-card rounded-3xl p-4 border ${RAREZA_CLASES[item.rareza]} transition-all hover:scale-[1.01]`}>
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{item.icono}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-white text-sm">{item.nombre}</h4>
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-white/10 text-white/60">{item.rareza}</span>
                    </div>
                    <p className="text-white/40 text-xs">{item.descripcion}</p>
                    {item.id === 'corazon_extra' && corazonesCompradosHoy >= 3 && (
                      <p className="text-orange-400 text-[9px] font-black mt-1">Límite diario alcanzado</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleCompra(item)}
                    disabled={yaCompradoConsumible || (item.id === 'corazon_extra' && vidas >= 5) || (item.id === 'corazon_extra' && corazonesCompradosHoy >= 3)}
                    className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${
                      yaCompradoConsumible
                        ? 'bg-white/5 text-white/20 cursor-not-allowed'
                        : 'bg-yellow-400 text-blue-900 hover:scale-105 shadow-md'
                    }`}
                  >
                    {yaCompradoConsumible ? '✓' : `${item.precio} 🪙`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Personalización */}
      <div>
        <h3 className="text-white/70 font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>✨</span> Personalización
        </h3>
        <div className="space-y-3">
          {cosmeticos.map((item) => {
            const equipado = yaTiene(item.id);
            return (
              <div key={item.id} className={`glass-card rounded-3xl p-4 border ${RAREZA_CLASES[item.rareza]} transition-all hover:scale-[1.01]`}>
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{item.icono}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-white text-sm">{item.nombre}</h4>
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-white/10 text-white/60">{item.rareza}</span>
                    </div>
                    <p className="text-white/40 text-xs">{item.descripcion}</p>
                    {equipado && <p className="text-green-400 text-[9px] font-black mt-1">✓ Equipado</p>}
                  </div>
                  <button
                    onClick={() => handleCompra(item)}
                    disabled={equipado}
                    className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${
                      equipado
                        ? 'bg-white/5 text-white/20 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 shadow-md'
                    }`}
                  >
                    {equipado ? '✓' : `${item.precio} 🪙`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-center text-white/20 text-[9px] font-black uppercase tracking-[0.3em] pb-4">
        Los objetos cosméticos se aplican automáticamente
      </p>
    </div>
  );
};

export default Tienda;